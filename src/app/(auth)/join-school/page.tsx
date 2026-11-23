"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormError, PrimaryButton, SecondaryLink, TextField } from "@/components/ui/form";

export default function JoinSchool() {
  const router = useRouter();
  const [schoolId, setSchoolId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function verify() {
    
    setError(null);
    const trimmed = schoolId.trim();
    if (!trimmed) {
      setError("Enter school id");
      return;
    }

    try {
      console.log("Verifying school id:", trimmed);
      setLoading(true);
      const res = await fetch("/api/verify-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId: trimmed }),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch (parseErr) {
        console.error("Failed to parse JSON from /api/verify-school", parseErr, await res.text());
        setError("Something went wrong");
        return;
      }

      console.log("verify response", res.status, json);
      console.log( json);

      if (!res.ok) {
        setError(json?.error || "Something went wrong");
        return;
      }

      if (!json.exists) {
        setError("Enter a valid id");
        return;
      }

      // success -> go to confirm page with school data
      const school = json.school;
      router.push(`/confirm-school?code=${encodeURIComponent(school.code)}&name=${encodeURIComponent(school.name)}&tier=${encodeURIComponent(school.tier)}`);
    } catch (err: any) {
      console.error(err);
      setError(String(err) || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6 pt-16 pb-32">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Join Your School</h1>
          <p className="text-white/75">
            Enter the ID your <span className="font-medium text-white">school</span> gave you
          </p>
          {error && <FormError id="school-id-error">{error}</FormError>}
        </div>

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

          <div className="flex flex-col gap-3">
            <PrimaryButton type="submit" loading={loading}>
              {loading ? "Verifying…" : "Verify School"}
            </PrimaryButton>
            <SecondaryLink href="/">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back
            </SecondaryLink>
          </div>
        </form>
      </main>
    </div>
  );
}
