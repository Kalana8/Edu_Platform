import Link from "next/link";
import { redirect } from "next/navigation";
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

  if (!user || user.role !== "student") {
    redirect("/");
  }
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
    <div className="min-h-[844px] bg-slate-100 text-slate-950 ">
      <main className="mx-auto flex min-h-[844px] w-full max-w-[450px] flex-col gap-4 ">
        <section className="overflow-hidden bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 px-5 py-15 text-white shadow-lg shadow-slate-950/10">
          <div className="flex flex-col gap-3">
            <div>
              {greeting && <p className="uppercase tracking-[0.24em] text-sky-100/80">{greeting}</p>}
            </div>
          </div>
        </section>

        <section className="mx-5 rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-xl">

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-100">
            Continue Learning
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            {totalPagesRead} Pages Read
          </h2>

          <p className="mt-2 text-sm text-blue-100">
            You're making great progress. Keep reading to earn more learning credits.
          </p>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs text-blue-100">
              <span>Today's Goal</span>
              <span>{Math.min(totalPagesRead, 100)}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${Math.min(totalPagesRead, 100)}%` }}
              />
            </div>
          </div>

          <Link
            href="/choose-category"
            className="mt-6 flex items-center justify-center rounded-2xl bg-white py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Continue Reading →
          </Link>

        </section>

        <section className="mx-5 mt-5 grid grid-cols-2 gap-4">

          <div className="rounded-3xl bg-white p-5 shadow-sm">

            <div className="text-3xl">
              ⭐
            </div>

            <p className="mt-3 text-xs uppercase tracking-widest text-slate-500">
              Learning Credits
            </p>

            <p className="mt-2 text-4xl font-bold text-slate-900">
              {availableCredits}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Ready to redeem
            </p>

          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">

            <div className="text-3xl">
              🔒
            </div>

            <p className="mt-3 text-xs uppercase tracking-widest text-slate-500">
              Withheld
            </p>

            <p className="mt-2 text-4xl font-bold text-amber-600">
              {withheldCredits}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Total Earned: {totalCredits}
            </p>

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
