import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const schoolId = (body?.schoolId || "").toString().trim();
    
    if (!schoolId) {
      return NextResponse.json({ exists: false, error: "missing_school_id" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("schools")
      .select("id, name, tier, code")
      .ilike("code", schoolId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ exists: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json({ exists: true, school: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ exists: false, error: String(err) }, { status: 500 });
  }
}
