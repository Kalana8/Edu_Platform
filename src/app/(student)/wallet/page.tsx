"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

type WalletData = {
  availableCredits: number;
  totalCredits: number;
  withheldCredits: number;
};

export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WalletData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWallet = async () => {
      setLoading(true);
      setError(null);

      try {
        const cookieStore = document.cookie;
        const match = cookieStore.match(/session_user=([^;]+)/);
        const sessionUserStr = match ? decodeURIComponent(match[1]) : localStorage.getItem("user_session");

        if (!sessionUserStr) {
          setError("Please sign in to view your wallet.");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/student/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load wallet.");
        }

        const profile = payload.profile;
        if (profile) {
          setData({
            availableCredits: profile.availableCredits ?? 0,
            totalCredits: profile.totalCredits ?? 0,
            withheldCredits: profile.withheldCredits ?? 0,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load wallet.");
      } finally {
        setLoading(false);
      }
    };

    void loadWallet();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
        <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col">
          <div className="[&>section]:!rounded-none">
            <PageHeader title="Wallet" subtitle="Manage your credits" gradientClass="from-blue-600 via-cyan-600 to-sky-500" />
          </div>
          <div className="px-4 py-6">
            <div className="rounded-[1.75rem] bg-white p-6 text-center text-sm text-slate-500 shadow-sm">Loading wallet…</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
        <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col">
          <div className="[&>section]:!rounded-none">
            <PageHeader title="Wallet" subtitle="Manage your credits" gradientClass="from-blue-600 via-cyan-600 to-sky-500" />
          </div>
          <div className="px-4 py-6">
            <div className="rounded-[1.75rem] bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col">
        <div className="[&>section]:!rounded-none">
          <PageHeader title="Wallet" subtitle="Manage your credits" gradientClass="from-blue-600 via-cyan-600 to-sky-500" />
        </div>

        <div className="px-4 py-6">
          <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
            <div className="rounded-[1.75rem] bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Available Credits</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-3xl font-semibold text-slate-950">{data.availableCredits.toLocaleString()}</p>
                <span className="rounded-3xl bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">Active</span>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">Total Credits</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{data.totalCredits.toLocaleString()}</p>
                <p className="mt-1 text-sm text-slate-500">{data.availableCredits.toLocaleString()} available · {data.withheldCredits.toLocaleString()} withheld</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">Spend Credits</p>
                <p className="mt-2 text-sm text-slate-500">Use credits for boosts and premium features.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
