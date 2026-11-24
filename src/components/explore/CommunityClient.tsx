"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CommunityPost, PostKind, SubjectSummary } from "@/lib/explore/types";
import { postKindLabels } from "@/lib/explore/data/community";
import { exploreRoutes } from "@/lib/explore/routes";
import { useCommunityState } from "@/lib/explore/store";
import type { NewPostInput } from "@/lib/explore/store-types";
import { ChipButton, EmptyState, Section, SectionHeading, SwipeRow, btn, formatDate, inputCls } from "./ui";

const kindStyle: Record<PostKind, { cls: string; icon: string; short: string }> = {
  showcase: { cls: "bg-blue-50 text-blue-700", icon: "🚀", short: "Projects" },
  discovery: { cls: "bg-emerald-50 text-emerald-700", icon: "💡", short: "Discoveries" },
  explanation: { cls: "bg-violet-50 text-violet-700", icon: "🧠", short: "Explanations" },
  discussion: { cls: "bg-amber-50 text-amber-800", icon: "💬", short: "Discussions" },
};

const safety = [
  "Every post is reviewed by a moderator before it appears.",
  "Only first names and initials — never schools, photos or exact locations.",
  "No private messaging. Conversations stay public and supervised.",
  "Content is filtered to suit each learner’s age group.",
  "See something wrong? Tap Report — it’s anonymous.",
];

