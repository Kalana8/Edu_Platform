"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { setUser as saveUser } from "@/lib/session";
import Link from "next/link";
import { MobileSpinner } from "@/components/MobileLoader";

export type AuthMode = "signUp" | "signIn";
type Mode = AuthMode | "created";

export default function CreateStudentIdClient({
  schoolCode,
  initialMode = "signUp",
}: {
  schoolCode: string;
  initialMode?: AuthMode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdStudentId, setCreatedStudentId] = useState("");

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setPassword("");
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      setError(!email.trim() ? "Please enter your email." : "Password must be at least 6 characters.");
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
          email: email.trim(),
          name: name.trim() || undefined,
          password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create your account.");
        if (response.status === 409) switchModeKeepingEmail("signIn");
        return;
      }

      if (data.user) saveUser(data.user);
      setCreatedStudentId(data.studentId ?? data.user?.studentId ?? "");
      setMode("created");
    } catch (err) {
      console.error("Student registration error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Accounts made before email sign-up can still type their Student ID here.
        body: JSON.stringify(
          email.includes("@") ? { email: email.trim(), password } : { studentId: email.trim(), password }
        ),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to sign in.");
        setLoading(false);
        return;
      }

      if (data.user) saveUser(data.user);
      window.location.href = "/home";
    } catch (err) {
      console.error("Student login error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Keep the email and error when sending someone from sign-up to sign-in.
  const switchModeKeepingEmail = (next: AuthMode) => {
    setMode(next);
    setPassword("");
  };

  const title = mode === "signIn" ? "Welcome Back" : mode === "created" ? "You're All Set" : "Create Your Account";

  return (
    <div className="min-h-screen bg-brand text-slate-950">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col justify-center px-4 py-8 text-white">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-white">{title}</h1>

        <div className="mt-10 space-y-3 px-6">
          {mode === "created" && (
            <>
              <StudentIdDisplay value={createdStudentId} />
              <p className="text-sm text-white/75">
                This is your Student ID. Use your email and password to sign in next time.
              </p>
              <div className="flex justify-end pt-2">
                <PrimaryButton type="button" onClick={() => (window.location.href = "/home")} width="w-40">
                  Continue
                </PrimaryButton>
              </div>
            </>
          )}

          {mode === "signUp" && !schoolCode && (
            <>
              <p className="text-center text-sm text-white/80">Choose your school first to create an account.</p>
              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => switchMode("signIn")} className="pl-4 text-sm text-white/80 hover:cursor-pointer hover:text-white">
                  Sign In Instead
                </button>
                <PrimaryLink href="/join-school" width="w-44">Find School</PrimaryLink>
              </div>
            </>
          )}

          {mode === "signUp" && schoolCode && (
            <form onSubmit={handleSignUp} className="space-y-3" noValidate>
              <InlineField label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  className={inputClass}
                />
              </InlineField>
              <InlineField label="Name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Optional"
                  autoComplete="name"
                  className={inputClass}
                />
              </InlineField>
              <InlineField label="Password">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </InlineField>

              <p className="px-1 text-xs text-white/70">Your Student ID is created for you once you sign up.</p>

              {error && <p className="text-sm font-bold tracking-wide text-red-300">{error}</p>}

              <div className="flex items-center justify-between pt-2">
                <Link href="/" className="pl-4 text-sm text-white/80 hover:text-white">Cancel</Link>
                <PrimaryButton type="submit" disabled={loading || !email.trim() || !password} width="w-48">
                  {loading ? <><MobileSpinner className="h-4 w-4" />Creating…</> : "Create Account"}
                </PrimaryButton>
              </div>

              <SwitchPrompt question="Already have an account?" action="Sign In" onClick={() => switchMode("signIn")} />
            </form>
          )}

          {mode === "signIn" && (
            <form onSubmit={handleSignIn} className="space-y-3" noValidate>
              <InlineField label="Email">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email or Student ID"
                  autoComplete="username"
                  autoCapitalize="none"
                  className={inputClass}
                />
              </InlineField>
              <InlineField label="Password">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className={inputClass}
                />
              </InlineField>

              {error && <p className="text-sm font-bold tracking-wide text-red-300">{error}</p>}

              <div className="flex items-center justify-between pt-2">
                <Link href="/" className="pl-4 text-sm text-white/80 hover:text-white">Cancel</Link>
                <PrimaryButton type="submit" disabled={loading || !email.trim() || !password} width="w-40">
                  {loading ? <><MobileSpinner className="h-4 w-4" />Signing in…</> : "Sign In"}
                </PrimaryButton>
              </div>

              {schoolCode && (
                <SwitchPrompt question="New here?" action="Create Account" onClick={() => switchMode("signUp")} />
              )}
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

const inputClass = "min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400";

const primaryClass =
  "group flex h-12 items-center justify-center gap-2 rounded-[1.25rem] bg-slate-900 text-base font-semibold text-white shadow-lg transition hover:cursor-pointer hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-slate-900 disabled:active:scale-100";

function InlineField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl bg-white px-4 text-slate-900 shadow-[0_12px_32px_-12px_rgba(4,43,68,0.45)] ring-2 ring-transparent transition focus-within:ring-white/50">
      <span className="w-20 shrink-0 text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1 group-disabled:translate-x-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12h16" />
      <path d="m14 6 6 6-6 6" />
    </svg>
  );
}

function PrimaryButton({
  children,
  width,
  type,
  disabled,
  onClick,
}: {
  children: ReactNode;
  width: string;
  type: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  // While loading, children include a spinner; only show the arrow on plain labels.
  const isLabel = typeof children === "string";
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${primaryClass} ${width}`}>
      {children}
      {isLabel && <ArrowIcon />}
    </button>
  );
}

function PrimaryLink({ href, width, children }: { href: string; width: string; children: ReactNode }) {
  return (
    <Link href={href} className={`${primaryClass} ${width}`}>
      {children}
      <ArrowIcon />
    </Link>
  );
}

function SwitchPrompt({ question, action, onClick }: { question: string; action: string; onClick: () => void }) {
  return (
    <p className="pt-4 text-center text-sm text-white/75">
      {question}{" "}
      <button type="button" onClick={onClick} className="font-semibold text-white underline-offset-4 hover:cursor-pointer hover:underline">
        {action}
      </button>
    </p>
  );
}

function StudentIdDisplay({ value }: { value: string }) {
  return (
    <div aria-live="polite" className="flex items-center gap-3 py-1">
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
        <p className="truncate font-mono text-lg font-semibold tracking-wide text-white">{value}</p>
      </div>
    </div>
  );
}
