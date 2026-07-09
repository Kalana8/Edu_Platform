"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import BottomBar from "@/components/BottomBar";

type ProfileData = {
  name: string;
  studentId: string;
  schoolName: string;
  schoolTier: string;
  schoolCode: string;
  totalCredits: number;
  availableCredits: number;
  withheldCredits: number;
  schoolRank: number | null;
  studentRank: number | null;
};

type ReadingStats = {
  activeCount: number;
  completedCount: number;
  totalPagesRead: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [reading, setReading] = useState<ReadingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStudentId, setEditStudentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const openModal = () => {
    if (profile) {
      setEditStudentId(profile.studentId);
      setFeedback(null);
      setIsModalOpen(true);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editStudentId.trim()) {
      setFeedback({ type: "error", message: "Student ID cannot be empty." });
      return;
    }

    if (profile) {
      const currentPrefix = profile.studentId.split("-").slice(0, -1).join("-");
      const newPrefix = editStudentId.trim().split("-").slice(0, -1).join("-");
      if (newPrefix !== currentPrefix) {
        setFeedback({ type: "error", message: `Student ID must start with ${currentPrefix}-` });
        return;
      }
    }

    setSaving(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/student/customize-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: editStudentId.trim() }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update student ID.");
      }

      if (payload.student) {
        setProfile((prev) => prev ? { ...prev, studentId: payload.student.studentId, name: payload.student.name } : prev);
      }

      setIsModalOpen(false);
      setFeedback({ type: "success", message: "Student ID updated successfully." });
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Failed to update student ID." });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
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
          throw new Error(payload.error || "Unable to load profile.");
        }

        if (payload.profile) {
          setProfile(payload.profile);
        }
        if (payload.reading) {
          setReading(payload.reading);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
        <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col">
          <div className="[&>section]:!rounded-none">
            <PageHeader title="Profile" subtitle="Manage your account" gradientClass="from-blue-600 via-violet-600 to-fuchsia-600" />
          </div>
          <div className="px-4 py-6">
            <div className="rounded-[1.75rem] bg-white p-6 text-center text-sm text-slate-500 shadow-sm">Loading profile…</div>
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
            <PageHeader title="Profile" subtitle="Manage your account" gradientClass="from-blue-600 via-violet-600 to-fuchsia-600" />
          </div>
          <div className="px-4 py-6">
            <div className="rounded-[1.75rem] bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
      <main className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col">
        <div className="[&>section]:!rounded-none">
          <PageHeader title="Profile" subtitle="Manage your account" gradientClass="from-blue-600 via-violet-600 to-fuchsia-600" />
        </div>

        <div className="flex flex-col gap-3 px-4 py-6">
          <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 text-3xl text-white shadow-lg shadow-blue-600/20">
                <span>{profile.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Student ID</p>
                <p className="mt-2 text-lg font-bold text-slate-950 tracking-tight">{profile.studentId}</p>
              </div>
            </div>

            <button
              onClick={openModal}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <span className="text-base">✏️</span>
              Customize Student ID
            </button>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-bold">
                Your Statistics
              </h2>
              <p className="text-sm text-slate-500">
                Track your learning progress
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-3xl bg-blue-50 p-5">
                <div className="text-2xl">🏫</div>
                <p className="mt-3 text-xs uppercase tracking-wider text-blue-600">
                  School Rank
                </p>
                <p className="mt-2 text-3xl font-bold text-blue-900">
                  {profile.schoolRank ? `#${profile.schoolRank}` : "#--"}
                </p>
              </div>

              <div className="rounded-3xl bg-amber-50 p-5">
                <div className="text-2xl">🏆</div>
                <p className="mt-3 text-xs uppercase tracking-wider text-amber-700">
                  Student Rank
                </p>
                <p className="mt-2 text-3xl font-bold text-amber-900">
                  {profile.studentRank ? `#${profile.studentRank}` : "#--"}
                </p>
              </div>

              <div className="col-span-2 rounded-3xl bg-emerald-50 p-5">
                <div className="text-2xl">⭐</div>
                <p className="mt-3 text-xs uppercase tracking-wider text-emerald-700">
                  Total Learning Credits
                </p>
                <p className="mt-2 text-4xl font-bold text-emerald-900">
                  {profile.totalCredits.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-bold">
                School Information
              </h2>
              <p className="text-sm text-slate-500">
                Your registered school details
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    School
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {profile.schoolName}
                  </p>
                </div>
                <span className="text-xl">🏫</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    School ID
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {profile.schoolCode || profile.studentId.split("-").slice(0, -1).join("-")}
                  </p>
                </div>
                <span className="text-xl">🆔</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Tier
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {profile.schoolTier}
                  </p>
                </div>
                <span className="text-xl">🎓</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      <BottomBar />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-xl rounded-4xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Customize profile</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Customize Student ID</h2>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">✕</button>
            </div>

            {feedback && (
              <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                {feedback.message}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSave}>
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">Student ID</span>
                <input
                  type="text"
                  value={editStudentId}
                  onChange={(event) => setEditStudentId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  required
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400">{saving ? "Saving..." : "Save changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
