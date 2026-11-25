"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormError, PrimaryButton, SecondaryLink, TextField } from "@/components/ui/form";

type School = { code: string; name: string; location: string | null; tier: string };
type Mode = "name" | "id";

const MIN_QUERY = 2;

export default function JoinSchool() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("name");

  // Search by name
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<School[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Enter school ID
  const [schoolId, setSchoolId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function goToConfirm(school: Pick<School, "code" | "name" | "tier">) {
    router.push(
      `/confirm-school?code=${encodeURIComponent(school.code)}&name=${encodeURIComponent(school.name)}&tier=${encodeURIComponent(school.tier)}`,
    );
  }

  // Debounced name search; a newer keystroke cancels the previous request.
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

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setSearchError(null);
  }

  async function verify() {
    setError(null);
    const trimmed = schoolId.trim();
    if (!trimmed) {
      setError("Enter school id");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/verify-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId: trimmed }),
      });

      let json: { exists?: boolean; error?: string; school?: School } | null = null;
      try {
        json = await res.json();
      } catch {
        setError("Something went wrong");
        return;
      }

      if (!res.ok) {
        setError(json?.error || "Something went wrong");
        return;
      }

      if (!json?.exists || !json.school) {
        setError("Enter a valid id");
        return;
      }

      goToConfirm(json.school);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const trimmedQuery = query.trim();

  return (
    <div className="min-h-screen bg-brand text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6 pt-16 pb-32">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Join Your School</h1>
          <p className="text-white/75">
            {mode === "name" ? (
              <>Search for your <span className="font-medium text-white">school</span> by name</>
            ) : (
              <>Enter the ID your <span className="font-medium text-white">school</span> gave you</>
            )}
          </p>
          {mode === "id" && error && <FormError id="school-id-error">{error}</FormError>}
        </div>

        {mode === "name" ? (
          <div className="mt-12 flex flex-col gap-3">
            <TextField
              id="school-name"
              label="School name"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              type="search"
              autoComplete="off"
              placeholder="Start typing your school's name"
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
                    No schools match &ldquo;{trimmedQuery}&rdquo;. Check the spelling or use your school ID.
                  </p>
                )
              ) : (
                <ul className="overflow-hidden rounded-xl bg-white text-slate-900 shadow-[0_12px_32px_-12px_rgba(4,43,68,0.45)] divide-y divide-slate-100">
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
        ) : (
          <form
            className="mt-12 flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              void verify();
            }}
            noValidate
          >
            <TextField
              id="school-id"
              label="School ID"
              value={schoolId}
              onChange={(e) => {
                setSchoolId(e.target.value.toUpperCase());
                if (error) setError(null);
              }}
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="SCH-45821"
              error={!!error}
              aria-describedby={error ? "school-id-error" : undefined}
              className="tracking-wider"
            />
            <PrimaryButton type="submit" loading={loading} compact>
              {loading ? "Confirming…" : "Confirm School"}
            </PrimaryButton>
          </form>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => switchMode(mode === "name" ? "id" : "name")}
            className="text-sm font-medium text-white/85 underline-offset-4 hover:text-white hover:underline focus-visible:underline focus-visible:outline-none"
          >
            {mode === "name" ? "Have a school ID? Enter it instead" : "Search by school name instead"}
          </button>
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
