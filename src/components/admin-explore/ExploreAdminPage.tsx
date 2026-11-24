"use client";

import { useState } from "react";
import LabsPanel from "./LabsPanel";
import ResourcesPanel from "./ResourcesPanel";
import { CommunityReviewPanel, LabReviewPanel, useModerationQueue } from "./ReviewPanels";
import SubjectsPanel from "./SubjectsPanel";

type Tab = "subjects" | "labs" | "resources" | "community" | "reviews";

export default function ExploreAdminPage({ role }: { role: "admin" | "moderator" }) {
  const canEdit = role === "admin";
  const [tab, setTab] = useState<Tab>(canEdit ? "subjects" : "community");
  const moderation = useModerationQueue();

  const postCount = (moderation.queue?.pendingPosts.length ?? 0) + (moderation.queue?.reportedPosts.length ?? 0);
  const reviewCount = moderation.queue?.pendingSubmissions.length ?? 0;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "subjects", label: "Subjects" },
    { id: "labs", label: "Labs" },
    { id: "resources", label: "Resources" },
    { id: "community", label: "Community", count: postCount },
    { id: "reviews", label: "Lab reviews", count: reviewCount },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl space-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="rounded-4xl bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Explore</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Manage Discover &amp; Explore</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            {canEdit
              ? "Add and edit the subjects, labs and resources students see, and review community posts and lab work."
              : "Review community posts and lab submissions. Content is managed by admins (view only)."}
          </p>
        </div>

        <div role="tablist" aria-label="Explore sections" className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                tab === t.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
              }`}
            >
              {t.label}
              {!!t.count && (
                <span className={`rounded-full px-2 py-0.5 text-xs ${tab === t.id ? "bg-white/20" : "bg-rose-100 text-rose-700"}`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        <div role="tabpanel">
          {tab === "subjects" && <SubjectsPanel canEdit={canEdit} />}
          {tab === "labs" && <LabsPanel canEdit={canEdit} />}
          {tab === "resources" && <ResourcesPanel canEdit={canEdit} />}
          {tab === "community" && <CommunityReviewPanel state={moderation} />}
          {tab === "reviews" && <LabReviewPanel state={moderation} />}
        </div>
      </div>
    </div>
  );
}
