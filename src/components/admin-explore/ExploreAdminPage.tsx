"use client";

import { useState } from "react";
import { SegmentedTabs } from "../AdminUI";
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
    { id: "community", label: "Community", count: postCount || undefined },
    { id: "reviews", label: "Lab reviews", count: reviewCount || undefined },
  ];

  return (
    <div className="text-slate-950">
      <div className="mx-auto max-w-7xl space-y-3 px-1 py-1 sm:px-2">
        <SegmentedTabs label="Explore sections" tabs={tabs} active={tab} onChange={setTab} />

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
