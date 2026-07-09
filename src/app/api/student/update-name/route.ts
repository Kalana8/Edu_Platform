import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionUserStr = cookieStore.get("session_user")?.value;
  if (!sessionUserStr) return null;
  try {
    return JSON.parse(sessionUserStr);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const supabase = createAdminClient();

    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .update({ name: trimmedName })
      .eq("id", user.id)
      .select("id, student_id, name, school_id, total_credits, available_credits, withheld_credits")
      .single();

    if (studentError || !studentData) {
      console.error("Profile name update error:", studentError);
      return NextResponse.json(
        { error: studentError?.message || "Unable to update name." },
        { status: 500 }
      );
    }

    const { error: userError } = await supabase
      .from("users")
      .update({ name: trimmedName })
      .eq("id", user.id);

    if (userError) {
      console.error("User name update error:", userError);
    }

    return NextResponse.json(
      {
        student: {
          id: studentData.id,
          name: studentData.name,
          studentId: studentData.student_id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update name error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
