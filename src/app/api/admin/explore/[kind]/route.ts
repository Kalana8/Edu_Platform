import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { KIND_TABLE, isContentKind, parseContent, rowToAdmin } from "@/lib/explore/admin";

type Ctx = { params: Promise<{ kind: string }> };

/** List all subjects / labs / resources, including unpublished ones. Admins and moderators can read. */
export async function GET(_request: NextRequest, { params }: Ctx) {
  const auth = await requireRole("admin", "moderator");
  if (auth.error) return auth.error;
  const { kind } = await params;
  if (!isContentKind(kind)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { data, error } = await createAdminClient()
    .from(KIND_TABLE[kind].table)
    .select("*")
    .order("sort_order")
    .order("created_at");

  if (error) {
    console.error(`Admin explore ${kind} list error:`, error);
    return NextResponse.json({ error: `Unable to load ${kind}.` }, { status: 500 });
  }
  return NextResponse.json({ items: data.map((r) => rowToAdmin(kind, r)) });
}

/** Create an item. Admin only. */
export async function POST(request: NextRequest, { params }: Ctx) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;
  const { kind } = await params;
  if (!isContentKind(kind)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = parseContent(kind, body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await createAdminClient().from(KIND_TABLE[kind].table).insert(parsed.row).select("*").single();
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "That slug / ID is already in use." }, { status: 409 });
    if (error.code === "23503") return NextResponse.json({ error: "The selected subject doesn't exist." }, { status: 400 });
    console.error(`Admin explore ${kind} create error:`, error);
    return NextResponse.json({ error: "Unable to save." }, { status: 500 });
  }
  return NextResponse.json({ item: rowToAdmin(kind, data) }, { status: 201 });
}
