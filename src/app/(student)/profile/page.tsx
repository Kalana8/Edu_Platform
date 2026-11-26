"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import MobileLoader from "@/components/MobileLoader";
import BottomBar from "@/components/BottomBar";
import StudentLogoutButton from "@/components/StudentLogoutButton";

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
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const openModal = () => {
    if (profile) {
      // Start empty rather than with the auto-generated "Student <number>".
      setEditName(/^Student \S+$/.test(profile.name.trim()) ? "" : profile.name);
      setFeedback(null);
      setIsModalOpen(true);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editName.trim()) {
      setFeedback({ type: "error", message: "Name cannot be empty." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/student/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update name.");
      }

      if (payload.student) {
        setProfile((prev) => prev ? { ...prev, name: payload.student.name } : prev);
      }

      setIsModalOpen(false);
      setFeedback({ type: "success", message: "Name updated successfully." });
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Failed to update name." });
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
            <PageHeader title="Profile" />
          </div>
          <MobileLoader label="Loading profile…" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 pb-24">
        <main className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col">
          <div className="[&>section]:!rounded-none">
            <PageHeader title="Profile" />
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

  // Sign-up saves "Student <number>" when no name is given; treat that as no name.
  const trimmedName = (profile.name ?? "").trim();
  const displayName = /^Student \S+$/.test(trimmedName) ? "" : trimmedName;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 pb-28">
      <main className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col">
        {/* Banner */}
        <div className="relative h-28 overflow-hidden bg-linear-to-br from-blue-700 via-brand to-blue-300 px-5 pt-4">
          <div aria-hidden className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <div aria-hidden className="absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-white/10" />
          <h1 className="relative text-2xl font-semibold tracking-tight text-white">Profile</h1>
        </div>

        {/* Identity + stats */}
        <section className="bg-white px-5 pb-4 shadow-sm">
          <div className="flex items-end gap-4">
            <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand text-3xl font-semibold text-white shadow-lg ring-4 ring-white">
              {(displayName || profile.name).charAt(0).toUpperCase()}
            </div>
            <dl className="grid flex-1 grid-cols-3 gap-2 pt-3">
              <ProfileStat label="Credits" value={profile.totalCredits.toLocaleString()} />
              <ProfileStat label="School rank" value={profile.schoolRank ? `#${profile.schoolRank}` : "--"} />
              <ProfileStat label="My rank" value={profile.studentRank ? `#${profile.studentRank}` : "--"} />
            </dl>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              {displayName && (
                <p className="truncate text-xl font-bold leading-tight tracking-tight text-slate-950">{displayName}</p>
              )}
              <p className="mt-0.5 text-xs font-medium text-slate-500">{profile.studentId}</p>
            </div>
            <button
              type="button"
              onClick={openModal}
              aria-label={displayName ? "Customise name" : "Add your name"}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-brand-tint px-3 text-xs font-semibold text-brand transition hover:bg-brand hover:text-white active:scale-[0.97]"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
                <path d="m13.5 6.5 4 4" />
              </svg>
              {displayName ? "Edit" : "Add name"}
            </button>
          </div>
        </section>

        <div className="flex flex-col gap-4 px-4 py-4">
          {/* Wallet and leaderboard (moved here from the bottom bar) */}
          <section>
            <h2 className="mb-2 px-1 text-[11px] font-semibold text-slate-500">My Progress</h2>
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
              <LinkRow href="/wallet" label="Wallet" hint={`${profile.availableCredits.toLocaleString()} credits`}>
                <rect x="2" y="5" width="20" height="16" rx="3" />
                <path d="M2 10h20M16 15h2" />
              </LinkRow>
              <LinkRow href="/ranks" label="Leaderboard" hint={profile.studentRank ? `You're #${profile.studentRank}` : undefined}>
                <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
                <path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />
              </LinkRow>
            </ul>
          </section>

          {/* School information */}
          <section>
            <h2 className="mb-2 px-1 text-[11px] font-semibold text-slate-500">School Information</h2>
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
              <InfoRow label="School" value={profile.schoolName}>
                <path d="M3 21h18M5 21V10l7-5 7 5v11" />
                <path d="M10 21v-5h4v5" />
              </InfoRow>
              <InfoRow label="School ID" value={profile.schoolCode || profile.studentId.split("-").slice(0, -1).join("-")}>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="9" cy="11" r="2" />
                <path d="M6 16c.6-1.4 1.7-2 3-2s2.4.6 3 2M15 10h3M15 13h3" />
              </InfoRow>
              <InfoRow label="Tier" value={profile.schoolTier}>
                <path d="m12 3 9 5-9 5-9-5z" />
                <path d="m3 13 9 5 9-5" />
              </InfoRow>
            </ul>
          </section>

          <StudentLogoutButton />
        </div>
      </main>

      <BottomBar />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-xl rounded-4xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Customise Profile</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Customise Name</h2>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="Close" className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            {feedback && (
              <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                {feedback.message}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSave}>
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">Name</span>
                <input
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
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

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <dd className="text-lg font-bold leading-tight text-slate-950">{value}</dd>
      <dt className="text-[11px] text-slate-500">{label}</dt>
    </div>
  );
}

function InfoRow({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {children}
        </svg>
      </span>
      <span className="text-sm text-slate-500">{label}</span>
      <span className="ml-auto truncate pl-2 text-right text-sm font-semibold text-slate-900">{value}</span>
    </li>
  );
}

function LinkRow({ href, label, hint, children }: { href: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 px-4 py-3 transition hover:bg-blue-50/50">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {children}
          </svg>
        </span>
        <span className="flex-1 text-sm font-semibold text-slate-900">{label}</span>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
        <svg className="h-4 w-4 shrink-0 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Link>
    </li>
  );
}
