"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinSchool() {
  const router = useRouter();
  const [schoolId, setSchoolId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function verify() {
    
    setError(null);
    const trimmed = schoolId.trim();
    if (!trimmed) {
      setError("Enter school id");
      return;
    }

    try {
      console.log("Verifying school id:", trimmed);
      setLoading(true);
      const res = await fetch("/api/verify-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId: trimmed }),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch (parseErr) {
        console.error("Failed to parse JSON from /api/verify-school", parseErr, await res.text());
        setError("Something went wrong");
        return;
      }

      console.log("verify response", res.status, json);
      console.log( json);

      if (!res.ok) {
        setError(json?.error || "Something went wrong");
        return;
      }

      if (!json.exists) {
        setError("Enter a valid id");
        return;
      }

      // success -> go to confirm page with school data
      const school = json.school;
      router.push(`/confirm-school?code=${encodeURIComponent(school.code)}&name=${encodeURIComponent(school.name)}&tier=${encodeURIComponent(school.tier)}`);
    } catch (err: any) {
      console.error(err);
      setError(String(err) || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-4 py-8">
          <div className="space-y-3 ">
            <h1 className="text-3xl font-semibold tracking-tight">Join Your School</h1>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">Enter School ID</label>
              <input
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                type="text"
                placeholder="e.g. SCH-45821"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 outline-none ring-1 ring-transparent transition focus:border-slate-300 focus:ring-slate-200"
              />
              <p className="text-sm text-slate-500">Ask your school for the ID.</p>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <button
              onClick={() => {
                verify();
              }}
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify School"}
            </button>

            <Link href="/" className="block text-center text-sm text-slate-500">Cancel</Link>
          </div>
      </main>
    </div>
  );
}
