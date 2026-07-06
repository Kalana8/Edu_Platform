"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setUser as saveUser } from "@/lib/session";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // role is inferred from credentials; remove dropdown
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Invalid credentials.");
      }

      const user = payload.user;
      if (user.role !== "admin" && user.role !== "moderator") {
        throw new Error("Access denied. Authorized personnel only.");
      }

      saveUser(user);
      setLoading(false);
      
      const targetDashboard = user.role === "admin" ? "/admin/dashboard" : "/moderator/dashboard";
      router.replace(targetDashboard);
      // fallback
      setTimeout(() => (window.location.href = targetDashboard), 300);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "An error occurred during sign in.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center px-4 py-10">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 shadow-[0_35px_60px_-35px_rgba(0,0,0,0.5)]">
          <span className="text-3xl">🔒</span>
        </div>

        <div className="w-full rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-2xl shadow-slate-950/30">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin Portal</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Educational Platform Management</h1>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-[1.75rem] bg-white/5 p-5 backdrop-blur-xl">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Email Address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-base text-white outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-3xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-base text-white outline-none"
                required
              />
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}

            <button
              type="submit"
              className="w-full rounded-3xl bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-blue-500"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-4 text-center text-sm text-slate-500">
            <p className="font-medium text-slate-300">Supabase DB credentials:</p>
            <p className="mt-2">Admin: admin1@schoolhub.com / admin123</p>
            <p className="mt-1">Moderator: moderator@gmail.com / mod123</p>
          </div>
        </div>

        <Link href="/" className="mt-6 text-sm font-medium text-slate-300 hover:text-white">
          ← Back to landing page
        </Link>
      </main>
    </div>
  );
}
