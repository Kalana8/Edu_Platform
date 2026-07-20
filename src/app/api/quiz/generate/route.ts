import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { ai } from "@/lib/gemini";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionUserStr = cookieStore.get("session_user")?.value;
  if (!sessionUserStr) return null;
  try {
    return JSON.parse(sessionUserStr);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { contentId } = body;

    if (typeof contentId !== "string" || contentId.trim() === "") {
      return NextResponse.json({ error: "contentId is required." }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: progressData } = await supabase
      .from("reading_progress")
      .select("pages_read")
      .eq("user_id", user.id)
      .eq("content_id", contentId)
      .maybeSingle();

    const pagesRead = progressData?.pages_read ?? 0;
    const windowStart = pagesRead >= 2 ? pagesRead - 1 : 1;

    const { data: pagesData, error: pagesError } = await supabase
      .from("content_pages")
      .select("page_number, content")
      .eq("content_id", contentId)
      .gte("page_number", windowStart)
      .lte("page_number", windowStart + 1)
      .order("page_number", { ascending: true });

    if (pagesError) {
      console.error("Quiz pages fetch error:", pagesError);
      return NextResponse.json(
        { error: "Unable to load content for quiz." },
        { status: 500 }
      );
    }

    if (!pagesData || pagesData.length < 2) {
      return NextResponse.json(
        { error: "Not enough content to generate quiz." },
        { status: 400 }
      );
    }

    const pageTexts = pagesData
      .map((page) => `Page ${page.page_number}:\n${page.content}`)
      .join("\n\n");

    const prompt = `You are an educational quiz generator. Based on the provided reading material, generate exactly 5 multiple-choice questions. Each question must have exactly 4 options labeled a, b, c, d. Mark the correct answer. Return ONLY valid JSON in this format: { "questions": [ { "question": "...", "options": [{"id": "a", "text": "..."}, {"id": "b", "text": "..."}, {"id": "c", "text": "..."}, {"id": "d", "text": "..."}], "correctIndex": 0 } ] }. Ensure correctIndex is 0-based matching the options array.

Generate a quiz based on this reading material:

${pageTexts}`;

    type GenerateResult = Awaited<ReturnType<typeof ai.models.generateContent>>;
    const generateWithRetry = async (maxRetries = 3): Promise<GenerateResult> => {
      let attempt = 0;
      while (true) {
        try {
          return await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });
        } catch (err) {
          const apiError = err as { status?: number; message?: string };
          const isRateLimit = apiError?.status === 429 ||
            /RESOURCE_EXHAUSTED|exceeded your current quota/i.test(apiError?.message ?? "");
          if (!isRateLimit || attempt >= maxRetries) throw err;

          const retryDelayMatch = /retryDelay":"?(\d+(?:\.\d+)?)s/i.exec(apiError?.message ?? "");
          const waitMs = retryDelayMatch
            ? Math.min(Number(retryDelayMatch[1]) * 1000, 60000)
            : Math.min(2000 * Math.pow(2, attempt), 60000);

          attempt += 1;
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
      }
    };

    let response: GenerateResult;
    try {
      response = await generateWithRetry();
    } catch (err) {
      const apiError = err as { status?: number; message?: string };
      const isQuota = apiError?.status === 429 ||
        /RESOURCE_EXHAUSTED|exceeded your current quota/i.test(apiError?.message ?? "");
      if (isQuota) {
        return NextResponse.json(
          {
            error:
              "The AI quiz service is temporarily out of quota. Please wait a moment and try again.",
          },
          { status: 503 }
        );
      }
      throw err;
    }

    const raw = response.text?.trim() || "{}";
    let parsed: { questions?: Array<Record<string, unknown>> };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Failed to generate quiz questions." },
        { status: 500 }
      );
    }

    const questions = (parsed.questions ?? []).slice(0, 5).map((q, idx) => ({
      id: `q-${idx + 1}`,
      question: typeof q.question === "string" ? q.question : `Question ${idx + 1}`,
      options: Array.isArray(q.options) && q.options.length === 4
        ? q.options.map((opt, i) => ({
            id: String.fromCharCode(97 + i),
            text: typeof opt.text === "string" ? opt.text : String.fromCharCode(65 + i),
          }))
        : [
            { id: "a", text: "Option A" },
            { id: "b", text: "Option B" },
            { id: "c", text: "Option C" },
            { id: "d", text: "Option D" },
          ],
      correctIndex: Number(q.correctIndex) >= 0 && Number(q.correctIndex) <= 3 ? Number(q.correctIndex) : 0,
    }));

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("Quiz generate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
