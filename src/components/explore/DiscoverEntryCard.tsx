import Link from "next/link";
import { exploreRoutes } from "@/lib/explore/routes";

/**
 * The single entry point into the Explore expansion.
 * Rendered on the existing Category screen
 * (src/app/(student)/choose-category/page.tsx), above the category grid.
 */
export default function DiscoverEntryCard() {
  return (
    <Link
      href={exploreRoutes.discover()}
      className="group relative block overflow-hidden rounded-2xl bg-brand px-4 py-3 text-white shadow-lg shadow-brand/25 transition hover:-translate-y-0.5"
    >
      <div aria-hidden className="absolute -right-6 -top-10 h-24 w-24 rounded-full bg-white/10 transition group-hover:scale-150" />
      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="m15.5 8.5-2 5-5 2 2-5z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold leading-tight">Discover Advanced Subjects</p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 transition group-hover:bg-white group-hover:text-brand">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