export default function CommunityClient({
  posts,
  subjects,
  initialSubject,
}: {
  posts: CommunityPost[];
  subjects: SubjectSummary[];
  initialSubject?: string;
}) {
  const [kind, setKind] = useState<PostKind | "all">("all");
  const [subject, setSubject] = useState(
    initialSubject && subjects.some((s) => s.slug === initialSubject) ? initialSubject : "all",
  );
  const [query, setQuery] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const community = useCommunityState();

  const subjectBySlug = useMemo(() => Object.fromEntries(subjects.map((s) => [s.slug, s])), [subjects]);
  const availableSubjects = subjects.filter((s) => s.status === "available");

  const feed = posts.filter((p) => {
    if (kind !== "all" && p.kind !== kind) return false;
    if (subject !== "all" && p.subjectSlug !== subject) return false;
    const q = query.trim().toLowerCase();
    return !q || `${p.title} ${p.excerpt}`.toLowerCase().includes(q);
  });

  const achievements = posts.filter((p) => p.achievement);

  return (
    <>
      {/* Safety notice */}
      <div className="mt-4 rounded-[1.75rem] border border-emerald-200 bg-emerald-50">
        <button
          type="button"
          onClick={() => setSafetyOpen((v) => !v)}
          aria-expanded={safetyOpen}
          className="flex w-full items-center gap-3 p-4 text-left"
        >
          <span aria-hidden className="text-xl">🛡️</span>
          <span className="flex-1 text-sm font-semibold text-emerald-900">A safe, moderated community</span>
          <span className="text-xs font-semibold text-emerald-700">{safetyOpen ? "Hide" : "How?"}</span>
        </button>
        {safetyOpen && (
          <ul className="space-y-2 px-4 pb-4 text-xs text-emerald-900">
            {safety.map((s) => (
              <li key={s} className="flex gap-2"><span aria-hidden>✓</span>{s}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <Section>
          <SectionHeading title="Learner achievements" subtitle="From verified Mastery Passport milestones" />
          <SwipeRow label="Learner achievements">
            {achievements.map((p) => (
              <div key={p.id} className="w-56 shrink-0 snap-start rounded-2xl bg-white p-4 shadow-sm">
                <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-lg">🏆</span>
                <p className="mt-2 text-sm font-bold text-slate-900">{p.authorDisplay}</p>
                <p className="text-[11px] leading-snug text-slate-500">{p.achievement}</p>
              </div>
            ))}
          </SwipeRow>
        </Section>
      )}

      {/* Composer */}
      <Section>
        {composerOpen ? (
          <Composer
            subjects={availableSubjects}
            defaultSubject={subject !== "all" ? subject : availableSubjects[0]?.slug}
            onCancel={() => setComposerOpen(false)}
            onSubmit={async (post) => {
              const result = await community.addPost(post);
              if (result.ok) setComposerOpen(false);
              return result.error;
            }}
          />
        ) : (
          <button type="button" onClick={() => setComposerOpen(true)} className={`${btn.primary} w-full`}>
            + Share your work
          </button>
        )}
      </Section>

      {/* My contributions */}
      {community.myPosts.length > 0 && (
        <Section aria-labelledby="my-contribs">
          <SectionHeading id="my-contribs" title="Your contributions" />
          <div className="space-y-3">
            {community.myPosts.map((p) => (
              <div key={p.id} className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${kindStyle[p.kind].cls}`}>
                    {kindStyle[p.kind].icon} {postKindLabels[p.kind]}
                  </span>
                  {p.moderation === "rejected" ? (
                    <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-semibold text-rose-700">Not approved</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-800">Pending</span>
                  )}
                </div>
                <h3 className="mt-2 font-bold text-slate-900">{p.title}</h3>
                <p className="mt-1 text-xs text-slate-600">{p.excerpt}</p>
                <p className="mt-3 text-[11px] text-slate-500">
                  {p.moderation === "rejected"
                    ? "A moderator didn’t approve this post. Only you can see it."
                    : "Only you can see this until a moderator approves it."}{" "}
                  <button type="button" onClick={() => community.removePost(p.id)} className="font-semibold text-rose-600">
                    Delete
                  </button>
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Feed filters */}
      <Section aria-labelledby="feed">
        <SectionHeading id="feed" title="Community feed" />
        <label htmlFor="community-search" className="sr-only">Search the community</label>
        <input
          id="community-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts"
          className={inputCls}
        />
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          aria-label="Filter by subject"
          className={`mt-2 ${inputCls}`}
        >
          <option value="all">All subjects</option>
          {availableSubjects.map((s) => (
            <option key={s.slug} value={s.slug}>{s.title}</option>
          ))}
        </select>
        <div className="mt-3">
          <SwipeRow label="Filter by category">
            <ChipButton active={kind === "all"} onClick={() => setKind("all")}>Everything</ChipButton>
            {(Object.keys(kindStyle) as PostKind[]).map((k) => (
              <ChipButton key={k} active={kind === k} onClick={() => setKind(k)}>
                {kindStyle[k].icon} {kindStyle[k].short}
              </ChipButton>
            ))}
          </SwipeRow>
        </div>

        {/* Feed */}
        <div className="mt-3 space-y-3" aria-live="polite">
          {posts.length === 0 ? (
            <EmptyState title="No community posts yet" message="Be the first to share a project or discovery." />
          ) : feed.length === 0 ? (
            <EmptyState
              title="Nothing matches"
              message="Try another category or subject."
              action={<button type="button" className={btn.secondary} onClick={() => { setKind("all"); setSubject("all"); setQuery(""); }}>Reset filters</button>}
            />
          ) : (
            feed.map((p) => {
              const s = subjectBySlug[p.subjectSlug];
              const appreciated = community.appreciated.includes(p.id);
              if (community.reported.includes(p.id)) {
                return (
                  <div key={p.id} className="rounded-[1.75rem] bg-slate-100 p-4 text-xs text-slate-600">
                    Thanks for reporting. This post is hidden while a moderator reviews it.{" "}
                    <button type="button" onClick={() => community.undoReport(p.id)} className="font-semibold text-blue-600">
                      Undo
                    </button>
                  </div>
                );
              }
              return (
                <article key={p.id} className="rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: s?.theme.base ?? "#334155" }}
                    >
                      {p.authorDisplay.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1 text-xs">
                      <p className="font-semibold text-slate-800">{p.authorDisplay}</p>
                      <p className="text-slate-500">{p.region ? `${p.region} · ` : ""}{formatDate(p.createdAt)}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${kindStyle[p.kind].cls}`}>
                      {kindStyle[p.kind].icon} {kindStyle[p.kind].short}
                    </span>
                  </div>
                  <h3 className="mt-3 font-bold leading-snug text-slate-900">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{p.excerpt}</p>
                  {s && (
                    <Link href={exploreRoutes.subject(s.slug)} className="mt-2 inline-block text-[11px] font-semibold text-blue-600">
                      {s.title}
                    </Link>
                  )}
                  {p.achievement && (
                    <p className="mt-2 flex w-fit items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-800">
                      🏆 {p.achievement}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-3 text-xs">
                    <button
                      type="button"
                      onClick={() => community.toggleAppreciate(p.id)}
                      aria-pressed={appreciated}
                      className={`rounded-full px-3 py-1.5 font-semibold transition ${appreciated ? "bg-rose-50 text-rose-600" : "text-slate-600"}`}
                    >
                      {appreciated ? "♥" : "♡"} {community.appreciationCount(p)}
                    </button>
                    <span className="px-2 text-slate-500">💬 {p.replies}</span>
                    <button
                      type="button"
                      onClick={() => community.report(p.id)}
                      className="ml-auto rounded-full px-3 py-1.5 font-semibold text-slate-400 hover:text-rose-600"
                    >
                      Report
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </Section>
    </>
  );
}

function Composer({
  subjects,
  defaultSubject,
  onSubmit,
  onCancel,
}: {
  subjects: SubjectSummary[];
  defaultSubject?: string;
  /** Resolves with an error message when the server rejects the post. */
  onSubmit: (post: NewPostInput) => Promise<string | undefined>;
  onCancel: () => void;
}) {
  const [kind, setKind] = useState<PostKind>("showcase");
  const [subject, setSubject] = useState(defaultSubject ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [safe, setSafe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (title.trim().length < 5) return setError("Please add a title (at least 5 characters).");
    if (body.trim().length < 20) return setError("Please describe your work (at least 20 characters).");
    if (/\b[\w.+-]+@[\w-]+\.[\w.]+\b|\+?\d[\d\s-]{7,}\d/.test(`${title} ${body}`))
      return setError("For your safety, please remove email addresses and phone numbers.");
    if (!safe) return setError("Please confirm you haven’t included personal information.");
    setError(null);
    setSubmitting(true);
    const serverError = await onSubmit({ kind, subjectSlug: subject, title: title.trim(), excerpt: body.trim() });
    setSubmitting(false);
    if (serverError) setError(serverError);
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-sm" noValidate>
      <h2 className="font-bold text-slate-900">Share with the community</h2>
      <select value={kind} onChange={(e) => setKind(e.target.value as PostKind)} aria-label="Contribution type" className={inputCls}>
        {(Object.keys(postKindLabels) as PostKind[]).map((k) => <option key={k} value={k}>{postKindLabels[k]}</option>)}
      </select>
      <select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject" className={inputCls}>
        {subjects.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
      </select>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" aria-label="Title" className={inputCls} maxLength={120} />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What did you build, discover or want to explain?" aria-label="Description" rows={4} className={inputCls} maxLength={1000} />
      <label className="flex items-start gap-2 text-xs text-slate-700">
        <input type="checkbox" checked={safe} onChange={(e) => setSafe(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600" />
        I haven’t included my full name, school, address, contact details or photos of people.
      </label>
      {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
      <button type="submit" disabled={submitting} className={`${btn.primary} w-full disabled:opacity-60`}>
        {submitting ? "Submitting…" : "Submit for moderation"}
      </button>
      <button type="button" onClick={onCancel} className={`${btn.ghost} w-full`}>Cancel</button>
    </form>
  );
}
