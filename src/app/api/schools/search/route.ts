import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_RESULTS = 8;

/** Public school lookup for the join flow: active schools whose name or code contains `q`. */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);

  if (q.length < 2) {
    return NextResponse.json({ schools: [] });
  }

  // Drop ilike wildcards and PostgREST filter syntax so the query is plain text.
  const clean = q.replace(/[%_\\,()"*]/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length < 2) {
    return NextResponse.json({ schools: [] });
  }
  const pattern = `"%${clean}%"`;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("schools")
      .select("code, name, location, tier")
      .eq("is_active", true)
      .or(`name.ilike.${pattern},code.ilike.${pattern}`)
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
