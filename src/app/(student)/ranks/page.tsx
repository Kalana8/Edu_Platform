"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import MobileLoader from "@/components/MobileLoader";
import Icon from "@/components/Icon";
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
  userStudentId?: string;
};

export default function RanksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"tier" | "national" | "students">("tier");
  const [data, setData] = useState<RanksResponse>({ schools: [], students: [] });
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [userStudentId, setUserStudentId] = useState<string | null>(null);
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
          setUserStudentId(payload.userStudentId ?? null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ranks.");
      } finally {
        setLoading(false);
      }
    };

    void loadRanks();
  }, [activeTab]);

  const getRankBadge = (index: number) => {
    const rank = index + 1;
    if (rank === 1) return "bg-amber-100 text-amber-700";
    if (rank === 2) return "bg-slate-200 text-slate-700";
    if (rank === 3) return "bg-orange-100 text-orange-700";
    return "bg-slate-100 text-slate-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
        <main className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col">
          <div className="[&>section]:!rounded-none">
            <PageHeader title="Leaderboard" />
          </div>
          <MobileLoader label="Loading leaderboard…" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
        <main className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col">
          <div className="[&>section]:!rounded-none">
            <PageHeader title="Leaderboard" />
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


  const emptyText = isSchoolTab
    ? "Rankings will appear once schools start earning points."
    : "No students from your school yet.";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
      <main className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col">
        <div className="[&>section]:!rounded-none">
          <PageHeader title="Leaderboard" />
        </div>

        <div className="flex flex-col gap-1 px-4 py-1">
            <div className="grid grid-cols-3 rounded-2xl bg-slate-100 p-1.5">
              <button
                onClick={() => setActiveTab("tier")}
                className={`rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 ${
                  activeTab === "tier" ? "bg-white text-blue-600 shadow" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon name="school" className="mx-auto h-4 w-4" />
                <div className="mt-0.5">Tier</div>
              </button>
              <button
                onClick={() => setActiveTab("national")}
                className={`rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 ${
                  activeTab === "national" ? "bg-white text-blue-600 shadow" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon name="globe" className="mx-auto h-4 w-4" />
                <div className="mt-0.5">National</div>
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 ${
                  activeTab === "students" ? "bg-white text-blue-600 shadow" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon name="users" className="mx-auto h-4 w-4" />
                <div className="mt-0.5">Students</div>
              </button>
            </div>

          {items.length === 0 ? (
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-tint text-brand">
                <Icon name="trophy" className="h-6 w-6" />
              </span>
              <h3 className="mt-3 text-base font-semibold text-slate-900">No Rankings Yet</h3>
              <p className="mt-1 text-xs text-slate-500">{emptyText}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item, index) => {
                const isCurrent =
                  isSchoolTab && userSchoolId
                    ? item.id === userSchoolId
                    : !isSchoolTab && userStudentId
                      ? item.id === userStudentId
                      : false;
                const schoolItem = isSchoolTab ? (item as SchoolRank) : null;
                const studentItem = !isSchoolTab ? (item as StudentRank) : null;
                const rank = index + 1;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-2xl border px-3 py-1 transition ${
                      isCurrent ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${getRankBadge(index)}`}
                      >
                        {index < 3 ? <Icon name="medal" className="h-5 w-5" label={`Rank ${rank}`} /> : `#${rank}`}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                          {isCurrent && (
                            <span className="shrink-0 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              You
                            </span>
                          )}
                        </div>
                        {schoolItem && (
                          <p className="text-[11px] text-slate-500">
                            {schoolItem.tier} • {schoolItem.points.toLocaleString()} pts
                          </p>
                        )}
                        {studentItem && (
                          <p className="text-[11px] text-slate-500">
                            {studentItem.totalCredits.toLocaleString()} credits
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-900 tabular-nums">
                        {schoolItem ? schoolItem.points.toLocaleString() : studentItem?.totalCredits.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomBar />
    </div>
  );
}
