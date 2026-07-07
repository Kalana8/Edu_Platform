"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

type SchoolRank = {
  id: string;
  name: string;
  tier: string;
  points: number;
};

type StudentRank = {
  id: string;
  name: string;
  totalCredits: number;
};

type RanksResponse = {
  schools: SchoolRank[];
  students: StudentRank[];
  userSchoolId?: string;
};

export default function RanksPage() {
  const [activeTab, setActiveTab] = useState<"tier" | "national" | "students">("tier");
  const [data, setData] = useState<RanksResponse>({ schools: [], students: [] });
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRanks = async () => {
      setLoading(true);
      setError(null);

      try {
        const cookieStore = document.cookie;
        const match = cookieStore.match(/session_user=([^;]+)/);
        const sessionUserStr = match ? decodeURIComponent(match[1]) : localStorage.getItem("user_session");
        if (!sessionUserStr) {
          setError("Please sign in to view leaderboard.");
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/ranks?type=${activeTab}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load ranks.");
        }

        if (payload.schools) {
          setData((prev) => ({ ...prev, schools: payload.schools }));
          setUserSchoolId(payload.userSchoolId ?? null);
        }
        if (payload.students) {
          setData((prev) => ({ ...prev, students: payload.students }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ranks.");
      } finally {
        setLoading(false);
      }
    };

    void loadRanks();
  }, [activeTab]);

  const getRankBadge = (index: number, itemId?: string) => {
    const rank = index + 1;
    if (rank === 1) return "bg-amber-100 text-amber-700";
    if (rank === 2) return "bg-slate-200 text-slate-700";
    if (rank === 3) return "bg-orange-100 text-orange-700";
    if (itemId && userSchoolId && itemId === userSchoolId) return "bg-blue-600 text-white";
    return "bg-slate-100 text-slate-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
        <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col">
          <div className="[&>section]:!rounded-none">
            <PageHeader title="Leaderboard" subtitle="See how schools rank" gradientClass="from-amber-500 via-orange-500 to-rose-500" />
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
            <PageHeader title="Leaderboard" subtitle="See how schools rank" gradientClass="from-amber-500 via-orange-500 to-rose-500" />
          </div>
          <div className="px-4 py-6">
            <div className="rounded-[1.75rem] bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  const isSchoolTab = activeTab !== "students";
  const items = isSchoolTab ? data.schools : data.students;
  const scoreLabel = isSchoolTab ? "Points" : "Credits";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col">
        <div className="[&>section]:!rounded-none">
          <PageHeader title="Leaderboard" subtitle={isSchoolTab ? "See how schools rank" : "See how students rank"} gradientClass="from-amber-500 via-orange-500 to-rose-500" />
        </div>

        <div className="px-4 py-6">
          <div className="rounded-[1.75rem] bg-white p-4 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-[1.5rem] bg-slate-100 p-4">
                <span className="text-sm font-semibold text-slate-700">View</span>
                <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white capitalize">
                  {activeTab === "national" ? "National" : activeTab === "tier" ? "Tier" : "Students"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-[1.5rem] bg-slate-100 p-2 text-center text-sm font-medium text-slate-600">
                <button
                  onClick={() => setActiveTab("tier")}
                  className={`rounded-3xl py-3 transition ${activeTab === "tier" ? "bg-white shadow-sm" : ""}`}
                >
                  Tier
                </button>
                <button
                  onClick={() => setActiveTab("national")}
                  className={`rounded-3xl py-3 transition ${activeTab === "national" ? "bg-white shadow-sm" : ""}`}
                >
                  National
                </button>
                <button
                  onClick={() => setActiveTab("students")}
                  className={`rounded-3xl py-3 transition ${activeTab === "students" ? "bg-white shadow-sm" : ""}`}
                >
                  Students
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {items.length === 0 ? (
              <div className="rounded-[1.75rem] bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                No rankings available yet.
              </div>
            ) : (
              items.map((item, index) => {
                const isCurrent = item.id === userSchoolId;
                const schoolItem = isSchoolTab ? (item as SchoolRank) : null;
                const studentItem = !isSchoolTab ? (item as StudentRank) : null;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-[1.75rem] border px-4 py-4 shadow-sm ${
                      isCurrent ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${getRankBadge(index, item.id)} font-bold text-lg`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950">{item.name}</p>
                        {schoolItem && (
                          <p className="text-xs text-slate-500 capitalize">{schoolItem.tier} · {schoolItem.points.toLocaleString()} pts</p>
                        )}
                        {studentItem && (
                          <p className="text-xs text-slate-500">{studentItem.totalCredits.toLocaleString()} credits</p>
                        )}
                      </div>
                    </div>
                    <p className="font-semibold text-slate-950">
                      {schoolItem ? schoolItem.points.toLocaleString() : studentItem ? studentItem.totalCredits.toLocaleString() : ""}
                    </p>
                  </div>
                );
              }              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
