import Link from "next/link";
import type { AcademicResource } from "@/lib/explore/types";
import { resourceTypeLabels } from "@/lib/explore/data/resources";

const typeIcon: Record<AcademicResource["type"], string> = {
  "unit-outline": "🗂️",
  lecture: "🎓",
  paper: "📄",
  article: "📰",
  textbook: "📘",
  video: "🎥",
  oer: "🌐",
  documentation: "🛠️",
};

export default function ResourceCard({ resource, compact = false }: { resource: AcademicResource; compact?: boolean }) {
  const external = resource.access === "external";
  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Link
      href={resource.url}
      {...linkProps}
      className="group block rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl">
          {typeIcon[resource.type]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-600">
            {resourceTypeLabels[resource.type]}
            {resource.year && <span className="text-slate-400"> · {resource.year}</span>}
          </p>
          <h3 className="mt-0.5 text-sm font-bold leading-snug text-slate-900">{resource.title}</h3>
          <p className="truncate text-xs text-slate-500">{resource.author}</p>
        </div>
        <span aria-hidden className="text-slate-400 group-hover:text-blue-600">{external ? "↗" : "→"}</span>
      </div>
      {!compact && <p className="mt-3 text-xs leading-relaxed text-slate-600">{resource.description}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${external ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-700"}`}>
          {external ? "External source" : "EduMate original"}
        </span>
        {!compact && resource.licence && <span className="text-[10px] text-slate-400">{resource.licence}</span>}
      </div>
      {external && <span className="sr-only">(opens in a new tab)</span>}
    </Link>
  );
}
