import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

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
    const { contentId, userAnswers, questions } = body;

    if (!contentId || typeof userAnswers !== "object" || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "contentId, userAnswers, and questions are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    let answeredCount = 0;
    let correctCount = 0;

    for (const q of questions) {
      const userAnswer = userAnswers[q.id];
      if (typeof userAnswer === "undefined" || userAnswer === null || userAnswer === "") {
        continue;
      }
      const correctOptionId = q.options?.[q.correctIndex]?.id;
      answeredCount += 1;
      if (userAnswer === correctOptionId) {
        correctCount += 1;
      }
    }

    const passed = true;
    const earnedCredits = correctCount * 5;
    const availableEarned = Math.round(earnedCredits * 0.7);
    const withheldEarned = earnedCredits - availableEarned;
    const schoolPoints = correctCount * 8;

    if (earnedCredits > 0) {
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("available_credits, total_credits, withheld_credits, school_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!studentError && student) {
        const newAvailable = (student.available_credits ?? 0) + availableEarned;
        const newTotal = (student.total_credits ?? 0) + earnedCredits;
        const newWithheld = (student.withheld_credits ?? 0) + withheldEarned;

        const { error: updateError } = await supabase
          .from("students")
          .update({
            available_credits: newAvailable,
            total_credits: newTotal,
            withheld_credits: newWithheld,
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Quiz credit update error:", updateError);
        }

        if (student.school_id) {
          const { data: school, error: schoolError } = await supabase
            .from("schools")
            .select("total_points")
            .eq("id", student.school_id)
            .maybeSingle();

          if (!schoolError && school) {
            const { error: schoolUpdateError } = await supabase
              .from("schools")
              .update({ total_points: (school.total_points ?? 0) + schoolPoints })
              .eq("id", student.school_id);

            if (schoolUpdateError) {
              console.error("School points update error:", schoolUpdateError);
            }
          }
        }
      }
    }

    return NextResponse.json(
      {
        score: correctCount,
        total: questions.length,
        answered: answeredCount,
        passed,
        earnedCredits,
        availableEarned,
        withheldEarned,
        schoolPoints,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Quiz submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
