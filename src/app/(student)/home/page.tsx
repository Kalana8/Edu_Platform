import Link from "next/link";
import BottomBar from "@/components/BottomBar";

export default function HomeScreen() {
  return (
    <div className="min-h-[844px] bg-slate-100 text-slate-950 pb-24">
      <main className="mx-auto flex min-h-[844px] w-full max-w-[390px] flex-col gap-4 px-4 py-6">
        <section className="overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-slate-950/10">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-sky-100/80">Melbourne High School</p>
              <h1 className="mt-2 text-3xl font-semibold">Melbourne High School</h1>
              <p className="mt-1 text-sm text-sky-100/90">Tier: Medium</p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] bg-white p-5 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Today's Task</p>
                <h2 className="text-2xl font-semibold text-slate-950">Read 2 Pages</h2>
              </div>
              <p className="text-sm font-medium text-slate-500">Progress: 0 / 2</p>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-0 rounded-full bg-sky-500" />
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
            <p className="mt-3 text-3xl font-semibold text-slate-950">120</p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-4 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
            <p className="text-sm text-slate-500">Withhold (Locked)</p>
            <p className="mt-3 text-3xl font-semibold text-amber-600">56</p>
            <p className="mt-2 text-sm text-slate-500">Unlocks in 2 days</p>
          </div>
        </section>

        <BottomBar />
      </main>
    </div>
  );
}
