"use client";

import { useState } from "react";
import { setUser as saveUser } from "@/lib/session";
import Link from "next/link";
import { MobileSpinner } from "@/components/MobileLoader";

type Mode = "studentNumber" | "signUp" | "signIn" | "forgotPassword";

export default function CreateStudentIdClient({ schoolCode }: { schoolCode: string }) {
  const [mode, setMode] = useState<Mode>("studentNumber");
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingStudentId, setExistingStudentId] = useState("");
  const [resetComment, setResetComment] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

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

  const handleForgotPassword = async () => {
    if (!existingStudentId) {
      setError("Please enter your student ID first.");
      setMode("studentNumber");
      return;
    }

    setLoading(true);
    setError(null);
    setResetSuccess(false);

    try {
      const response = await fetch("/api/password-reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: existingStudentId,
          comment: resetComment.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to submit password reset request.");
        setLoading(false);
        return;
      }

      setResetSuccess(true);
      setResetComment("");
    } catch (err) {
      console.error("Password reset request error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSignUp = mode === "signUp";
  const isSignIn = mode === "signIn";
  const isForgotPassword = mode === "forgotPassword";

  return (
    <div className="min-h-screen bg-brand text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col justify-center px-4 py-8 text-white">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl text-white font-semibold tracking-tight">
            {isSignUp ? "Create Your Student ID" : isSignIn ? "Welcome Back" : isForgotPassword ? "Reset Password" : "Create Your Student ID"}
          </h1>
        </div>

        <div className="mt-10 space-y-3 px-6">
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

              <StudentIdDisplay value={fullStudentId} />

              {error && <p className="text-sm text-red-300 font-bold tracking-wide">{error}</p>}

              <div className="flex items-center justify-between pt-2">
                <Link href="/" className="pl-4 text-sm text-white/80 hover:text-white">Cancel</Link>
                <button
                onClick={handleCheckStudentNumber}
                disabled={loading || !fullStudentId}
                className="group flex h-12 w-40 items-center justify-center gap-2 rounded-[1.25rem] bg-slate-900 text-base font-semibold text-white shadow-lg transition hover:cursor-pointer hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-slate-900 disabled:active:scale-100"
              >
                {loading ? (
                  <><MobileSpinner className="h-4 w-4" />Checking…</>
                ) : (
                  <>
                    Continue
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1 group-disabled:translate-x-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M4 12h16" />
                      <path d="m14 6 6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
              </div>
            </>
          )}

          {isSignUp && (
            <>
              <StudentIdDisplay value={fullStudentId} />

              <div className="space-y-3">
                <label className={inlineFieldClass}>
                  <span className="w-20 shrink-0 text-sm font-semibold text-slate-700">Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional"
                    autoComplete="name"
                    className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
                  />
                </label>
                <label className={inlineFieldClass}>
                  <span className="w-20 shrink-0 text-sm font-semibold text-slate-700">Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400"
                  />
                </label>
              </div>

              {error && <p className="text-sm text-red-300 font-bold tracking-wide">{error}</p>}

              <div className="flex items-center justify-between pt-2">
                <Link href="/" className="pl-4 text-sm text-white/80 hover:text-white">Cancel</Link>
                <button
                  onClick={handleSignUp}
                  disabled={loading || !password}
                  className="group flex h-12 w-48 items-center justify-center gap-2 rounded-[1.25rem] bg-slate-900 text-base font-semibold text-white shadow-lg transition hover:cursor-pointer hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-slate-900 disabled:active:scale-100"
                >
                  {loading ? (
                    <><MobileSpinner className="h-4 w-4" />Creating…</>
                  ) : (
                    <>
                      Create Account
                      <svg className="h-5 w-5 transition-transform group-hover:translate-x-1 group-disabled:translate-x-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M4 12h16" />
                        <path d="m14 6 6 6-6 6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {isSignIn && (
            <>
              <StudentIdDisplay value={existingStudentId} />

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

              <div className="flex items-center justify-between pt-2">
                <Link href="/" className="pl-4 text-sm text-white/80 hover:text-white">Cancel</Link>
                <button
                  onClick={handleSignIn}
                  disabled={loading || !password}
                  className="group flex h-12 w-40 items-center justify-center gap-2 rounded-[1.25rem] bg-slate-900 text-base font-semibold text-white shadow-lg transition hover:cursor-pointer hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-slate-900 disabled:active:scale-100"
                >
                  {loading ? (
                    <><MobileSpinner className="h-4 w-4" />Signing in…</>
                  ) : (
                    <>
                      Sign In
                      <svg className="h-5 w-5 transition-transform group-hover:translate-x-1 group-disabled:translate-x-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M4 12h16" />
                        <path d="m14 6 6 6-6 6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {isForgotPassword && (
            <>
              <StudentIdDisplay value={existingStudentId} />

              <div className="space-y-2">
                <label className="block font-medium">Additional Note (optional)</label>
                <textarea
                  value={resetComment}
                  onChange={(e) => setResetComment(e.target.value)}
                  placeholder="Any extra information to help the admin verify your identity..."
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-transparent transition focus:border-slate-300 focus:ring-slate-200"
                />
              </div>

              {error && <p className="text-sm text-red-300 font-bold tracking-wide">{error}</p>}

              {resetSuccess && (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  Password reset request submitted successfully. An admin will review your request shortly.
                </div>
              )}

              <button
                onClick={handleForgotPassword}
                disabled={loading || resetSuccess}
                className="inline-flex w-full items-center justify-center px-5 py-3 text-base font-semibold rounded-lg bg-white text-blue-700 hover:cursor-pointer disabled:opacity-60"
              >
                {loading ? <><MobileSpinner className="mr-2 h-4 w-4" />Submitting…</> : "Submit Reset Request"}
              </button>

           
            </>
          )}

          {isForgotPassword && (
            <Link href="/" className="block text-center text-sm text-white/80 hover:text-white">Cancel</Link>
          )}
        </div>
      </main>
    </div>
  );
}

const inlineFieldClass =
  "flex items-center gap-3 rounded-2xl bg-white px-4 text-slate-900 shadow-[0_12px_32px_-12px_rgba(4,43,68,0.45)] ring-2 ring-transparent transition focus-within:ring-white/50";

function StudentIdDisplay({ value }: { value: string }) {
  return (
    <div
      aria-live="polite"
      className="flex items-center gap-3 py-1"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="11" r="2" />
          <path d="M6 16c.6-1.4 1.7-2 3-2s2.4.6 3 2" />
          <path d="M15 10h3M15 14h3" />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-white/70">Your Student ID</p>
        {value ? (
          <p className="truncate font-mono text-lg font-semibold tracking-wide text-white">{value}</p>
        ) : (
          <p className="text-sm text-white/60">Enter Your Number Above</p>
        )}
      </div>
    </div>
  );
}
