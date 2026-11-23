"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Discipline, SubjectSummary } from "@/lib/explore/types";
import { exploreRoutes } from "@/lib/explore/routes";
import { useSavedInterests } from "@/lib/explore/store";
import SubjectCard from "./SubjectCard";
import { ChipButton, EmptyState, Section, SectionHeading, SwipeRow, btn, formatDate } from "./ui";

const disciplineIcons: Record<Discipline, string> = {
  Engineering: "⚙️",
  Computing: "💻",
  "Energy & Environment": "🌱",
  "Physical Sciences": "⚛️",
  "Life Sciences": "🧬",
};

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

  const featured = subjects.filter((s) => s.featured && s.status === "available");
  const trending = subjects.filter((s) => s.trending).sort((a, b) => b.learnersExploring - a.learnersExploring);
  const emerging = subjects.filter((s) => s.emerging);
  const beginner = subjects.filter((s) => s.beginnerFriendly);
  const university = subjects.filter((s) => s.universityLevel);
  const recent = [...subjects].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 4);
  const savedSubjects = subjects.filter((s) => saved.includes(s.slug));

  const recommended = useMemo(() => {
    const liked = new Set(subjects.filter((s) => saved.includes(s.slug)).map((s) => s.discipline));
    const pool = subjects.filter((s) => !saved.includes(s.slug) && s.status === "available");
    const ranked = liked.size
      ? [...pool].sort((a, b) => Number(liked.has(b.discipline)) - Number(liked.has(a.discipline)))
      : pool.filter((s) => s.beginnerFriendly);
    return ranked.slice(0, 3);
  }, [subjects, saved]);

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
            title={`${results.length} ${results.length === 1 ? "subject" : "subjects"} found`}
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
          {/* Featured */}
          <Section aria-labelledby="featured">
            <SectionHeading id="featured" title="Featured discoveries" subtitle="Start from zero — no experience needed" />
            <SwipeRow label="Featured subjects">
              {featured.map((s) => (
                <div key={s.slug} className="w-[78%] shrink-0 snap-start">
                  <SubjectCard subject={s} />
                </div>
              ))}
            </SwipeRow>
          </Section>

          {/* My interests */}
          {savedSubjects.length > 0 && (
            <Section aria-labelledby="interests">
              <SectionHeading id="interests" title="My interests" />
              <div className="space-y-2">
                {savedSubjects.map((s) => <SubjectCard key={s.slug} subject={s} variant="compact" />)}
              </div>
            </Section>
          )}

          {/* Recommended */}
          <Section aria-labelledby="recommended">
            <SectionHeading
              id="recommended"
              title="Recommended for you"
              subtitle={savedSubjects.length ? "Based on your interests" : "Great places to begin"}
            />
            <div className="space-y-2">
              {recommended.map((s) => <SubjectCard key={s.slug} subject={s} variant="compact" />)}
            </div>
          </Section>

          {/* Trending */}
          <Section aria-labelledby="trending">
            <SectionHeading id="trending" title="Trending now" />
            <ol className="divide-y divide-slate-100 rounded-[1.75rem] border border-slate-200/80 bg-white px-4 shadow-sm">
              {trending.map((s, i) => (
                <li key={s.slug}>
                  <Link href={exploreRoutes.subject(s.slug)} className="flex items-center gap-3 py-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">{s.title}</span>
                      <span className="block text-[11px] text-slate-500">{s.learnersExploring.toLocaleString("en-GB")} learners exploring</span>
                    </span>
                    <span className="text-slate-400">→</span>
                  </Link>
                </li>
              ))}
            </ol>
          </Section>

          {/* Emerging */}
          <Section aria-labelledby="emerging">
            <SectionHeading id="emerging" title="Emerging technologies" />
            <SwipeRow label="Emerging technologies">
              {emerging.map((s) => (
                <div key={s.slug} className="w-[78%] shrink-0 snap-start">
                  <SubjectCard subject={s} />
                </div>
              ))}
            </SwipeRow>
          </Section>

          {/* Disciplines */}
          <Section aria-labelledby="disciplines">
            <SectionHeading id="disciplines" title="Explore by discipline" />
            <div className="grid grid-cols-2 gap-3">
              {disciplines.map(([d, count]) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDiscipline(d);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-sm transition hover:border-blue-200 hover:shadow-lg"
                >
                  <span aria-hidden className="text-2xl">{disciplineIcons[d]}</span>
                  <span className="mt-2 text-sm font-semibold text-slate-900">{d}</span>
                  <span className="text-[11px] text-slate-500">{count} {count === 1 ? "subject" : "subjects"}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Beginner-friendly */}
          <Section aria-labelledby="beginner">
            <SectionHeading id="beginner" title="Beginner-friendly" subtitle="Foundations built in" />
            <div className="space-y-2">
              {beginner.map((s) => <SubjectCard key={s.slug} subject={s} variant="compact" />)}
            </div>
          </Section>

          {/* University-level */}
          <Section aria-labelledby="university">
            <SectionHeading id="university" title="University-level learning" subtitle="Go deeper with university-informed curricula" />
            <div className="space-y-2">
              {university.map((s) => <SubjectCard key={s.slug} subject={s} variant="compact" />)}
            </div>
          </Section>

          {/* Recently added */}
          <Section aria-labelledby="recent">
            <SectionHeading id="recent" title="Recently added" />
            <div className="space-y-2">
              {recent.map((s) => (
                <Link
                  key={s.slug}
                  href={exploreRoutes.subject(s.slug)}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">{s.title}</span>
                    <span className="block text-[11px] text-slate-500">
                      Added {formatDate(s.addedAt)} · {s.status === "available" ? "Full pathway" : "In development"}
                    </span>
                  </span>
                  <span className="text-slate-400">→</span>
                </Link>
              ))}
            </div>
          </Section>
        </>
      )}
    </>
  );
}
