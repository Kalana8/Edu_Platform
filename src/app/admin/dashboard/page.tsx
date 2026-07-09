import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboard() {
  let totalStudents = 0;
  let activeStudents = 0;
  let activeSchools = 0;

  try {
    const supabase = createAdminClient();

    const [studentsRes, schoolsRes, progressRes] = await Promise.all([
      supabase
        .from("students")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("schools")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),

      supabase.from("reading_progress").select("user_id"),
    ]);

    totalStudents = studentsRes.count ?? 0;
    activeSchools = schoolsRes.count ?? 0;

    const progressData = progressRes.data ?? [];
    activeStudents = new Set(progressData.map((p) => p.user_id)).size;
  } catch (error) {
    console.error("Failed to load dashboard stats", error);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <section className="mb-3">
        <div className="rounded-[1.75rem] bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 p-4 text-white shadow-lg sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-100 sm:text-sm">Active Students Right Now</p>
              <h3 className="mt-1 text-2xl font-bold sm:text-3xl">{activeStudents.toLocaleString()}</h3>
              <p className="text-xs text-sky-100/80 sm:text-sm opacity-90">out of {totalStudents.toLocaleString()} total students</p>
            </div>
            <div className="w-full sm:w-auto">
              <div className="rounded-2xl bg-white/10 px-4 py-2 text-center sm:text-left sm:px-4 sm:py-1.5">
                <span className="text-xl font-bold">{totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}</span>
                <span className="text-xs font-semibold text-sky-100/80 sm:text-sm">% active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        <div className="rounded-[1.5rem] bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 sm:text-sm">Total Students</p>
          <p className="mt-1 text-lg font-bold text-slate-950 sm:mt-2 sm:text-xl">{totalStudents.toLocaleString()}</p>
        </div>
        <div className="rounded-[1.5rem] bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 sm:text-sm">Active Students</p>
          <p className="mt-1 text-lg font-bold text-slate-950 sm:mt-2 sm:text-xl">{activeStudents.toLocaleString()}</p>
        </div>
        <div className="rounded-[1.5rem] bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 sm:text-sm">Active Schools</p>
          <p className="mt-1 text-lg font-bold text-slate-950 sm:mt-2 sm:text-xl">{activeSchools.toLocaleString()}</p>
        </div>
      </section>
    </div>
  );
}
