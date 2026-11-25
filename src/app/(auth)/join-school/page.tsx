"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormError, SecondaryLink, TextField } from "@/components/ui/form";

type School = { code: string; name: string; location: string | null; tier: string };

const MIN_QUERY = 2;

export default function JoinSchool() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<School[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  function goToConfirm(school: School) {
    router.push(
      `/confirm-school?code=${encodeURIComponent(school.code)}&name=${encodeURIComponent(school.name)}&tier=${encodeURIComponent(school.tier)}`,
    );
  }

  // Debounced search; a newer keystroke cancels the previous request.
  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/schools/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error);
        setResults(json.schools ?? []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSearchError("Couldn't search schools. Please try again.");
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function onQueryChange(value: string) {
    setQuery(value);
    if (value.trim().length < MIN_QUERY) {
      setResults(null);
      setSearching(false);
      setSearchError(null);
    }
  }

  const trimmedQuery = query.trim();

  return (
    <div className="min-h-screen bg-brand text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6 pt-16 pb-32">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Join Your School</h1>
          <p className="text-white/75">
            Search for your <span className="font-medium text-white">school</span> by name or ID
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-3">
          <TextField
            id="school-search"
            label="School"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            type="search"
            autoComplete="off"
            placeholder="School name or ID"
            aria-controls="school-results"
            trailing={searching ? <SmallSpinner /> : <SearchIcon />}
          />

          <div id="school-results" aria-live="polite">
            {searchError ? (
              <FormError>{searchError}</FormError>
            ) : results === null ? (
              trimmedQuery.length > 0 && (
                <p className="px-1 text-sm text-white/70">Type at least {MIN_QUERY} letters.</p>
              )
            ) : results.length === 0 ? (
              !searching && (
                <p className="rounded-xl bg-white/10 px-4 py-3 text-sm text-white/85">
                  No schools match &ldquo;{trimmedQuery}&rdquo;. Check the spelling and try again.
                </p>
              )
            ) : (
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-white text-slate-900 shadow-[0_12px_32px_-12px_rgba(4,43,68,0.45)]">
                {results.map((s) => (
                  <li key={s.code}>
                    <button
                      type="button"
                      onClick={() => goToConfirm(s)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-none"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{s.name}</span>
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <PinIcon />
                          <span className="truncate">{s.location || "Location not set"}</span>
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-brand-tint px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                        {s.tier}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col">
          <SecondaryLink href="/">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </SecondaryLink>
        </div>
      </main>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function SmallSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-brand" viewBox="0 0 24 24" fill="none" aria-label="Searching">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth={3} />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
