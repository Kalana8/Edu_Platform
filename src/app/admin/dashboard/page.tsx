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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6">
        <div className="rounded-[1.75rem] bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 p-5 text-white shadow-lg sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-100 sm:text-sm">Active Students Right Now</p>
              <h3 className="mt-2 text-3xl font-bold sm:text-4xl">{activeStudents.toLocaleString()}</h3>
              <p className="text-xs text-sky-100/80 sm:text-sm opacity-90">out of {totalStudents.toLocaleString()} total students</p>
            </div>
            <div className="w-full sm:w-auto">
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-center sm:text-left sm:px-5 sm:py-2">
                <span className="text-2xl font-bold">{totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}</span>
                <span className="text-xs font-semibold text-sky-100/80 sm:text-sm">% active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 sm:text-sm">Total Students</p>
          <p className="mt-2 text-xl font-bold text-slate-950 sm:mt-3 sm:text-2xl">{totalStudents.toLocaleString()}</p>
        </div>
        <div className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 sm:text-sm">Active Students</p>
          <p className="mt-2 text-xl font-bold text-slate-950 sm:mt-3 sm:text-2xl">{activeStudents.toLocaleString()}</p>
        </div>
        <div className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 sm:text-sm">Active Schools</p>
          <p className="mt-2 text-xl font-bold text-slate-950 sm:mt-3 sm:text-2xl">{activeSchools.toLocaleString()}</p>
        </div>
      </section>
    </div>
  );
}
