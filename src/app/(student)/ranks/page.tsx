"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import BottomBar from "@/components/BottomBar";

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
  const router = useRouter();
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
        const response = await fetch(`/api/ranks?type=${activeTab}`);

        if (response.status === 401) {
          router.replace("/");
          return;
        }

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
      <main className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col">
        <div className="[&>section]:!rounded-none">
          <PageHeader title="Leaderboard" subtitle={isSchoolTab ? "See how schools rank" : "See how students rank"} gradientClass="from-amber-500 via-orange-500 to-rose-500" />
        </div>

        <div className="flex flex-col gap-4 px-4 py-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">


            <div className="grid grid-cols-3 rounded-2xl bg-slate-100 p-1.5">

              <button
                onClick={() => setActiveTab("tier")}
                className={`rounded-xl py-3 text-sm font-medium transition-all duration-200 ${activeTab === "tier"
                    ? "bg-white text-blue-600 shadow"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                🏫
                <div className="mt-1 text-xs">Tier</div>
              </button>

              <button
                onClick={() => setActiveTab("national")}
                className={`rounded-xl py-3 text-sm font-medium transition-all duration-200 ${activeTab === "national"
                    ? "bg-white text-blue-600 shadow"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                🌍
                <div className="mt-1 text-xs">National</div>
              </button>

              <button
                onClick={() => setActiveTab("students")}
                className={`rounded-xl py-3 text-sm font-medium transition-all duration-200 ${activeTab === "students"
                    ? "bg-white text-blue-600 shadow"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                👨‍🎓
                <div className="mt-1 text-xs">Students</div>
              </button>

            </div>

          </div>

          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="text-5xl">🏆</div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  No Rankings Yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Rankings will appear once students start earning points.
                </p>
              </div>
            ) : (
              items.map((item, index) => {
                const isCurrent = item.id === userSchoolId;
                const schoolItem = isSchoolTab ? (item as SchoolRank) : null;
                const studentItem = !isSchoolTab ? (item as StudentRank) : null;

                const isTopThree = index < 3;

                return (
                  <div
                    key={item.id}
                    className={`relative overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
          ${isCurrent
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white"
                      }`}
                  >
                    {isTopThree && (
                      <div
                        className={`absolute left-0 top-0 h-full w-1.5
                ${index === 0
                            ? "bg-yellow-400"
                            : index === 1
                              ? "bg-slate-400"
                              : "bg-amber-700"
                          }`}
                      />
                    )}

                    <div className="flex items-center justify-between p-5">

                      <div className="flex items-center gap-4">

                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold
                  ${index === 0
                              ? "bg-yellow-100 text-yellow-700"
                              : index === 1
                                ? "bg-slate-200 text-slate-700"
                                : index === 2
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                        >
                          {index === 0
                            ? "🥇"
                            : index === 1
                              ? "🥈"
                              : index === 2
                                ? "🥉"
                                : `#${index + 1}`}
                        </div>

                        <div>

                          <div className="flex items-center gap-2">

                            <p className="text-base font-semibold text-slate-900">
                              {item.name}
                            </p>

                            {isCurrent && (
                              <span className="rounded-full bg-blue-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                                You
                              </span>
                            )}

                          </div>

                          {schoolItem && (
                            <p className="mt-1 text-sm text-slate-500">
                              {schoolItem.tier} • {schoolItem.points.toLocaleString()} Points
                            </p>
                          )}

                          {studentItem && (
                            <p className="mt-1 text-sm text-slate-500">
                              {studentItem.totalCredits.toLocaleString()} Learning Credits
                            </p>
                          )}

                        </div>

                      </div>

                      <div className="text-right">

                        <p className="text-2xl font-bold text-slate-900">
                          {schoolItem
                            ? schoolItem.points.toLocaleString()
                            : studentItem?.totalCredits.toLocaleString()}
                        </p>

                        <p className="text-xs uppercase tracking-wider text-slate-400">
                          Points
                        </p>

                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
      <BottomBar />
    </div>
  );
}
