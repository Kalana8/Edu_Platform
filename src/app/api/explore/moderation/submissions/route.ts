import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Review a lab submission.
 * Body: { userId, projectId, decision: "verify" | "return", feedback? }
 * "return" sends it back to the student with feedback so they can withdraw, edit and resubmit.
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireRole("moderator", "admin");
  if (auth.error) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { userId, projectId, decision } = body;
  const feedback = typeof body.feedback === "string" ? body.feedback.trim().slice(0, 2000) : "";
  if (typeof userId !== "string" || typeof projectId !== "string")
    return NextResponse.json({ error: "userId and projectId are required." }, { status: 400 });
  if (decision !== "verify" && decision !== "return")
    return NextResponse.json({ error: "decision must be verify or return." }, { status: 400 });
  if (decision === "return" && !feedback)
    return NextResponse.json({ error: "Please give the student feedback when returning work." }, { status: 400 });

  const { data, error } = await createAdminClient()
    .from("explore_project_progress")
    .update({
      review_status: decision === "verify" ? "verified" : "returned",
      review_feedback: feedback || null,
      reviewed_by: auth.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .eq("review_status", "pending")
    .select("project_id");

  if (error) {
    console.error("Review submission error:", error);
    return NextResponse.json({ error: "Unable to save the review." }, { status: 500 });
  }
  if (!data?.length) return NextResponse.json({ error: "No pending submission found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
