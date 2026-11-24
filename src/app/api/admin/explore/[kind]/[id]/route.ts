import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { KIND_TABLE, isContentKind, parseContent, rowToAdmin, type ContentKind } from "@/lib/explore/admin";

type Ctx = { params: Promise<{ kind: string; id: string }> };

/** Replace an item. The slug / ID itself can't be changed (other tables reference it). Admin only. */
export async function PUT(request: NextRequest, { params }: Ctx) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;
  const { kind, id } = await params;
  if (!isContentKind(kind)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = parseContent(kind, body, id);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { table, key } = KIND_TABLE[kind];
  const { data, error } = await createAdminClient().from(table).update(parsed.row).eq(key, id).select("*");
  if (error) {
    if (error.code === "23503") return NextResponse.json({ error: "The selected subject doesn't exist." }, { status: 400 });
    console.error(`Admin explore ${kind} update error:`, error);
    return NextResponse.json({ error: "Unable to save." }, { status: 500 });
  }
  if (!data.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ item: rowToAdmin(kind, data[0]) });
}

/** What still points at an item, so deleting it would also delete learner work. */
async function dependents(kind: ContentKind, id: string): Promise<string[]> {
  const supabase = createAdminClient();
  const count = async (table: string, column: string) => {
    const { count } = await supabase.from(table).select("*", { count: "exact", head: true }).eq(column, id);
    return count ?? 0;
  };

  const found: string[] = [];
  if (kind === "subjects") {
    const [labs, posts, saves] = await Promise.all([
      count("explore_lab_projects", "subject_slug"),
      count("explore_community_posts", "subject_slug"),
      count("explore_saved_interests", "subject_slug"),
    ]);
    if (labs) found.push(`${labs} lab project${labs === 1 ? "" : "s"}`);
    if (posts) found.push(`${posts} community post${posts === 1 ? "" : "s"}`);
    if (saves) found.push(`saved by ${saves} student${saves === 1 ? "" : "s"}`);
  } else if (kind === "labs") {
    const progress = await count("explore_project_progress", "project_id");
    if (progress) found.push(`progress from ${progress} student${progress === 1 ? "" : "s"}`);
  }
  return found;
}

/** Delete an item. Refused while learner data depends on it — unpublish instead. Admin only. */
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;
  const { kind, id } = await params;
  if (!isContentKind(kind)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  try {
    const blockers = await dependents(kind, id);
    if (blockers.length)
      return NextResponse.json(
        { error: `Can't delete: it has ${blockers.join(", ")}. Unpublish it instead to hide it from students.` },
        { status: 409 },
      );

    const { table, key } = KIND_TABLE[kind];
    const { data, error } = await createAdminClient().from(table).delete().eq(key, id).select(key);
    if (error) throw error;
    if (!data.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error(`Admin explore ${kind} delete error:`, error);
    return NextResponse.json({ error: "Unable to delete." }, { status: 500 });
  }
}
