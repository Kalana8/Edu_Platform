"use client";

import { useState } from "react";
import type { LabProject } from "@/lib/explore/types";
import { useProjectState } from "@/lib/explore/store";
import SimulationSlot from "./simulations";
import { Card, ProgressBar, btn, formatDate, inputCls } from "./ui";

export default function ProjectWorkspace({ project }: { project: LabProject }) {
  const { state, start, toggleStep, submit, withdraw, reset } = useProjectState(project.id);
  const [summary, setSummary] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  const done = state.completedSteps.length;
  const total = project.steps.length;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (summary.trim().length < 20) return setError("Please describe your work in at least 20 characters.");
    if (link && !/^https?:\/\//i.test(link.trim())) return setError("Links must start with http:// or https://");
    setError(null);
    const result = await submit({ summary: summary.trim(), link: link.trim() });
    if (!result.ok) setError(result.error ?? "Unable to submit your work. Please try again.");
  };

  const onWithdraw = () => {
    // Bring the submitted text back into the form so the learner can edit it.
    if (state.submission) {
      setSummary(state.submission.summary);
      setLink(state.submission.link);
    }
    withdraw();
  };

  const review = state.submission?.reviewStatus ?? "pending";
  const verified = review === "verified";

  return (
    <div className="mt-3 space-y-3">
      {/* Objectives */}
      <Card>
        <h2 className="font-bold text-slate-900">🎯 Learning objectives</h2>
        <ul className="mt-3 space-y-2">
          {project.objectives.map((o) => (
            <li key={o} className="flex gap-2.5 text-sm text-slate-700">
              <span aria-hidden className="text-blue-600">◆</span>
              {o}
            </li>
          ))}
        </ul>
      </Card>

      {project.simulation && <SimulationSlot kind={project.simulation} />}

      {/* Steps */}
      <Card>
        <h2 className="font-bold text-slate-900">📋 Instructions</h2>
        <div className="mt-3">
          <ProgressBar value={(done / total) * 100} label={`${done} of ${total} steps`} />
        </div>
        {!state.started && (
          <button type="button" onClick={start} className={`${btn.primary} mt-4 w-full`}>
            Start this lab
          </button>
        )}
        <ol className="mt-4 space-y-2">
          {project.steps.map((s, i) => {
            const checked = state.completedSteps.includes(s.id);
            return (
              <li key={s.id}>
                <label
                  className={`flex cursor-pointer gap-3 rounded-2xl border p-3.5 transition ${
                    checked ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleStep(s.id)}
                    disabled={!!state.submission}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-emerald-600"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {i + 1}. {s.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-600">{s.detail}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Criteria */}
      <Card>
        <h2 className="font-bold text-slate-900">📊 Assessment criteria</h2>
        <ul className="mt-3 space-y-3">
          {project.criteria.map((c) => (
            <li key={c.criterion}>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-900">{c.criterion}</span>
                <span className="font-semibold text-blue-600">{c.weight}%</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600">{c.description}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-[11px] text-slate-500">
          Reviewed through EduMate mastery verification. Verified work is added to your Mastery Passport.
        </p>
      </Card>

      {/* Submission */}
      <Card>
        <h2 className="font-bold text-slate-900">📤 Submit your work</h2>
        <p className="mt-1 text-xs text-slate-600">{project.deliverable}</p>

        {state.submission ? (
          <div
            className={`mt-4 rounded-2xl border p-4 ${
              review === "returned" ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <p className={`text-sm font-semibold ${review === "returned" ? "text-amber-800" : "text-emerald-800"}`}>
              {verified ? "🏅 Verified" : review === "returned" ? "↩️ Returned for changes" : "✅ Submitted"}{" "}
              {formatDate(state.submission.submittedAt.slice(0, 10))}
            </p>
            <p className={`text-xs ${review === "returned" ? "text-amber-700" : "text-emerald-700"}`}>
              {verified
                ? "Added to your Mastery Passport"
                : review === "returned"
                  ? "A reviewer asked for changes. Withdraw, edit and submit again."
                  : "Awaiting mastery review"}
            </p>
            {state.submission.feedback && (
              <p className="mt-3 rounded-xl bg-white/70 p-3 text-xs text-slate-700">
                <span className="font-semibold">Reviewer feedback: </span>
                {state.submission.feedback}
              </p>
            )}
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{state.submission.summary}</p>
            {state.submission.link && (
              <a href={state.submission.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block break-all text-sm font-semibold text-blue-700">
                {state.submission.link} ↗
              </a>
            )}
            {!verified && (
              <div className="mt-4 flex flex-col gap-2">
                <button type="button" onClick={onWithdraw} className={btn.secondary}>Withdraw & edit</button>
                <button type="button" onClick={reset} className={btn.ghost}>Reset lab</button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-3" noValidate>
            {done < total && (
              <p className="rounded-2xl bg-amber-50 p-3 text-xs text-amber-800">
                Tip: finish all steps first — {total - done} remaining.
              </p>
            )}
            <div>
              <label htmlFor="sub-summary" className="text-xs font-semibold text-slate-700">Your work & findings</label>
              <textarea
                id="sub-summary"
                rows={5}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="What did you do, what did you find, what would you improve?"
                className={`mt-1 ${inputCls}`}
              />
            </div>
            <div>
              <label htmlFor="sub-link" className="text-xs font-semibold text-slate-700">
                Link <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="sub-link"
                type="url"
                inputMode="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://"
                className={`mt-1 ${inputCls}`}
              />
              <p className="mt-1 text-[11px] text-slate-400">Share files via a link (e.g. Google Drive, GitHub).</p>
            </div>
            {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
            <button type="submit" className={`${btn.primary} w-full`}>Submit for mastery review</button>
          </form>
        )}
      </Card>
    </div>
  );
}
