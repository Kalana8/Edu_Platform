"use client";

import { useState } from "react";
import { setUser as saveUser } from "@/lib/session";
import Link from "next/link";

type Mode = "studentNumber" | "signUp" | "signIn";

export default function CreateStudentIdClient({ schoolCode }: { schoolCode: string }) {
  const [mode, setMode] = useState<Mode>("studentNumber");
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingStudentId, setExistingStudentId] = useState("");

  const fullStudentId = studentNumber ? `${schoolCode}-${studentNumber}` : "";

  const handleCheckStudentNumber = async () => {
    if (!fullStudentId) {
      setError("Please enter a student number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/students/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolCode: schoolCode.trim(),
          studentNumber: studentNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to check student ID.");
        setLoading(false);
        return;
      }

      if (data.exists) {
        setExistingStudentId(fullStudentId);
        setMode("signIn");
      } else {
        setMode("signUp");
      }
    } catch (err) {
      console.error("Student check error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!password) {
      setError("Please create a password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/students/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolCode: schoolCode.trim(),
          studentNumber: studentNumber.trim(),
          name: name.trim() || undefined,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create student ID.");
        setLoading(false);
        return;
      }

      if (data.user) {
        saveUser(data.user);
      }
      window.location.href = "/home";
    } catch (err) {
      console.error("Student registration error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: existingStudentId,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to sign in.");
        setLoading(false);
        return;
      }

      if (data.user) {
        saveUser(data.user);
      }
      window.location.href = "/home";
    } catch (err) {
      console.error("Student login error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const isSignUp = mode === "signUp";
  const isSignIn = mode === "signIn";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,.35),_transparent_25%),linear-gradient(180deg,#4f46e5_0%,#8b5cf6_45%,#9333ea_100%)] text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col px-4 py-8 text-white">
        <div className="space-y-3 text-center mt-18">
          <h1 className="text-3xl text-white font-semibold tracking-tight">
            {isSignUp ? "Create Your Student ID" : isSignIn ? "Welcome Back" : "Create Your Student ID"}
          </h1>
        </div>

        <div className="mt-25 space-y-3 px-6">
          {mode === "studentNumber" && (
            <>
              <div className="space-y-2">
                <label className="block font-medium">Enter Student Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="1, 42, 999"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-transparent transition focus:border-slate-300 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Your Student ID</label>
                <input
                  type="text"
                  readOnly
                  value={fullStudentId}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 p-4 py-3 text-sm text-slate-900 outline-none cursor-not-allowed"
                />
              </div>

              {error && <p className="text-sm text-red-300 font-bold tracking-wide">{error}</p>}

              <button
                onClick={handleCheckStudentNumber}
                disabled={loading || !fullStudentId}
                className="inline-flex w-full items-center justify-center px-5 py-3 text-base font-semibold rounded-lg bg-white text-blue-700 hover:cursor-pointer disabled:opacity-60"
              >
                {loading ? "Checking..." : "Continue"}
              </button>
            </>
          )}

          {isSignUp && (
            <>
              <div className="space-y-2">
                <label className="block font-medium">Your Student ID</label>
                <input
                  type="text"
                  readOnly
                  value={fullStudentId}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 p-4 py-3 text-sm text-slate-900 outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-transparent transition focus:border-slate-300 focus:ring-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Create Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-transparent transition focus:border-slate-300 focus:ring-slate-200"
                />
              </div>

              {error && <p className="text-sm text-red-300 font-bold tracking-wide">{error}</p>}

              <button
                onClick={handleSignUp}
                disabled={loading || !password}
                className="inline-flex w-full items-center justify-center px-5 py-3 text-base font-semibold rounded-lg bg-white text-blue-700 hover:cursor-pointer disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>

              {/* <button
                onClick={() => { setMode("studentNumber"); setError(null); }}
                className="block text-center text-sm text-white/80 hover:text-white"
              >
                Back
              </button> */}
            </>
          )}

          {isSignIn && (
            <>
              <div className="space-y-2">
                <label className="block font-medium">Your Student ID</label>
                <input
                  type="text"
                  readOnly
                  value={existingStudentId}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 p-4 py-3 text-sm text-slate-900 outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-transparent transition focus:border-slate-300 focus:ring-slate-200"
                />
              </div>

              {error && <p className="text-sm text-red-300 font-bold tracking-wide">{error}</p>}

              <button
                onClick={handleSignIn}
                disabled={loading || !password}
                className="inline-flex w-full items-center justify-center px-5 py-3 text-base font-semibold rounded-lg bg-white text-blue-700 hover:cursor-pointer disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              {/* <button
                onClick={() => { setMode("studentNumber"); setError(null); setPassword(""); }}
                className="block text-center text-sm text-white/80 hover:text-white"
              >
                Back
              </button> */}
            </>
          )}

          <Link href="/" className="block text-center text-sm text-white/80 hover:text-white">Cancel</Link>

          <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/10 p-1 shadow-[0_28px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-md ring-1 ring-white/30">
            <div className="rounded-xl bg-white/85 p-5 text-left text-xs text-slate-700 backdrop-blur-sm">
              Your Student ID helps track your individual progress. You can customize it later in settings.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
