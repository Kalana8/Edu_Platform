import Link from "next/link";
import type { SubjectSummary } from "@/lib/explore/types";
import { exploreRoutes } from "@/lib/explore/routes";
import SubjectVisual from "./SubjectVisual";
import { DifficultyBadge } from "./ui";

export default function SubjectCard({
  subject,
  variant = "default",
}: {
  subject: SubjectSummary;
  variant?: "default" | "compact";
}) {
  const href = exploreRoutes.subject(subject.slug);
  const comingSoon = subject.status === "coming-soon";

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className="group flex items-center gap-3 rounded-[1.5rem] border border-slate-200/80 bg-white p-2.5 pr-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
      >
        <SubjectVisual motif={subject.motif} theme={subject.theme} className="h-14 w-16 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{subject.title}</p>
          <p className="truncate text-xs text-slate-500">{subject.tagline}</p>
        </div>
        <span className="text-slate-400 transition group-hover:text-blue-600">→</span>
      </Link>
    );
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm">
      <div className="relative">
        <SubjectVisual motif={subject.motif} theme={subject.theme} className="aspect-[2/1] w-full" title={`${subject.title} illustration`} />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {subject.emerging && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-800">Emerging</span>
          )}
          {comingSoon && (
            <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold text-white">In development</span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: subject.theme.ink }}>
          {subject.discipline}
        </p>
        <h3 className="mt-1 font-bold leading-snug text-slate-900">{subject.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">{subject.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <DifficultyBadge level={subject.difficulty} />
          <span className="text-[11px] text-slate-500">~{subject.estimatedHours} hrs</span>
        </div>
        <div className="mt-auto pt-4">
          <Link
            href={href}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
            aria-label={`Explore ${subject.title}`}
          >
            Explore →
          </Link>
        </div>
      </div>
    </article>
  );
}
