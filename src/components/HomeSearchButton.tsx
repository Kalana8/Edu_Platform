"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { MobileSpinner } from "@/components/MobileLoader";
import { slugToLabel } from "@/lib/slug";
import { titleCase } from "@/lib/titleCase";

type Category = { slug: string; label: string };

export default function HomeSearchButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load categories the first time the sheet opens.
  useEffect(() => {
    if (!open || categories !== null) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/categories");
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Unable to load categories.");
        const mapped: Category[] = (payload.categories ?? [])
          .filter((c: { status: string }) => c.status === "Active")
          .map((c: { slug: string; label?: string }) => ({
            slug: c.slug,
            label: titleCase(c.label ?? slugToLabel(c.slug)),
          }));
        if (!cancelled) setCategories(mapped);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load categories.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, categories]);

  // Focus the input, lock page scroll and close on Escape while open.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const results = useMemo(() => {
    if (!categories) return [];
    const q = query.trim().toLowerCase();
    return q ? categories.filter((c) => c.label.toLowerCase().includes(q)) : categories;
  }, [categories, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search Courses"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/70 transition hover:cursor-pointer hover:text-brand hover:ring-brand-soft"
      >
        <SearchIcon className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-center" role="dialog" aria-modal="true" aria-label="Search Courses">
          <button
            type="button"
            aria-label="Close Search"
            onClick={close}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          />

          <div className="relative mt-6 flex max-h-[80vh] w-full max-w-[450px] flex-col self-start px-4">
            <div className="flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl">
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3">
                <SearchIcon className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Courses"
                  className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={close}
                  className="shrink-0 text-sm font-medium text-slate-500 hover:cursor-pointer hover:text-slate-900"
                >
                  Cancel
                </button>
              </div>

              <div className="overflow-y-auto">
                {error ? (
                  <p className="px-5 py-6 text-sm text-rose-600">{error}</p>
                ) : categories === null ? (
                  <div className="flex items-center justify-center gap-2 px-5 py-8 text-sm text-slate-500">
                    <MobileSpinner className="h-4 w-4" />
                    Loading…
                  </div>
                ) : results.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-slate-500">
                    {query.trim() ? <>No courses match &ldquo;{query.trim()}&rdquo;.</> : "No courses available yet."}
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {results.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/category/${c.slug}`}
                          onClick={close}
                          className="flex items-center gap-3 px-5 py-3 transition hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-none"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
                            <Icon name="book" className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{c.label}</span>
                          <svg className="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="m9 6 6 6-6 6" />
                          </svg>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
