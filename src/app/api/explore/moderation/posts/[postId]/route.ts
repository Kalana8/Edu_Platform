import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Moderate a community post.
 * Body: { decision: "approve" | "reject" | "dismiss-reports" }
 * - approve: publish the post and close any open reports on it
 * - reject: hide the post (author still sees it as rejected) and close its reports
 * - dismiss-reports: keep the post as it is and close its open reports
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const auth = await requireRole("moderator", "admin");
  if (auth.error) return auth.error;
  const { postId } = await params;

  let decision: unknown;
  try {
    ({ decision } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (decision !== "approve" && decision !== "reject" && decision !== "dismiss-reports")
    return NextResponse.json({ error: "decision must be approve, reject or dismiss-reports." }, { status: 400 });

  try {
    const supabase = createAdminClient();

    if (decision !== "dismiss-reports") {
      const { data, error } = await supabase
        .from("explore_community_posts")
        .update({
          moderation: decision === "approve" ? "reviewed" : "rejected",
          moderated_by: auth.user.id,
          moderated_at: new Date().toISOString(),
        })
        .eq("id", postId)
        .select("id");
      if (error) throw error;
      if (!data?.length) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const { error: reportError } = await supabase
      .from("explore_post_reports")
      .update({ resolved: true })
      .eq("post_id", postId)
      .eq("resolved", false);
    if (reportError) throw reportError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Moderate post error:", error);
    return NextResponse.json({ error: "Unable to moderate the post." }, { status: 500 });
  }
}
