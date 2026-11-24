import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ postId: string }> };

async function setAppreciation(postId: string, on: boolean) {
  const auth = await requireRole("student");
  if (auth.error) return auth.error;
  const supabase = createAdminClient();

  if (on) {
    const { data: post } = await supabase
      .from("explore_community_posts")
      .select("id")
      .eq("id", postId)
      .eq("moderation", "reviewed")
      .maybeSingle();
    if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const { error } = on
    ? await supabase
        .from("explore_post_appreciations")
        .upsert({ user_id: auth.user.id, post_id: postId }, { onConflict: "user_id,post_id", ignoreDuplicates: true })
    : await supabase.from("explore_post_appreciations").delete().eq("user_id", auth.user.id).eq("post_id", postId);

  if (error) {
    console.error("Appreciation error:", error);
    return NextResponse.json({ error: "Unable to update appreciation." }, { status: 500 });
  }
  return NextResponse.json({ appreciated: on });
}

export async function POST(_request: NextRequest, { params }: Ctx) {
  return setAppreciation((await params).postId, true);
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  return setAppreciation((await params).postId, false);
}
