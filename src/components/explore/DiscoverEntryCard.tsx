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
      className="group relative block overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-5 text-white shadow-xl transition hover:-translate-y-0.5"
    >
      <div aria-hidden className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 transition group-hover:scale-150" />
      <div className="relative flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-white/15 text-3xl">🔭</div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-100">New</p>
          <p className="text-lg font-bold">Discover Advanced Subjects</p>
          <p className="text-xs text-blue-100">Robotics, AI, energy, chips & more — start from zero</p>
        </div>
        <span className="rounded-full bg-white/15 p-2 transition group-hover:bg-white group-hover:text-blue-700">→</span>
      </div>
    </Link>
  );
}
