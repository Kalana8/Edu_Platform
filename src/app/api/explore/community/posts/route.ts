import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { POST_COLUMNS, toCommunityPost, toDisplayName } from "@/lib/explore/mappers";
import type { PostKind } from "@/lib/explore/types";

const KINDS: PostKind[] = ["showcase", "discovery", "explanation", "discussion"];
const CONTACT_DETAILS = /\b[\w.+-]+@[\w-]+\.[\w.]+\b|\+?\d[\d\s-]{7,}\d/;
const MAX_PENDING_POSTS = 5;

/**
 * Submit a community post for moderation. Body: { kind, subjectSlug, title, excerpt }
 * The post stays private to its author until a moderator approves it.
 */
export async function POST(request: NextRequest) {
  const auth = await requireRole("student");
  if (auth.error) return auth.error;

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const kind = input.kind as PostKind;
  const subjectSlug = typeof input.subjectSlug === "string" ? input.subjectSlug : "";
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const excerpt = typeof input.excerpt === "string" ? input.excerpt.trim() : "";

  if (!KINDS.includes(kind)) return NextResponse.json({ error: "Choose a contribution type." }, { status: 400 });
  if (title.length < 5 || title.length > 120)
    return NextResponse.json({ error: "Please add a title (5–120 characters)." }, { status: 400 });
  if (excerpt.length < 20 || excerpt.length > 1000)
    return NextResponse.json({ error: "Please describe your work (20–1000 characters)." }, { status: 400 });
  if (CONTACT_DETAILS.test(`${title} ${excerpt}`))
    return NextResponse.json({ error: "For your safety, please remove email addresses and phone numbers." }, { status: 400 });

  try {
    const supabase = createAdminClient();

    const [{ data: subject }, { data: user }, { count: pending }] = await Promise.all([
      supabase.from("explore_subjects").select("slug").eq("slug", subjectSlug).eq("status", "available").maybeSingle(),
      supabase.from("users").select("name").eq("id", auth.user.id).maybeSingle(),
      supabase
        .from("explore_community_posts")
        .select("id", { count: "exact", head: true })
        .eq("author_id", auth.user.id)
        .eq("moderation", "pending"),
    ]);

    if (!subject) return NextResponse.json({ error: "Choose an available subject." }, { status: 400 });
    if ((pending ?? 0) >= MAX_PENDING_POSTS)
      return NextResponse.json(
        { error: `You already have ${MAX_PENDING_POSTS} posts waiting for review. Please wait for a moderator.` },
        { status: 429 },
      );

    const { data, error } = await supabase
      .from("explore_community_posts")
      .insert({
        author_id: auth.user.id,
        kind,
        subject_slug: subjectSlug,
        title,
        excerpt,
        author_display: toDisplayName(user?.name),
        moderation: "pending",
      })
      .select("id")
      .single();
    if (error) throw error;

    const { data: post, error: readError } = await supabase
      .from("explore_community_feed")
      .select(POST_COLUMNS)
      .eq("id", data.id)
      .single();
    if (readError) throw readError;

    return NextResponse.json({ post: toCommunityPost(post) }, { status: 201 });
  } catch (error) {
    console.error("Create community post error:", error);
    return NextResponse.json({ error: "Unable to submit your post." }, { status: 500 });
  }
}
