import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ postId: string }> };

/** Report a post for moderator review. Body (optional): { reason } */
export async function POST(request: NextRequest, { params }: Ctx) {
  const auth = await requireRole("student");
  if (auth.error) return auth.error;
  const { postId } = await params;

  let reason: string | null = null;
  try {
    const body = await request.json();
    if (typeof body?.reason === "string") reason = body.reason.trim().slice(0, 500) || null;
  } catch {
    // reason is optional
  }

  const { error } = await createAdminClient()
    .from("explore_post_reports")
    .upsert({ user_id: auth.user.id, post_id: postId, reason, resolved: false }, { onConflict: "user_id,post_id" });

  if (error) {
    if (error.code === "23503") return NextResponse.json({ error: "Post not found." }, { status: 404 });
    console.error("Report post error:", error);
    return NextResponse.json({ error: "Unable to report the post." }, { status: 500 });
  }
  return NextResponse.json({ reported: true });
}

/** Undo a report that a moderator hasn't handled yet. */
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const auth = await requireRole("student");
  if (auth.error) return auth.error;
  const { postId } = await params;

  const { error } = await createAdminClient()
    .from("explore_post_reports")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("post_id", postId)
    .eq("resolved", false);

  if (error) {
    console.error("Undo report error:", error);
    return NextResponse.json({ error: "Unable to undo the report." }, { status: 500 });
  }
  return NextResponse.json({ reported: false });
}
