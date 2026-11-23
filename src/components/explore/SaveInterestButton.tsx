"use client";

import { useSavedInterests } from "@/lib/explore/store";

export default function SaveInterestButton({ slug, className = "" }: { slug: string; className?: string }) {
  const { isSaved, toggle } = useSavedInterests();
  const saved = isSaved(slug);
  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
        saved
          ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {saved ? "Saved to My Interests" : "Save to My Interests"}
    </button>
  );
}
