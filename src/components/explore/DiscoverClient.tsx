"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import type { Discipline, SubjectSummary } from "@/lib/explore/types";
import { exploreRoutes } from "@/lib/explore/routes";
import { useSavedInterests } from "@/lib/explore/store";
import SubjectCard from "./SubjectCard";
import { ChipButton, EmptyState, Section, SectionHeading, SwipeRow, btn } from "./ui";

// SVG path content for each discipline (drawn inside a 24×24 stroke icon).
const disciplineIcons: Record<Discipline, ReactNode> = {
  Engineering: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
    </>
  ),
  Computing: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  "Energy & Environment": (
    <>
      <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 12-4 16-9 16z" />
      <path d="M4 20c4-4 7-6 11-8" />
    </>
  ),
  "Physical Sciences": (
    <>
      <circle cx="12" cy="12" r="1.5" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </>
  ),
  "Life Sciences": (
    <>
      <path d="M7 3c0 6 10 6 10 12s-10 6-10 6M17 3c0 6-10 6-10 12s10 6 10 6" />
      <path d="M8.5 7h7M8.5 17h7" />
    </>
  ),
};

function TileSection({
  id,
  title,
  subtitle,
  subjects,
}: {
  id: string;
  title: string;
  subtitle?: string;
  subjects: SubjectSummary[];
}) {
  if (subjects.length === 0) return null;
  return (
    <Section aria-labelledby={id}>
      <SectionHeading id={id} title={title} subtitle={subtitle} />
      <div className="grid grid-cols-2 gap-3">
        {subjects.map((s) => (
          <SubjectCard key={s.slug} subject={s} variant="tile" />
        ))}
      </div>
    </Section>
  );
}

function matches(s: SubjectSummary, q: string) {
  const hay = [s.title, s.tagline, s.description, s.discipline, ...s.tags].join(" ").toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term));
}

export default function DiscoverClient({ subjects }: { subjects: SubjectSummary[] }) {
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const { saved } = useSavedInterests();

  const filtering = query.trim().length > 0 || discipline !== null;
  const results = useMemo(
    () => subjects.filter((s) => (!discipline || s.discipline === discipline) && matches(s, query)),
    [subjects, query, discipline],
  );

  const disciplines = useMemo(() => {
    const counts = new Map<Discipline, number>();
    subjects.forEach((s) => counts.set(s.discipline, (counts.get(s.discipline) ?? 0) + 1));
    return [...counts.entries()];
  }, [subjects]);

  const emerging = subjects.filter((s) => s.emerging);
  const beginner = subjects.filter((s) => s.beginnerFriendly);
  const university = subjects.filter((s) => s.universityLevel);
  const savedSubjects = subjects.filter((s) => saved.includes(s.slug));

  const clear = () => {
    setQuery("");
    setDiscipline(null);
  };

  if (subjects.length === 0) {
    return (
      <div className="mt-4">
        <EmptyState
          title="No subjects to explore yet"
          message="New subjects are being prepared. Check back soon, or continue with your current categories."
          action={<Link href={exploreRoutes.entry()} className={btn.primary}>Back to Categories</Link>}
        />
      </div>
    );
  }

  return (
    <>
      {/* Search */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <label htmlFor="discover-search" className="sr-only">Search subjects and technologies</label>
        <input
          id="discover-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subjects & technologies"
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Discipline chips */}
      <div className="mt-3">
        <SwipeRow label="Filter by discipline">
          <ChipButton active={discipline === null} onClick={() => setDiscipline(null)}>All</ChipButton>
          {disciplines.map(([d]) => (
            <ChipButton key={d} active={discipline === d} onClick={() => setDiscipline(discipline === d ? null : d)}>
              {d}
            </ChipButton>
          ))}
        </SwipeRow>
      </div>

      {filtering ? (
        <Section aria-labelledby="results">
          <SectionHeading
            id="results"
            title={`${results.length} ${results.length === 1 ? "Subject" : "Subjects"} Found`}
            action={<button type="button" onClick={clear} className="text-xs font-semibold text-blue-600">Clear</button>}
          />
          <div aria-live="polite" className="space-y-3">
            {results.length ? (
              results.map((s) => <SubjectCard key={s.slug} subject={s} />)
            ) : (
              <EmptyState
                title="No matching subjects"
                message="Try a broader word, or pick a different discipline."
                action={<button type="button" className={btn.secondary} onClick={clear}>Reset search</button>}
              />
            )}
          </div>
        </Section>
      ) : (
        <>
          <TileSection id="beginner" title="Beginner Friendly" subtitle="Foundations built in" subjects={beginner} />
          <TileSection
            id="university"
            title="University Level Learning"
            subtitle="Go deeper with university-informed curricula"
            subjects={university}
          />
          <TileSection id="emerging" title="Emerging Technologies" subjects={emerging} />
          {savedSubjects.length > 0 && <TileSection id="interests" title="My Interests" subjects={savedSubjects} />}

          {/* Disciplines */}
          <Section aria-labelledby="disciplines">
            <SectionHeading id="disciplines" title="Explore By Discipline" />
            <div className="grid grid-cols-2 gap-3">
              {disciplines.map(([d, count]) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDiscipline(d);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex flex-col items-center gap-1.5 rounded-2xl bg-white px-2 py-3 text-center shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-tint text-brand">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      {disciplineIcons[d]}
                    </svg>
                  </span>
                  <span className="text-[13px] font-semibold leading-snug text-slate-900">{d}</span>
                  <span className="-mt-1 text-[11px] text-slate-500">{count} {count === 1 ? "subject" : "subjects"}</span>
                </button>
              ))}
            </div>
          </Section>
        </>
      )}
    </>
  );
}
