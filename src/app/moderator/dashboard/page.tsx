export default function ModeratorDashboard() {
  return (
    <div>
      <section className="mb-6">
        <div className="rounded-lg bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Active Students Right Now</p>
              <h3 className="text-3xl font-semibold">9,876</h3>
              <p className="text-sm opacity-80">out of 12,458 total students</p>
            </div>
            <div className="text-right">
              <div className="rounded-md bg-white/10 px-4 py-2">79%</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-white p-6 shadow"> 
          <p className="text-sm text-slate-500">Total Students</p>
          <p className="mt-2 text-2xl font-semibold">12,458</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow"> 
          <p className="text-sm text-slate-500">Active Students</p>
          <p className="mt-2 text-2xl font-semibold">9,876</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow"> 
          <p className="text-sm text-slate-500">Active Schools</p>
          <p className="mt-2 text-2xl font-semibold">156</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow"> 
          <p className="text-sm text-slate-500">Avg. Performance</p>
          <p className="mt-2 text-2xl font-semibold">78%</p>
        </div>
      </section>
    </div>
  );
}
