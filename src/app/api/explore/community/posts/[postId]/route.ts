import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/** Delete one of the student's own posts. */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const auth = await requireRole("student");
  if (auth.error) return auth.error;
  const { postId } = await params;

  const { data, error } = await createAdminClient()
    .from("explore_community_posts")
    .delete()
    .eq("id", postId)
    .eq("author_id", auth.user.id)
    .select("id");

  if (error) {
    console.error("Delete community post error:", error);
    return NextResponse.json({ error: "Unable to delete the post." }, { status: 500 });
  }
  if (!data?.length) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
