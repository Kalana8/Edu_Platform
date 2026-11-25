import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_RESULTS = 8;

/** Public school lookup for the join flow: active schools whose name contains `q`. */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);

  if (q.length < 2) {
    return NextResponse.json({ schools: [] });
  }

  // Treat the query as literal text, not ilike wildcards.
  const pattern = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("schools")
      .select("code, name, location, tier")
      .eq("is_active", true)
      .ilike("name", pattern)
      .order("name", { ascending: true })
      .limit(MAX_RESULTS);

    if (error) {
      console.error("School search error:", error);
      return NextResponse.json({ error: "Unable to search schools." }, { status: 500 });
    }

    return NextResponse.json({ schools: data ?? [] });
  } catch (err) {
    console.error("School search error:", err);
    return NextResponse.json({ error: "Unable to search schools." }, { status: 500 });
  }
}
