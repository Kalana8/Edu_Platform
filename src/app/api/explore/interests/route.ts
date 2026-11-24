import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function readSlug(request: NextRequest): Promise<string | null> {
  try {
    const { subjectSlug } = await request.json();
    return typeof subjectSlug === "string" && subjectSlug.length <= 120 ? subjectSlug : null;
  } catch {
    return null;
  }
}

/** Save a subject to the student's interests. Body: { subjectSlug } */
export async function POST(request: NextRequest) {
  const auth = await requireRole("student");
  if (auth.error) return auth.error;
  const subjectSlug = await readSlug(request);
  if (!subjectSlug) return NextResponse.json({ error: "subjectSlug is required." }, { status: 400 });

  const { error } = await createAdminClient()
    .from("explore_saved_interests")
    .upsert({ user_id: auth.user.id, subject_slug: subjectSlug }, { onConflict: "user_id,subject_slug", ignoreDuplicates: true });

  if (error) {
    // 23503 = foreign key violation → unknown subject
    if (error.code === "23503") return NextResponse.json({ error: "Subject not found." }, { status: 404 });
    console.error("Save interest error:", error);
    return NextResponse.json({ error: "Unable to save interest." }, { status: 500 });
  }
  return NextResponse.json({ saved: true });
}

/** Remove a subject from the student's interests. Body: { subjectSlug } */
export async function DELETE(request: NextRequest) {
  const auth = await requireRole("student");
  if (auth.error) return auth.error;
  const subjectSlug = await readSlug(request);
  if (!subjectSlug) return NextResponse.json({ error: "subjectSlug is required." }, { status: 400 });

  const { error } = await createAdminClient()
    .from("explore_saved_interests")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("subject_slug", subjectSlug);

  if (error) {
    console.error("Remove interest error:", error);
    return NextResponse.json({ error: "Unable to remove interest." }, { status: 500 });
  }
  return NextResponse.json({ saved: false });
}
