import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { POST_COLUMNS, PROGRESS_COLUMNS, toCommunityPost, toProjectState } from "@/lib/explore/mappers";
import type { ExploreLearnerState, ProjectMap } from "@/lib/explore/store-types";

/** Everything the Explore client store needs for the signed-in student, in one request. */
export async function GET() {
  const auth = await requireRole("student");
  if (auth.error) return auth.error;
  const userId = auth.user.id;

  try {
    const supabase = createAdminClient();
    const [interests, progress, appreciated, reported, myPosts] = await Promise.all([
      supabase.from("explore_saved_interests").select("subject_slug").eq("user_id", userId).order("created_at"),
      supabase.from("explore_project_progress").select(PROGRESS_COLUMNS).eq("user_id", userId),
      supabase.from("explore_post_appreciations").select("post_id").eq("user_id", userId),
      supabase.from("explore_post_reports").select("post_id").eq("user_id", userId),
      supabase
        .from("explore_community_feed")
        .select(POST_COLUMNS)
        .eq("author_id", userId)
        .neq("moderation", "reviewed")
        .order("created_at", { ascending: false }),
    ]);

    const failed = [interests, progress, appreciated, reported, myPosts].find((r) => r.error);
    if (failed?.error) {
      console.error("Explore learner state error:", failed.error);
      return NextResponse.json({ error: "Unable to load your Explore progress." }, { status: 500 });
    }

    const projects: ProjectMap = {};
    for (const row of progress.data ?? []) projects[row.project_id] = toProjectState(row);

    const body: ExploreLearnerState = {
      savedInterests: (interests.data ?? []).map((r) => r.subject_slug),
      projects,
      appreciated: (appreciated.data ?? []).map((r) => r.post_id),
      reported: (reported.data ?? []).map((r) => r.post_id),
      myPosts: (myPosts.data ?? []).map(toCommunityPost),
    };
    return NextResponse.json(body);
  } catch (error) {
    console.error("Explore learner state error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
