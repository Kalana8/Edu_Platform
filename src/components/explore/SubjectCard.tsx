import Link from "next/link";
import type { SubjectSummary } from "@/lib/explore/types";
import { exploreRoutes } from "@/lib/explore/routes";
import SubjectVisual from "./SubjectVisual";
import { DifficultyBadge } from "./ui";
import { titleCase } from "@/lib/titleCase";

export default function SubjectCard({
  subject,
  variant = "default",
  caption,
}: {
  subject: SubjectSummary;
  variant?: "default" | "compact" | "tile";
  /** Small line under the title (tile variant only). */
  caption?: string;
}) {
  const href = exploreRoutes.subject(subject.slug);
  const comingSoon = subject.status === "coming-soon";

  // Centred card matching the category grid on the Choose Category screen.
  if (variant === "tile") {
    return (
      <Link
        href={href}
        className="group flex flex-col items-center gap-1.5 rounded-2xl bg-white px-2 py-3 text-center shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <SubjectVisual motif={subject.motif} theme={subject.theme} className="h-12 w-16 rounded-xl transition group-hover:scale-105" />
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-slate-900">{subject.title}</p>
        {(caption || comingSoon) && (
          <p className="-mt-1 text-[11px] text-slate-500">{caption ?? "In development"}</p>
        )}
      </Link>
    );
  }

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
        <p className="text-[10px] font-semibold" style={{ color: subject.theme.ink }}>
          {titleCase(subject.discipline)}
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
