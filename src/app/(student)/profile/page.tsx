import PageHeader from "@/components/PageHeader";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col gap-4 px-4 py-6">
        <PageHeader title="Profile" subtitle="Manage your account" gradientClass="from-blue-600 via-violet-600 to-fuchsia-600" />

        <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-100 text-sky-700">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Student ID</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">1-001</p>
            </div>
          </div>
          <button className="mt-4 inline-flex items-center gap-2 rounded-3xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700">
            <span>✏️</span>
            Customize Student ID
          </button>
        </div>

        <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
          <p className="text-lg font-semibold text-slate-950">Your Stats</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">School Rank</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">#12</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">User Rank</p>
              <p className="mt-2 text-2xl font-semibold text-sky-600">#245</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Credits</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">176</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Streak</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">5 days</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
          <p className="text-lg font-semibold text-slate-950">School Info</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
