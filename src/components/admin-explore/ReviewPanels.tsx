"use client";

import { useCallback, useEffect, useState } from "react";
import type { CommunityPost } from "@/lib/explore/types";
import { Banner, adminCall, btnPrimary, btnSecondary, inputCls } from "./ui";

type ReportedPost = CommunityPost & { openReports: number; reports: { reason: string | null; createdAt: string }[] };
type PendingSubmission = {
  userId: string;
  studentName: string;
  projectId: string;
  projectTitle: string;
  stepsCompleted: number;
  stepsTotal: number;
  summary: string;
  link: string | null;
  submittedAt: string;
};
type Queue = { pendingPosts: CommunityPost[]; reportedPosts: ReportedPost[]; pendingSubmissions: PendingSubmission[] };
type Feedback = { type: "success" | "error"; message: string } | null;

/** Shared loader for both review tabs; also reports counts for the tab badges. */
export function useModerationQueue() {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const reload = useCallback(
    () =>
      adminCall("/api/explore/moderation", "GET")
        .then((q: Queue) => setQueue(q))
        .catch((err) => setFeedback({ type: "error", message: err instanceof Error ? err.message : "Unable to load the queue." })),
    [],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  const act = async (fn: () => Promise<unknown>, success: string) => {
    try {
      await fn();
      setFeedback({ type: "success", message: success });
      await reload();
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Something went wrong." });
    }
  };

  return { queue, feedback, act };
}

type QueueState = ReturnType<typeof useModerationQueue>;

const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function PostCard({ post, children }: { post: CommunityPost; children: React.ReactNode }) {
  return (
    <article className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold capitalize text-slate-700">{post.kind}</span>
        <span>{post.authorDisplay}</span>
        <span>·</span>
        <span>{fmt(post.createdAt)}</span>
        <span>·</span>
        <span>{post.subjectSlug}</span>
      </div>
      <h3 className="mt-2 font-semibold text-slate-950">{post.title}</h3>
      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{post.excerpt}</p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </article>
  );
}

const setPost = (id: string, decision: "approve" | "reject" | "dismiss-reports") =>
  adminCall(`/api/explore/moderation/posts/${encodeURIComponent(id)}`, "PATCH", { decision });

export function CommunityReviewPanel({ state }: { state: QueueState }) {
  const { queue, feedback, act } = state;
  if (!queue) return <p className="py-8 text-center text-sm text-slate-500">{feedback?.message ?? "Loading…"}</p>;

  return (
    <div className="space-y-5">
      <Banner feedback={feedback} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">Waiting for approval ({queue.pendingPosts.length})</h2>
        <p className="text-sm text-slate-500">Students only see a post after it&apos;s approved. Check it has no names, schools, contact details or unsafe content.</p>
        {queue.pendingPosts.length === 0 ? (
          <p className="rounded-3xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">Nothing waiting. 🎉</p>
        ) : (
          queue.pendingPosts.map((p) => (
            <PostCard key={p.id} post={p}>
              <button type="button" className={btnPrimary} onClick={() => act(() => setPost(p.id, "approve"), "Post approved and published.")}>Approve</button>
              <button type="button" className={btnSecondary} onClick={() => act(() => setPost(p.id, "reject"), "Post rejected.")}>Reject</button>
            </PostCard>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">Reported by students ({queue.reportedPosts.length})</h2>
        {queue.reportedPosts.length === 0 ? (
          <p className="rounded-3xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">No open reports.</p>
        ) : (
          queue.reportedPosts.map((p) => (
            <PostCard key={p.id} post={p}>
              <div className="w-full rounded-2xl bg-rose-50 p-3 text-xs text-rose-800">
                <p className="font-semibold">{p.openReports} report{p.openReports === 1 ? "" : "s"}</p>
                {p.reports.filter((r) => r.reason).map((r, i) => <p key={i} className="mt-1">“{r.reason}”</p>)}
              </div>
              <button type="button" className={btnSecondary} onClick={() => act(() => setPost(p.id, "dismiss-reports"), "Reports dismissed. Post stays up.")}>Keep post</button>
              <button
                type="button"
                className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                onClick={() => act(() => setPost(p.id, "reject"), "Post removed from the community.")}
              >
                Remove post
              </button>
            </PostCard>
          ))
        )}
      </section>
    </div>
  );
}

export function LabReviewPanel({ state }: { state: QueueState }) {
  const { queue, feedback, act } = state;
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});
  if (!queue) return <p className="py-8 text-center text-sm text-slate-500">{feedback?.message ?? "Loading…"}</p>;

  const review = (s: PendingSubmission, decision: "verify" | "return") =>
    adminCall("/api/explore/moderation/submissions", "PATCH", {
      userId: s.userId,
      projectId: s.projectId,
      decision,
      feedback: feedbackText[`${s.userId}:${s.projectId}`] ?? "",
    });

  return (
    <div className="space-y-3">
      <Banner feedback={feedback} />
      <p className="text-sm text-slate-500">
        Verify work that meets the lab&apos;s criteria. Return it with feedback if the student needs to improve it.
      </p>
      {queue.pendingSubmissions.length === 0 ? (
        <p className="rounded-3xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">No submissions waiting for review.</p>
      ) : (
        queue.pendingSubmissions.map((s) => {
          const k = `${s.userId}:${s.projectId}`;
          return (
            <article key={k} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-slate-950">{s.projectTitle}</h3>
                <span className="text-xs text-slate-500">{s.studentName} · {fmt(s.submittedAt)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Steps completed: {s.stepsCompleted} of {s.stepsTotal}</p>
              <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">{s.summary}</p>
              {s.link && (
                <a href={s.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block break-all text-sm font-semibold text-sky-700">
                  {s.link} ↗
                </a>
              )}
              <textarea
                className={`${inputCls} mt-3`}
                rows={2}
                placeholder="Feedback for the student (required when returning)"
                aria-label={`Feedback for ${s.studentName}`}
                value={feedbackText[k] ?? ""}
                onChange={(e) => setFeedbackText((cur) => ({ ...cur, [k]: e.target.value }))}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className={btnPrimary} onClick={() => act(() => review(s, "verify"), "Submission verified.")}>Verify</button>
                <button type="button" className={btnSecondary} onClick={() => act(() => review(s, "return"), "Returned to the student with feedback.")}>Return with feedback</button>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
