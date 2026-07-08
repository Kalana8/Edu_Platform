"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";

type ProfileData = {
  name: string;
  studentId: string;
  schoolName: string;
  schoolTier: string;
  schoolCode: string;
  totalCredits: number;
  availableCredits: number;
  withheldCredits: number;
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
      <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col">
        <div className="[&>section]:!rounded-none">
          <PageHeader title="Profile" subtitle="Manage your account" gradientClass="from-blue-600 via-violet-600 to-fuchsia-600" />
        </div>

        <div className="flex flex-col gap-4 px-4 py-6">
          <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-100 text-sky-700">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Student ID</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{profile.studentId}</p>
              </div>
            </div>

            <button
              onClick={openModal}
              className="mt-4 inline-flex items-center gap-2 rounded-3xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700"
            >
              <span>✏️</span>
              Customize Student ID
            </button>
          </div>

        <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
          <p className="text-lg font-semibold text-slate-950">Your Stats</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">School Rank</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">#--</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">User Rank</p>
              <p className="mt-2 text-2xl font-semibold text-sky-600">#--</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Credits</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{profile.totalCredits.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.20)]">
          <p className="text-lg font-semibold text-slate-950">School Info</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <span>School</span>
              <span className="font-semibold text-slate-950">{profile.schoolName}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <span>School ID</span>
              <span className="font-semibold text-slate-950">{profile.schoolCode || profile.studentId.split("-").slice(0, -1).join("-")}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
              <span>Tier</span>
              <span className="font-semibold text-slate-950">{profile.schoolTier}</span>
            </div>
          </div>
        </div>
        </div>
      </main>

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
