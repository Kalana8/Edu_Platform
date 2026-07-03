"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ConfirmSchool() {
  const searchParams = useSearchParams();
  const schoolName = searchParams.get("name") || "Loading...";
  const tier = searchParams.get("tier") || "Loading...";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col  px-4 py-8">
        <div className="space-y-4 ">
          <h1 className="text-3xl font-semibold ">Confirm Your School</h1>
        </div>

        <div className="mt-8 rounded-[1rem] bg-white p-6 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.35)]">
          <div>
            <div className="space-y-2 p-1">
              <p className="text-xs   text-slate-500">School Name</p>
              <p className="text-base font-semibold text-slate-950">{schoolName}</p>
            </div>
            <div className="space-y-2 p-1">
              <p className="text-xs   text-slate-500">Tier</p>
              <p className="text-base font-semibold text-slate-950">{tier}</p>
            </div>
          </div>
        </div>

        <Link
          href="/create-student-id"
          className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-blue-500 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-600"
        >
          Join School Team
        </Link>
      </main>
    </div>
  );
}
