"use client";

import Link from "next/link";
import { useState } from "react";
import type { AcademicResource, CurriculumModule as Module } from "@/lib/explore/types";
import { exploreRoutes } from "@/lib/explore/routes";
import { existingRoutes } from "@/lib/explore/integration";
import Icon from "@/components/Icon";

type RefMap = Record<string, Pick<AcademicResource, "id" | "title" | "url" | "access">>;

export function SourceBadge({ source }: { source: "edumate" | "reference" }) {
  return source === "edumate" ? (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-200">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-blue-600" /> EduMate
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Reference
    </span>
  );
}

export default function CurriculumModules({
  modules,
  resources,
  projectTitles,
  categorySlug,
}: {
  modules: Module[];
  resources: RefMap;
  projectTitles: Record<string, string>;
  categorySlug?: string;
}) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(modules.slice(0, 1).map((m) => m.id)));
  const allOpen = open.size === modules.length;

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(modules.map((m) => m.id)))}
          className="text-xs font-semibold text-blue-600"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>
      <ol className="space-y-3">
        {modules.map((m) => {
          const isOpen = open.has(m.id);
          const panelId = `${m.id}-panel`;
          return (
            <li key={m.id} className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(m.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold transition ${
                      isOpen ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {String(m.number).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold leading-snug text-slate-900">{m.title}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">
                      {m.weeks} · {m.topics.length} lessons
                    </span>
                  </span>
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </h3>

              {isOpen && (
                <div id={panelId} className="border-t border-slate-100 px-4 pb-4 pt-3">
                  <p className="text-sm text-slate-600">{m.summary}</p>

                  <ul className="mt-3 space-y-2">
                    {m.topics.map((t, i) => (
                      <li key={t.id}>
                        <Link
                          href={
                            t.microLessonId
                              ? existingRoutes.microLesson(t.microLessonId)
                              : categorySlug
                                ? existingRoutes.category(categorySlug)
                                : existingRoutes.learn
                          }
                          className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition hover:bg-blue-50"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[11px] font-bold text-slate-500 shadow-sm">
                            {m.number}.{i + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-slate-800">{t.title}</span>
                            <span className="mt-1 flex items-center gap-2">
                              <SourceBadge source={t.source} />
                              <span className="text-[10px] text-slate-500">{t.durationMins} min</span>
                            </span>
                          </span>
                          <span className="text-slate-400">›</span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 space-y-3">
                    <RefList title="Lecture References" ids={m.lectureRefs} resources={resources} />
                    <RefList title="Recommended Readings" ids={m.readings} resources={resources} />
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700"><Icon name="flask" className="h-3.5 w-3.5" /> Practical Activity</p>
                      {m.practicalId ? (
                        <Link
                          href={exploreRoutes.project(m.practicalId)}
                          className="mt-1.5 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"
                        >
                          {projectTitles[m.practicalId] ?? "Open lab"} <span>→</span>
                        </Link>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400">Guided reflection on the blank-page workspace</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function RefList({ title, ids, resources }: { title: string; ids: string[]; resources: RefMap }) {
  const items = ids.map((id) => resources[id]).filter(Boolean);
  return (
    <div>
      <p className="text-xs font-bold text-slate-700">{title}</p>
      {items.length ? (
        <ul className="mt-1 space-y-1">
          {items.map((r) => (
            <li key={r.id}>
              <Link
                href={r.url}
                {...(r.access === "external" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="text-sm text-blue-700 underline decoration-blue-200 underline-offset-2"
              >
                {r.title}
                {r.access === "external" && <span aria-hidden> ↗</span>}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-xs text-slate-400">EduMate lesson content only</p>
      )}
    </div>
  );
}
