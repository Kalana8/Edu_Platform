import Link from "next/link";

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col justify-center px-4 py-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">How Credits Work</h1>
        </div>

        <div className="mt-8 space-y-4">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-950">68% Available</p>
                <p className="mt-2 text-sm text-slate-500">Use credits to boost your progress</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">68%</span>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-950">32% Withhold</p>
                <p className="mt-2 text-sm text-slate-500">Unlocked after consistency</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">32%</span>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/home"
            className="inline-flex w-full items-center justify-center rounded-3xl bg-blue-600 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Start Learning
          </Link>
        </div>
      </main>
    </div>
  );
}
