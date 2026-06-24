import Link from "next/link";

export default function JoinSchool() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-4 py-8">
          <div className="space-y-3 ">
            <h1 className="text-3xl font-semibold tracking-tight">Join Your School</h1>
          </div>

          <div className="mt-8 space-y-10">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">Enter School ID</label>
              <input
                type="text"
                placeholder="e.g. SCH-45821"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 outline-none ring-1 ring-transparent transition focus:border-slate-300 focus:ring-slate-200"
              />
              <p className="text-sm text-slate-500">Ask your school for the ID.</p>
            </div>

            <Link
              href="/confirm-school"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600"
            >
              Verify School
            </Link>
          </div>
      </main>
    </div>
  );
}
