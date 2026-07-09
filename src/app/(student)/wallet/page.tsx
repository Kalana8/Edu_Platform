"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
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
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-2">
      <main className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col">
        <div className="[&>section]:!rounded-none">
          <PageHeader title="Wallet" subtitle="Manage your credits" gradientClass="from-blue-600 via-cyan-600 to-sky-500" />
        </div>

        <div className="flex flex-col gap-5 bg-slate-50 px-4 py-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-xl">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/5" />
            <div className="relative">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-m uppercase tracking-[0.3em] text-blue-100 font-semibold">
                    Available Credits
                  </p>

                  <h2 className="mt-4 text-5xl font-bold">
                    {data.availableCredits.toLocaleString()}
                  </h2>

                  <p className="mt-2 text-sm text-blue-100">
                    Earn credits by completing quizzes.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  ⭐
                </div>

              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="text-2xl">🏆</div>

              <p className="mt-3 text-xs uppercase tracking-widest text-slate-500">
                Total Earned
              </p>

              <p className="mt-2 text-3xl font-bold">
                {data.totalCredits.toLocaleString()}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                All time
              </p>

            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="text-2xl">🔒</div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Withheld
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {data.withheldCredits.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Pending release
              </p>
            </div>

          </div>

        </div>
      </main>
      <BottomBar />
    </div>
  );
}

export default WalletPage;
