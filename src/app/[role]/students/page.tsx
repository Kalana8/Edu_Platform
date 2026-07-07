import { Suspense } from "react";
import StudentsPage from "@/components/StudentsPage";
import { createAdminClient } from "@/lib/supabase/admin";

export type StudentServerItem = {
  id: string;
  name: string;
  email: string;
  studentId: string;
  school: string;
  schoolId: string | null;
  totalCredits: number;
  availableCredits: number;
  withheldCredits: number;
  isActive: boolean;
};

async function fetchStudents() {
  const supabase = createAdminClient();

  const { data: studentsData, error: studentsError } = await supabase
    .from("students")
    .select("id, student_id, name, school_id, total_credits, available_credits, withheld_credits")
    .order("name", { ascending: true });

  if (studentsError) {
    console.error("Student fetch error:", studentsError);
    return [];
  }

  const { data: schoolsData, error: schoolsError } = await supabase
    .from("schools")
    .select("id, name")
    .order("name", { ascending: true });

  if (schoolsError) {
    console.error("School fetch error:", schoolsError);
    return [];
  }

  const studentIds = (studentsData ?? []).map((student) => student.id);

  let usersEmailMap: Record<string, string> = {};

  if (studentIds.length > 0) {
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, email")
      .eq("role", "student")
      .in("id", studentIds);

    if (!usersError && usersData) {
      usersEmailMap = Object.fromEntries(usersData.map((user) => [user.id, user.email]));
    }
  }

  const schoolsById = Object.fromEntries((schoolsData ?? []).map((school) => [school.id, school.name]));

  return (studentsData ?? []).map((student) => ({
    id: student.id,
    name: student.name,
    email: usersEmailMap[student.id] ?? "",
    studentId: student.student_id,
    schoolId: student.school_id,
    school: student.school_id ? schoolsById[student.school_id] ?? "Unassigned" : "Unassigned",
    totalCredits: student.total_credits ?? 0,
    availableCredits: student.available_credits ?? 0,
    withheldCredits: student.withheld_credits ?? 0,
    isActive: true,
  }));
}

async function fetchSchools() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("schools")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("School fetch error:", error);
    return [];
  }

  return (data ?? []).map((school) => ({
    id: school.id,
    name: school.name,
  }));
}

export default async function RoleStudentsPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const roleLabel = role === "moderator" ? "Moderator" : "Admin";

  const students = await fetchStudents();
  const schools = await fetchSchools();

  return <StudentsPage role={roleLabel} basePath={`/${role}`} students={students} schools={schools} />;
}
