"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";

type WalletData = {
  availableCredits: number;
  totalCredits: number;
  withheldCredits: number;
};

const boostItems = [
  {
    title: "2x Reward Boost",
    description: "Double your credit earnings for the next 3 tasks",
    cost: 20,
    color: "bg-violet-100 text-violet-700",
  },
  {
    title: "Advanced Challenge Entry",
    description: "Access premium learning challenges with higher rewards",
    cost: 30,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Streak Protection",
    description: "Protect your streak for one missed day",
    cost: 15,
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function BoostPage() {
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
            <PageHeader title="Boost Your Progress" subtitle="Use credits to unlock special features" gradientClass="from-fuchsia-500 via-violet-600 to-blue-700" />
          </div>
          <div className="px-4 py-6">
            <div className="rounded-[1.75rem] bg-white p-6 text-center text-sm text-slate-500 shadow-sm">Loading…</div>
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
            <PageHeader title="Boost Your Progress" subtitle="Use credits to unlock special features" gradientClass="from-fuchsia-500 via-violet-600 to-blue-700" />
          </div>
          <div className="px-4 py-6">
            <div className="rounded-[1.75rem] bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col">
        <div className="[&>section]:!rounded-none">
          <PageHeader title="Boost Your Progress" subtitle="Use credits to unlock special features" gradientClass="from-fuchsia-500 via-violet-600 to-blue-700" />
        </div>

        <div className="flex flex-col gap-4 px-4 py-6">
          <div className="rounded-[1.75rem] bg-white p-4 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
            <p className="text-sm text-slate-500">Available Credits</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{data?.availableCredits.toLocaleString() ?? 0}</p>
          </div>

          <div className="space-y-4">
            {boostItems.map((item) => (
              <div key={item.title} className="rounded-[1.75rem] bg-white p-4 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 flex h-12 w-12 items-center justify-center rounded-3xl ${item.color}`}>
                    <span className="text-xl">⚡</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-lg font-semibold text-slate-950">{item.cost} credits</p>
                  <button className="rounded-3xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                    Purchase
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
