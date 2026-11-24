import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { POST_COLUMNS, toCommunityPost } from "@/lib/explore/mappers";

/**
 * Moderator queue for Explore: posts awaiting approval, posts with open reports,
 * and lab submissions awaiting mastery review.
 */
export async function GET() {
  const auth = await requireRole("moderator", "admin");
  if (auth.error) return auth.error;

  try {
    const supabase = createAdminClient();
    const [pending, reported, reports, submissions] = await Promise.all([
      supabase.from("explore_community_feed").select(POST_COLUMNS).eq("moderation", "pending").order("created_at"),
      supabase.from("explore_community_feed").select(`${POST_COLUMNS}, open_reports`).gt("open_reports", 0).order("open_reports", { ascending: false }),
      supabase.from("explore_post_reports").select("post_id, reason, created_at").eq("resolved", false),
      supabase
        .from("explore_project_progress")
        .select("user_id, project_id, completed_steps, submission_summary, submission_link, submitted_at, explore_lab_projects(title, steps), users!explore_project_progress_user_id_fkey(name)")
        .eq("review_status", "pending")
        .order("submitted_at"),
    ]);

    const failed = [pending, reported, reports, submissions].find((r) => r.error);
    if (failed?.error) throw failed.error;

    const reasonsByPost: Record<string, { reason: string | null; createdAt: string }[]> = {};
    for (const r of reports.data ?? []) (reasonsByPost[r.post_id] ??= []).push({ reason: r.reason, createdAt: r.created_at });

    return NextResponse.json({
      pendingPosts: (pending.data ?? []).map(toCommunityPost),
      reportedPosts: (reported.data ?? []).map((p) => ({
        ...toCommunityPost(p),
        openReports: p.open_reports,
        reports: reasonsByPost[p.id] ?? [],
      })),
      pendingSubmissions: (submissions.data ?? []).map((s) => {
        const project = s.explore_lab_projects as unknown as { title: string; steps: unknown[] } | null;
        const user = s.users as unknown as { name: string } | null;
        return {
          userId: s.user_id,
          studentName: user?.name ?? "Unknown student",
          projectId: s.project_id,
          projectTitle: project?.title ?? s.project_id,
          stepsCompleted: s.completed_steps?.length ?? 0,
          stepsTotal: project?.steps?.length ?? 0,
          summary: s.submission_summary,
          link: s.submission_link,
          submittedAt: s.submitted_at,
        };
      }),
    });
  } catch (error) {
    console.error("Explore moderation queue error:", error);
    return NextResponse.json({ error: "Unable to load the moderation queue." }, { status: 500 });
  }
}
