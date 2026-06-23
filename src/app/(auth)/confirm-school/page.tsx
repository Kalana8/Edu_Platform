import Link from "next/link";

export default function ConfirmSchool() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col justify-center px-4 py-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Confirm Your School</h1>
          <p className="text-sm text-slate-500">Verify the school details below before joining.</p>
        </div>

        <div className="mt-8 rounded-[1rem] bg-white p-6 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.35)]">
          <div className="space-y-5">
            <div className="space-y-2 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">School Name</p>
              <p className="text-base font-semibold text-slate-950">Melbourne High School</p>
            </div>
            <div className="space-y-2 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Tier</p>
              <p className="text-base font-semibold text-slate-950">Medium School</p>
            </div>
          </div>

          <Link
            href="/create-student-id"
            className="mt-8 inline-flex w-full items-center justify-center rounded-3xl bg-blue-600 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Join School Team
          </Link>
        </div>
      </main>
    </div>
  );
}
