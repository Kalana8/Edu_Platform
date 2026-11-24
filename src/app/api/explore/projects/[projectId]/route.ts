import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PROGRESS_COLUMNS, toProjectState } from "@/lib/explore/mappers";
import type { ProjectAction } from "@/lib/explore/store-types";

interface ProgressRow {
  started: boolean;
  completed_steps: string[];
  submission_summary: string | null;
  submission_link: string | null;
  submitted_at: string | null;
  review_status: "pending" | "verified" | "returned" | null;
  review_feedback: string | null;
}

const EMPTY: ProgressRow = {
  started: false,
  completed_steps: [],
  submission_summary: null,
  submission_link: null,
  submitted_at: null,
  review_status: null,
  review_feedback: null,
};

/**
 * Apply one lab action for the signed-in student and return the new ProjectState.
 * Body: { action: "start" | "toggleStep" | "submit" | "withdraw" | "reset", stepId?, summary?, link? }
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const auth = await requireRole("student");
  if (auth.error) return auth.error;
  const { projectId } = await params;

  let body: ProjectAction;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data: project, error: projectError } = await supabase
      .from("explore_lab_projects")
      .select("steps")
      .eq("id", projectId)
      .eq("is_published", true)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) return NextResponse.json({ error: "Lab project not found." }, { status: 404 });

    const { data: existing, error: existingError } = await supabase
      .from("explore_project_progress")
      .select(PROGRESS_COLUMNS)
      .eq("user_id", auth.user.id)
      .eq("project_id", projectId)
      .maybeSingle();
    if (existingError) throw existingError;

    const current: ProgressRow = existing ?? EMPTY;
    const locked = !!current.submitted_at;
    let next: Partial<ProgressRow>;

    switch (body?.action) {
      case "start":
        next = { started: true };
        break;

      case "toggleStep": {
        const stepIds: string[] = (project.steps ?? []).map((s: { id: string }) => s.id);
        if (!stepIds.includes(body.stepId)) return NextResponse.json({ error: "Unknown step." }, { status: 400 });
        if (locked) return NextResponse.json({ error: "Withdraw your submission to change steps." }, { status: 409 });
        const done = new Set(current.completed_steps ?? []);
        if (done.has(body.stepId)) done.delete(body.stepId);
        else done.add(body.stepId);
        next = { started: true, completed_steps: stepIds.filter((id) => done.has(id)) };
        break;
      }

      case "submit": {
        const summary = typeof body.summary === "string" ? body.summary.trim() : "";
        const link = typeof body.link === "string" ? body.link.trim() : "";
        if (summary.length < 20 || summary.length > 5000)
          return NextResponse.json({ error: "Please describe your work in 20–5000 characters." }, { status: 400 });
        if (link && (!/^https?:\/\/\S+$/i.test(link) || link.length > 500))
          return NextResponse.json({ error: "Links must start with http:// or https://" }, { status: 400 });
        next = {
          started: true,
          submission_summary: summary,
          submission_link: link || null,
          submitted_at: new Date().toISOString(),
          review_status: "pending",
          review_feedback: null,
        };
        break;
      }

      case "withdraw":
        if (current.review_status === "verified")
          return NextResponse.json({ error: "Verified work can't be withdrawn." }, { status: 409 });
        next = { submission_summary: null, submission_link: null, submitted_at: null, review_status: null, review_feedback: null };
        break;

      case "reset":
        if (current.review_status === "verified")
          return NextResponse.json({ error: "Verified work can't be reset." }, { status: 409 });
        next = EMPTY;
        break;

      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }

    const { data: saved, error: saveError } = await supabase
      .from("explore_project_progress")
      .upsert({ ...current, ...next, user_id: auth.user.id, project_id: projectId }, { onConflict: "user_id,project_id" })
      .select(PROGRESS_COLUMNS)
      .single();
    if (saveError) throw saveError;

    return NextResponse.json({ state: toProjectState(saved) });
  } catch (error) {
    console.error("Lab progress error:", error);
    return NextResponse.json({ error: "Unable to save your lab progress." }, { status: 500 });
  }
}
