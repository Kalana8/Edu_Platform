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
    const { studentId } = body;

    if (!studentId || typeof studentId !== "string" || !studentId.trim()) {
      return NextResponse.json(
        { error: "Student ID is required." },
        { status: 400 }
      );
    }

    const trimmedId = studentId.trim();
    const idParts = trimmedId.split("-");
    const lastPart = idParts[idParts.length - 1] ?? trimmedId;
    const displayName = `Student ${lastPart}`;

    const supabase = createAdminClient();

    const { data: existing, error: existingError } = await supabase
      .from("students")
      .select("id")
      .eq("student_id", trimmedId)
      .neq("id", user.id)
      .maybeSingle();

    if (existingError) {
      console.error("Student ID check error:", existingError);
      return NextResponse.json(
        { error: "Unable to verify student ID." },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "This student ID is already taken." },
        { status: 409 }
      );
    }

    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .update({
        student_id: trimmedId,
        name: displayName,
      })
      .eq("id", user.id)
      .select("id, student_id, name, school_id, total_credits, available_credits, withheld_credits")
      .single();

    if (studentError || !studentData) {
      console.error("Profile update error:", studentError);
      return NextResponse.json(
        { error: studentError?.message || "Unable to update profile." },
        { status: 500 }
      );
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
    console.error("Customize id error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
