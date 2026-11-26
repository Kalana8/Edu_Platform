import Link from "next/link";
import { titleCase } from "@/lib/titleCase";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Shows a back arrow at the left of the bar when set. */
  backHref?: string;
  /** Accessible name for the back arrow, e.g. "Back to Categories". */
  backLabel?: string;
  topPadding?: boolean;
  rounded?: boolean;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  topPadding = true,
  rounded = true,
  className = "",
}: PageHeaderProps) {
  const paddingClass = topPadding ? "pt-4 pb-4" : "pt-0 pb-4";
  const radiusClass = rounded ? "rounded-[1.75rem]" : "rounded-none";

  return (
    <section className={`overflow-hidden ${radiusClass} bg-brand px-5 ${paddingClass} text-white shadow-lg shadow-slate-950/10 ${className}`}>
      <div className="flex items-center gap-2">
        {backHref && (
          <Link
            href={backHref}
            aria-label={backLabel}
            className="-ml-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 active:scale-95"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5" />
              <path d="m11 18-6-6 6-6" />
            </svg>
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{titleCase(title)}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-100/90">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}
