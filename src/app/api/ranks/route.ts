import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionUserStr = cookieStore.get("session_user")?.value;
  if (!sessionUserStr) return null;
  try {
    return JSON.parse(sessionUserStr);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const supabase = createAdminClient();

    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("id, school_id")
      .eq("id", user.id)
      .maybeSingle();

    if (studentError || !studentData) {
      console.error("Student fetch error:", studentError);
      return NextResponse.json(
        { error: "Unable to load student data." },
        { status: 500 }
      );
    }

    if (type === "students") {
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id, name, total_credits")
        .eq("school_id", studentData.school_id)
        .order("total_credits", { ascending: false })
        .limit(100);

      if (studentsError) {
        console.error("Student ranks fetch error:", studentsError);
        return NextResponse.json(
          { error: studentsError.message || "Unable to load student ranks." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          students: (studentsData ?? []).map((s) => ({
            id: s.id,
            name: s.name,
            totalCredits: s.total_credits ?? 0,
          })),
        },
        { status: 200 }
      );
    }

    const { data: schoolsData, error: schoolsError } = await supabase
      .from("schools")
      .select("id, name, tier, total_points")
      .order("total_points", { ascending: false });

    if (schoolsError) {
      console.error("School ranks fetch error:", schoolsError);
      return NextResponse.json(
        { error: schoolsError.message || "Unable to load school ranks." },
        { status: 500 }
      );
    }

    const allSchools = schoolsData ?? [];

    if (type === "tier" && studentData.school_id) {
      const userSchool = allSchools.find((s) => s.id === studentData.school_id);
      if (userSchool) {
        const filtered = allSchools.filter((s) => s.tier === userSchool.tier);
        return NextResponse.json(
          {
            schools: filtered.map((s) => ({
              id: s.id,
              name: s.name,
              tier: s.tier,
              points: s.total_points ?? 0,
            })),
            userSchoolId: studentData.school_id,
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      {
        schools: allSchools.map((s) => ({
          id: s.id,
          name: s.name,
          tier: s.tier,
          points: s.total_points ?? 0,
        })),
        userSchoolId: studentData.school_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ranks fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
