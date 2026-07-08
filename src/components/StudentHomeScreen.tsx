import Link from "next/link";
import BottomBar from "@/components/BottomBar";
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

export default async function StudentHomeScreen() {
  const user = await getSessionUser();

  let schoolName = "Unassigned School";
  let schoolTier = "N/A";
  let availableCredits = 0;
  let withheldCredits = 0;
  let totalCredits = 0;
  let activeReadingCount = 0;
  let totalPagesRead = 0;
  let activeContentTitle = "";
  let studentName = "";
  let studentId = "";

  if (user && user.role === "student") {
    const supabase = createAdminClient();

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("student_id, name, school_id, total_credits, available_credits, withheld_credits")
      .eq("id", user.id)
      .maybeSingle();

    if (studentError) {
      console.error("Student fetch error:", studentError);
    } else if (student) {
      studentName = student.name ?? "";
      studentId = student.student_id ?? "";
      totalCredits = student.total_credits ?? 0;
      availableCredits = student.available_credits ?? 0;
      withheldCredits = student.withheld_credits ?? 0;

      if (student.school_id) {
        const { data: school, error: schoolError } = await supabase
          .from("schools")
          .select("name, tier")
          .eq("id", student.school_id)
          .maybeSingle();

        if (schoolError) {
          console.error("School fetch error:", schoolError);
        } else if (school) {
          schoolName = school.name;
          schoolTier = school.tier;
        }
      }
    } else {
      console.warn("No student profile found for user:", user.id);
    }

    const { data: progressItems, error: progressError } = await supabase
      .from("reading_progress")
      .select("pages_read, is_completed, content_id")
      .eq("user_id", user.id);

    if (progressError) {
      console.error("Reading progress fetch error:", progressError);
    }

    const activeItems = (progressItems ?? []).filter((p) => !p.is_completed);
    activeReadingCount = activeItems.length;
    totalPagesRead = (progressItems ?? []).reduce((sum, p) => sum + (p.pages_read ?? 0), 0);

    if (activeItems.length > 0) {
      const firstContentId = activeItems[0].content_id;
      const { data: firstContent } = await supabase
        .from("content")
        .select("title")
        .eq("id", firstContentId)
        .maybeSingle();
      activeContentTitle = firstContent?.title ?? "";
    }
  }

  const taskPages = activeReadingCount > 0 && activeContentTitle
    ? `Continue "${activeContentTitle}"`
    : "Start Reading";

  const greeting = studentName ? `Hello, ${studentName}` : "";

  return (
    <div className="min-h-[844px] bg-slate-100 text-slate-950 pb-24">
      <main className="mx-auto flex min-h-[844px] w-full max-w-[390px] flex-col gap-4 px-4 pb-6">
        <section className="overflow-hidden bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-slate-950/10">
          <div className="flex flex-col gap-3">
            <div>
              {greeting && <p className="text-sm uppercase tracking-[0.24em] text-sky-100/80">{greeting}</p>}
              <p className="text-sm uppercase tracking-[0.24em] text-sky-100/80">{schoolName}</p>
              <h1 className="mt-2 text-3xl font-semibold">{schoolName}</h1>
              <p className="mt-1 text-sm text-sky-100/90">Tier: {schoolTier}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] bg-white p-5 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Today&apos;s Task</p>
                <h2 className="text-2xl font-semibold text-slate-950">{taskPages}</h2>
              </div>
              <p className="text-sm font-medium text-slate-500">Progress: {totalPagesRead} pages</p>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.min(totalPagesRead, 100)}%` }} />
            </div>

            <Link
              href="/choose-category"
              className="inline-flex w-full items-center justify-center rounded-3xl bg-blue-600 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Choose Category & Start Reading
            </Link>
          </div>
        </section>

        <section className="grid gap-4 grid-cols-1">
          <div className="rounded-[1.75rem] bg-white p-4 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
            <p className="text-sm text-slate-500">Available Credits</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{availableCredits}</p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-4 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
            <p className="text-sm text-slate-500">Withhold (Locked)</p>
            <p className="mt-3 text-3xl font-semibold text-amber-600">{withheldCredits}</p>
            <p className="mt-2 text-sm text-slate-500">Total: {totalCredits}</p>
          </div>
        </section>

        {!user && (
          <div className="rounded-[1.75rem] bg-slate-100 p-4 text-sm text-slate-600 text-center">
            <p className="font-medium text-slate-900">Not signed in</p>
            <p className="mt-1">Sign in through your school portal to view your credits and progress.</p>
          </div>
        )}

        {user?.role !== "student" && user && (
          <div className="rounded-[1.75rem] bg-amber-50 p-4 text-sm text-amber-700">
            You are viewing the student home as a {user?.role || "guest"} account. Student-specific data is only visible to student accounts.
          </div>
        )}

        <BottomBar />
      </main>
    </div>
  );
}
