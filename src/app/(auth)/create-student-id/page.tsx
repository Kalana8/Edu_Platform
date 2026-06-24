import Link from "next/link";

export default function CreateStudentId() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[425px] flex-col  px-4 py-8">
        <div className="space-y-4 ">
          <h1 className="text-3xl font-semibold tracking-tight">Create Your Student ID</h1>
          <div className="mx-auto max-w-xl rounded-2xl border-none bg-blue-50 p-5 text-left text-sm text-gray-700 shadow-none">
            Your Student ID helps track your individual progress. You can customize it later in settings.
          </div>
        </div>

        <div className="mt-8 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-900">Enter Student Number</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g. 1, 42, 999"
              className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-base text-slate-900 outline-none ring-1 ring-transparent transition focus:border-slate-300 focus:ring-slate-200"
            />
          </div>

          <Link
            href="/credits"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600"
          >
            Continue
          </Link>
        </div>
      </main>
    </div>
  );
}
