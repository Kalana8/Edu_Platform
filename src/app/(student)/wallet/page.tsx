"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import MobileLoader from "@/components/MobileLoader";
import BottomBar from "@/components/BottomBar";

type WalletData = {
  availableCredits: number;
  totalCredits: number;
  withheldCredits: number;
};

function WalletPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WalletData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWallet = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/student/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.status === 401) {
          router.replace("/");
          return;
        }

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
            <PageHeader title="Wallet" />
          </div>
          <MobileLoader label="Loading wallet…" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
        <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col">
          <div className="[&>section]:!rounded-none">
            <PageHeader title="Wallet" />
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
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-2">
      <main className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col">
        <div className="[&>section]:!rounded-none">
          <PageHeader title="Wallet" />
        </div>

        <div className="flex flex-col gap-3 px-4 py-4">
          <div className="relative overflow-hidden rounded-2xl bg-brand px-5 py-4 text-white shadow-lg shadow-brand/20">
            <div aria-hidden className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-100">Available Credits</p>
                <p className="mt-1 text-4xl font-bold leading-none">{data.availableCredits.toLocaleString()}</p>
                <p className="mt-2 text-xs text-blue-100">Earn credits by completing quizzes.</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden>
                  <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Earned" value={data.totalCredits} hint="All time">
              <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
              <path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />
            </StatCard>
            <StatCard label="Withheld" value={data.withheldCredits} hint="Pending release">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </StatCard>
          </div>
        </div>
      </main>
      <BottomBar />
    </div>
  );
}

function StatCard({ label, value, hint, children }: { label: string; value: number; hint: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-tint text-brand">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {children}
          </svg>
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold leading-none text-slate-900">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export default WalletPage;
