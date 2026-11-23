"use client";

import { useMemo, useState } from "react";
import type { AcademicResource, ResourceType, SubjectSummary } from "@/lib/explore/types";
import { resourceTypeLabels } from "@/lib/explore/data/resources";
import ResourceCard from "./ResourceCard";
import { ChipButton, EmptyState, SwipeRow, btn } from "./ui";

const PAGE_SIZE = 8;
type Sort = "title" | "newest";

export default function ResourceLibraryClient({
  resources,
  subjects,
  initialSubject,
}: {
  resources: AcademicResource[];
  subjects: SubjectSummary[];
  initialSubject?: string;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ResourceType | "all">("all");
  const [subject, setSubject] = useState(
    initialSubject && subjects.some((s) => s.slug === initialSubject) ? initialSubject : "all",
  );
  const [access, setAccess] = useState<"all" | "external" | "edumate">("all");
  const [sort, setSort] = useState<Sort>("title");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(initialSubject !== undefined);

  const typeCounts = useMemo(() => {
    const m = new Map<ResourceType, number>();
    resources.forEach((r) => m.set(r.type, (m.get(r.type) ?? 0) + 1));
    return m;
  }, [resources]);

  const filtered = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return resources
      .filter((r) => {
        if (type !== "all" && r.type !== type) return false;
        if (subject !== "all" && !r.subjectSlugs.includes(subject)) return false;
        if (access !== "all" && r.access !== access) return false;
        const hay = `${r.title} ${r.author} ${r.description}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      })
      .sort((a, b) =>
        sort === "newest" ? (b.year ?? "0").localeCompare(a.year ?? "0") : a.title.localeCompare(b.title),
      );
  }, [resources, query, type, subject, access, sort]);

  const activeFilters = Number(subject !== "all") + Number(access !== "all") + Number(sort !== "title");

  const resetAll = () => {
    setQuery("");
    setType("all");
    setSubject("all");
    setAccess("all");
    setSort("title");
    setLimit(PAGE_SIZE);
  };

  if (resources.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState title="The library is empty" message="Academic resources will appear here once they have been curated." />
      </div>
    );
  }

  const selectCls = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm";

  return (
    <>
      {/* Search + filter toggle */}
      <div className="mt-4 flex gap-2">
        <label htmlFor="res-search" className="sr-only">Search resources</label>
        <input
          id="res-search"
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setLimit(PAGE_SIZE); }}
          placeholder="Search title, author, topic"
          className="min-w-0 flex-1 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className={`relative shrink-0 rounded-2xl px-4 text-sm font-semibold shadow-sm ${showFilters ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}
        >
          Filters
          {activeFilters > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="mt-3 space-y-2 rounded-[1.75rem] bg-white p-4 shadow-sm">
          <select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Filter by subject" className={selectCls}>
            <option value="all">All subjects</option>
            {subjects.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
          </select>
          <select value={access} onChange={(e) => setAccess(e.target.value as typeof access)} aria-label="Filter by source" className={selectCls}>
            <option value="all">All sources</option>
            <option value="external">External sources</option>
            <option value="edumate">EduMate originals</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort" className={selectCls}>
            <option value="title">Sort: A–Z</option>
            <option value="newest">Sort: Newest first</option>
          </select>
          <button type="button" onClick={resetAll} className="w-full py-2 text-xs font-semibold text-blue-600">Reset all</button>
        </div>
      )}

      {/* Category chips */}
      <div className="mt-3">
        <SwipeRow label="Resource categories">
          {(["all", ...Object.keys(resourceTypeLabels)] as (ResourceType | "all")[]).map((t) => (
            <ChipButton key={t} active={type === t} onClick={() => { setType(t); setLimit(PAGE_SIZE); }}>
              {t === "all" ? "All" : resourceTypeLabels[t]} · {t === "all" ? resources.length : typeCounts.get(t) ?? 0}
            </ChipButton>
          ))}
        </SwipeRow>
      </div>

      <p className="mt-3 text-xs text-slate-500" aria-live="polite">
        Showing {Math.min(limit, filtered.length)} of {filtered.length} resources
      </p>

      {filtered.length ? (
        <div className="mt-2 space-y-3">
          {filtered.slice(0, limit).map((r) => <ResourceCard key={r.id} resource={r} />)}
          {limit < filtered.length && (
            <button type="button" onClick={() => setLimit((l) => l + PAGE_SIZE)} className={`${btn.secondary} w-full`}>
              Load more
            </button>
          )}
        </div>
      ) : (
        <div className="mt-2">
          <EmptyState
            title="No resources match"
            message="Try different keywords or remove a filter."
            action={<button type="button" onClick={resetAll} className={btn.secondary}>Clear filters</button>}
          />
        </div>
      )}
    </>
  );
}
