import Link from "next/link";

const tabs = [
  { label: "Pending", count: 0, active: true },
  { label: "Approved", count: 0, active: false },
  { label: "Rejected", count: 0, active: false },
  { label: "All", count: 0, active: false },
];

export default function ApprovalsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-white px-6 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Approvals</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Review and action moderator change requests</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Review pending moderator requests, approve or reject access changes, and keep approval history in one place.</p>
          </div>
          <Link
            href="#"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
          >
            + New Request
          </Link>
        </div>

        <div className="mb-6 rounded-[2rem] bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  tab.active
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>{tab.label}</span>
                <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow ring-1 ring-slate-200">
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-2xl text-slate-500">
              📭
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">No pending requests</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-500">
                All moderator requests have been reviewed. New requests will appear here when moderators submit changes needing approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
