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
    <div className="min-h-screen  bg-[radial-gradient(circle_at_top,_rgba(59,130,246,.35),_transparent_25%),linear-gradient(180deg,#4f46e5_0%,#8b5cf6_45%,#9333ea_100%)] text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-4 py-8 text-white">
          <div className="space-y-3 text-center mt-18">
            <h1 className="text-3xl text-white font-semibold tracking-tight">Join Your School</h1>
          </div>

          <div className="mt-25 space-y-3 px-6">
            <div className="space-y-2 mb-13">
              <label className="block  font-medium ">Enter School ID</label>
              <input
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                type="text"
                placeholder="SCH-45821"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-transparent transition focus:border-slate-300 focus:ring-slate-200"
              />
              <p className=" ">Ask your school for the ID.</p>
              {error && <p className="text-sm text-red-300 font-bold tracking-wide">{error}</p>}
            </div>

            <button
              onClick={() => {
                verify();
              }}
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-base font-semibold rounded-lg bg-white px-8 text-base font-semibold text-blue-700 hover:cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify School"}
            </button>

            <Link href="/" className="block text-center text-sm ">Cancel</Link>
          </div>
      </main>
    </div>
  );
}
