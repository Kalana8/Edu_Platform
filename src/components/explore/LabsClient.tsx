"use client";

import { useMemo, useState } from "react";
import type { ActivityType, LabProject, SubjectSummary } from "@/lib/explore/types";
import { useAllProjectStates } from "@/lib/explore/store";
import { activityLabels } from "@/lib/explore/labels";
import ProjectCard from "./ProjectCard";
import { ChipButton, EmptyState, SwipeRow, btn } from "./ui";
import Icon, { type IconName } from "@/components/Icon";

type Tab = "all" | "in-progress" | "completed";

export default function LabsClient({
  projects,
  subjects,
  initialSubject,
}: {
  projects: LabProject[];
  subjects: SubjectSummary[];
  initialSubject?: string;
}) {
  const [subject, setSubject] = useState<string>(
    initialSubject && subjects.some((s) => s.slug === initialSubject) ? initialSubject : "all",
  );
  const [type, setType] = useState<ActivityType | "all">("all");
  const [tab, setTab] = useState<Tab>("all");
  const states = useAllProjectStates();

  const titleBySlug = useMemo(() => Object.fromEntries(subjects.map((s) => [s.slug, s.title])), [subjects]);
  const subjectsWithLabs = subjects.filter((s) => projects.some((p) => p.subjectSlug === s.slug));

  const counts = {
    started: projects.filter((p) => states[p.id]?.started && !states[p.id]?.submission).length,
    submitted: projects.filter((p) => states[p.id]?.submission).length,
  };

  const visible = projects.filter((p) => {
    if (subject !== "all" && p.subjectSlug !== subject) return false;
    if (type !== "all" && p.type !== type) return false;
    const st = states[p.id];
    if (tab === "in-progress") return !!st?.started && !st.submission;
    if (tab === "completed") return !!st?.submission;
    return true;
  });

  if (projects.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState title="No labs available yet" message="Virtual labs and projects will appear here as subjects are published." />
      </div>
    );
  }

  const reset = () => {
    setSubject("all");
    setType("all");
    setTab("all");
  };

  return (
    <>
      {/* Progress summary */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ["flask", projects.length, "Available"],
          ["hourglass", counts.started, "In Progress"],
          ["check-circle", counts.submitted, "Completed"],
        ].map(([icon, v, k]) => (
          <div key={k as string} className="rounded-2xl bg-white p-3 text-center shadow-sm">
            <Icon name={icon as IconName} className="mx-auto h-5 w-5 text-brand" />
            <p className="text-xl font-bold text-slate-900">{v}</p>
            <p className="text-[10px] text-slate-500">{k}</p>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div role="tablist" aria-label="Lab status" className="mt-4 flex rounded-2xl bg-slate-200/60 p-1 text-xs font-semibold">
        {([
          ["all", "All"],
          ["in-progress", "In progress"],
          ["completed", "Completed"],
        ] as [Tab, string][]).map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`flex-1 rounded-xl py-2 transition ${tab === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        aria-label="Filter by subject"
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
      >
        <option value="all">All subjects</option>
        {subjectsWithLabs.map((s) => (
          <option key={s.slug} value={s.slug}>{s.title}</option>
        ))}
      </select>
      <div className="mt-3">
        <SwipeRow label="Filter by activity type">
          <ChipButton active={type === "all"} onClick={() => setType("all")}>All types</ChipButton>
          {(Object.keys(activityLabels) as ActivityType[]).map((t) => (
            <ChipButton key={t} active={type === t} onClick={() => setType(t)}>
              {activityLabels[t]}
            </ChipButton>
          ))}
        </SwipeRow>
      </div>

      <div className="mt-3 space-y-3" aria-live="polite">
        {visible.length ? (
          visible.map((p) => <ProjectCard key={p.id} project={p} subjectTitle={titleBySlug[p.subjectSlug]} />)
        ) : (
          <EmptyState
            title={tab === "completed" ? "No completed projects yet" : tab === "in-progress" ? "Nothing in progress" : "No labs match"}
            message={tab === "all" ? "Try a different subject or type." : "Open a lab and work through its steps — progress saves automatically."}
            action={<button type="button" onClick={reset} className={btn.secondary}>Show all labs</button>}
          />
        )}
      </div>
    </>
  );
}
