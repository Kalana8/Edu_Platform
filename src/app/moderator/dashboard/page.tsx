import { createAdminClient } from "@/lib/supabase/admin";

export default async function ModeratorDashboard() {
  let totalStudents = 0;
  let activeStudents = 0;
  let activeSchools = 0;
  let avgPerformance = 0;

  try {
    const supabase = createAdminClient();

    const [studentsRes, schoolsRes, progressRes] = await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase
        .from("schools")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase.from("reading_progress").select("user_id, is_completed"),
    ]);

    totalStudents = studentsRes.count ?? 0;
    activeSchools = schoolsRes.count ?? 0;

    const progressData = progressRes.data ?? [];
    activeStudents = new Set(progressData.map((p) => p.user_id)).size;

    const completed = progressData.filter((p) => p.is_completed).length;
    avgPerformance = progressData.length
      ? Math.round((completed / progressData.length) * 100)
      : 0;
  } catch (error) {
    console.error("Failed to load moderator dashboard stats", error);
  }

  const activePercent =
    totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

  return (
    <div>
      <section className="mb-6">
        <div className="rounded-lg bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Active Students Right Now</p>
              <h3 className="text-3xl font-semibold">{activeStudents.toLocaleString()}</h3>
              <p className="text-sm opacity-80">out of {totalStudents.toLocaleString()} total students</p>
            </div>
            <div className="text-right">
              <div className="rounded-md bg-white/10 px-4 py-2">{activePercent}%</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-slate-500">Total Students</p>
          <p className="mt-2 text-2xl font-semibold">{totalStudents.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-slate-500">Active Students</p>
          <p className="mt-2 text-2xl font-semibold">{activeStudents.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-sm text-slate-500">Active Schools</p>
          <p className="mt-2 text-2xl font-semibold">{activeSchools.toLocaleString()}</p>
        </div>
        
      </section>
    </div>
  );
}
