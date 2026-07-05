"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function CreateStudentId() {
  const searchParams = useSearchParams();
  const [schoolCode, setSchoolCode] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSchoolCode(searchParams.get("code") || "");
    setMounted(true);
  }, [searchParams]);

  const fullStudentId = mounted && studentNumber ? `${schoolCode}-${studentNumber}` : "";

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
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-base text-slate-900 outline-none ring-1 ring-transparent transition focus:border-slate-300 focus:ring-slate-200"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-900">Your Student ID</label>
            <input
              type="text"
              readOnly
              value={fullStudentId}
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 p-4 text-base text-slate-900 outline-none cursor-not-allowed"
            />
          </div>

          <Link
            href={`/credits?code=${encodeURIComponent(schoolCode)}&studentId=${encodeURIComponent(fullStudentId)}`}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600"
          >
            Continue
          </Link>
        </div>
      </main>
    </div>
  );
}
