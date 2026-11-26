"use client";

import Link from "next/link";
import type { LabProject } from "@/lib/explore/types";
import { exploreRoutes } from "@/lib/explore/routes";
import { useProjectState } from "@/lib/explore/store";
import { activityLabels } from "@/lib/explore/labels";
import Icon, { type IconName } from "@/components/Icon";
import { DifficultyBadge, ProgressBar } from "./ui";
import { titleCase } from "@/lib/titleCase";

const typeIcon: Record<LabProject["type"], IconName> = {
  simulation: "sliders",
  coding: "code",
  challenge: "building",
  experiment: "microscope",
  project: "rocket",
};

export default function ProjectCard({ project, subjectTitle }: { project: LabProject; subjectTitle?: string }) {
  const { state } = useProjectState(project.id);
  const done = state.completedSteps.length;
  const pct = (done / project.steps.length) * 100;
  const status = state.submission ? "Submitted" : state.started ? "In progress" : "New";

  return (
    <Link
      href={exploreRoutes.project(project.id)}
      className="group block rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-brand-tint text-brand transition group-hover:scale-105">
          <Icon name={typeIcon[project.type]} className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold text-blue-600">{titleCase(activityLabels[project.type])}</p>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                state.submission
                  ? "bg-emerald-100 text-emerald-700"
                  : state.started
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {status}
            </span>
          </div>
          <h3 className="mt-1 font-bold leading-snug text-slate-900">{project.title}</h3>
          {subjectTitle && <p className="text-[11px] text-slate-500">{subjectTitle}</p>}
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-600">{project.summary}</p>
      <div className="mt-3 flex items-center gap-2">
        <DifficultyBadge level={project.difficulty} />
        <span className="text-[11px] text-slate-500">~{project.durationMins} min</span>
      </div>
      {state.started && (
        <div className="mt-3">
          <ProgressBar value={pct} label={`${done}/${project.steps.length} steps`} />
        </div>
      )}
    </Link>
  );
}
