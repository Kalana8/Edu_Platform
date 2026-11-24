"use client";

import { useState } from "react";
import SubjectVisual from "@/components/explore/SubjectVisual";
import { ACADEMY_LEVELS, DIFFICULTIES, DISCIPLINES, MOTIFS, type AdminSubject } from "@/lib/explore/admin";
import type { Curriculum, LearningStage, Prerequisite } from "@/lib/explore/types";
import {
  Banner,
  ConfirmDelete,
  ConfirmVisibility,
  Field,
  FormSection,
  LinesInput,
  Modal,
  RowsEditor,
  StatusBadge,
  btnPrimary,
  btnSecondary,
  inputCls,
  useCollection,
} from "./ui";

const blankSubject = (): AdminSubject => ({
  slug: "",
  title: "",
  tagline: "",
  description: "",
  discipline: "Engineering",
  difficulty: "beginner",
  motif: "robot",
  theme: { base: "#1e3a8a", accent: "#60a5fa", tint: "#dbeafe", ink: "#1e40af" },
  status: "available",
  tags: [],
  addedAt: new Date().toISOString().slice(0, 10),
  estimatedHours: 0,
  learnersExploring: 0,
  introduction: "",
  applications: [],
  whyItMatters: [],
  outcomes: [],
  foundationalKnowledge: [],
  prerequisites: [],
  stages: [],
  durationLabel: "",
  curriculum: null,
  isPublished: false,
  sortOrder: 0,
});

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export default function SubjectsPanel({ canEdit }: { canEdit: boolean }) {
  const { items, loading, feedback, save, remove, togglePublished } = useCollection<AdminSubject>("subjects", (s) => s.slug);
  const [editing, setEditing] = useState<{ subject: AdminSubject; isNew: boolean } | null>(null);
  const [deleting, setDeleting] = useState<AdminSubject | null>(null);
  const [toggling, setToggling] = useState<AdminSubject | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Subjects appear on Discover. Disciplines, Featured, Trending and other sections are driven by the fields below.
        </p>
        {canEdit && (
          <button type="button" className={btnPrimary} onClick={() => setEditing({ subject: { ...blankSubject(), sortOrder: items.length }, isNew: true })}>
            + Add subject
          </button>
        )}
      </div>

      <Banner feedback={feedback} />

      <div className="overflow-x-auto rounded-4xl bg-white shadow ring-1 ring-slate-200">
        {loading ? (
          <div className="px-6 py-8 text-center text-sm text-slate-500">Loading subjects…</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-500">No subjects yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {["Subject", "Discipline", "Highlights", "Status", ""].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 sm:px-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {items.map((s) => (
                <tr key={s.slug} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                      <SubjectVisual motif={s.motif} theme={s.theme} className="h-10 w-14 shrink-0 rounded-xl" />
                      <div>
                        <div className="text-sm font-semibold text-slate-950">{s.title}</div>
                        <div className="text-xs text-slate-500">{s.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 sm:px-6">
                    {s.discipline}
                    <div className="text-xs capitalize text-slate-400">{s.difficulty}</div>
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <div className="flex max-w-56 flex-wrap gap-1">
                      {s.status === "coming-soon" && <Chip>Coming soon</Chip>}
                      {s.featured && <Chip>Featured</Chip>}
                      {s.trending && <Chip>Trending</Chip>}
                      {s.emerging && <Chip>Emerging</Chip>}
                      {s.beginnerFriendly && <Chip>Beginner</Chip>}
                      {s.universityLevel && <Chip>University</Chip>}
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-6"><StatusBadge published={s.isPublished} /></td>
                  <td className="px-4 py-3 text-right text-xs font-medium text-slate-600 sm:px-6">
                    <div className="flex justify-end gap-3 whitespace-nowrap">
                      {canEdit ? (
                        <>
                          <button type="button" onClick={() => setToggling(s)} className="cursor-pointer hover:text-slate-950">{s.isPublished ? "Hide" : "Publish"}</button>
                          <button type="button" onClick={() => setEditing({ subject: s, isNew: false })} className="cursor-pointer hover:text-slate-950">Edit</button>
                          <button type="button" onClick={() => setDeleting(s)} className="cursor-pointer text-red-500 hover:text-red-700">Delete</button>
                        </>
                      ) : (
                        <button type="button" onClick={() => setEditing({ subject: s, isNew: false })} className="cursor-pointer hover:text-slate-950">View</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <SubjectEditor
          initial={editing.subject}
          isNew={editing.isNew}
          readOnly={!canEdit}
          onClose={() => setEditing(null)}
          onSave={async (s) => {
            await save(s, editing.isNew ? undefined : editing.subject.slug);
            setEditing(null);
          }}
        />
      )}

      {toggling && (
        <ConfirmVisibility
          name={toggling.title}
          published={toggling.isPublished}
          onCancel={() => setToggling(null)}
          onConfirm={async () => {
            await togglePublished(toggling);
            setToggling(null);
          }}
        />
      )}

      {deleting && (
        <ConfirmDelete
          name={deleting.title}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await remove(deleting.slug);
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">{children}</span>;
}

function SubjectEditor({
  initial,
  isNew,
  readOnly,
  onClose,
  onSave,
}: {
  initial: AdminSubject;
  isNew: boolean;
  readOnly: boolean;
  onClose: () => void;
  onSave: (s: AdminSubject) => Promise<void>;
}) {
  const [s, setS] = useState<AdminSubject>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [curriculumText, setCurriculumText] = useState(initial.curriculum ? JSON.stringify(initial.curriculum, null, 2) : "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof AdminSubject>(k: K, v: AdminSubject[K]) => setS((cur) => ({ ...cur, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    let curriculum: Curriculum | null = null;
    if (curriculumText.trim()) {
      try {
        curriculum = JSON.parse(curriculumText);
      } catch {
        return setError("Curriculum is not valid JSON. Fix it or clear the box.");
      }
    }
    setError(null);
    setSaving(true);
    try {
      await onSave({ ...s, curriculum });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal eyebrow={isNew ? "New subject" : readOnly ? "Subject" : "Edit subject"} title={s.title || "Untitled subject"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={readOnly} className="space-y-4">
          <FormSection title="Basics">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title">
                <input
                  className={inputCls}
                  value={s.title}
                  required
                  onChange={(e) => {
                    const title = e.target.value;
                    setS((cur) => ({ ...cur, title, slug: isNew && !slugTouched ? slugify(title) : cur.slug }));
                  }}
                />
              </Field>
              <Field label="Slug (URL)" hint={isNew ? "Used in the page address. Can't be changed later." : "Can't be changed after creation."}>
                <input
                  className={inputCls}
                  value={s.slug}
                  disabled={!isNew}
                  required
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value);
                  }}
                />
              </Field>
            </div>
            <Field label="Tagline" hint="One short line shown under the title.">
              <input className={inputCls} value={s.tagline} onChange={(e) => set("tagline", e.target.value)} />
            </Field>
            <Field label="Description">
              <textarea className={inputCls} rows={3} value={s.description} required onChange={(e) => set("description", e.target.value)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Discipline" hint="Creates the filter chips on Discover.">
                <select className={inputCls} value={s.discipline} onChange={(e) => set("discipline", e.target.value as AdminSubject["discipline"])}>
                  {DISCIPLINES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Difficulty">
                <select className={inputCls} value={s.difficulty} onChange={(e) => set("difficulty", e.target.value as AdminSubject["difficulty"])}>
                  {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Availability">
                <select className={inputCls} value={s.status} onChange={(e) => set("status", e.target.value as AdminSubject["status"])}>
                  <option value="available">Available</option>
                  <option value="coming-soon">Coming soon</option>
                </select>
              </Field>
            </div>
            <Field label="Tags" hint="Comma-separated. Used by search.">
              <input
                className={inputCls}
                defaultValue={s.tags.join(", ")}
                onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
              />
            </Field>
          </FormSection>

          <FormSection title="Look">
            <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
              <div className="space-y-3">
                <Field label="Illustration">
                  <select className={inputCls} value={s.motif} onChange={(e) => set("motif", e.target.value as AdminSubject["motif"])}>
                    {MOTIFS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(
                    [
                      ["base", "Main"],
                      ["accent", "Accent"],
                      ["tint", "Tint"],
                      ["ink", "Text"],
                    ] as const
                  ).map(([k, label]) => (
                    <Field key={k} label={label}>
                      <input
                        type="color"
                        className="h-10 w-full cursor-pointer rounded-xl border border-slate-200"
                        value={s.theme[k]}
                        onChange={(e) => set("theme", { ...s.theme, [k]: e.target.value })}
                      />
                    </Field>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700">Preview</p>
                <SubjectVisual motif={s.motif} theme={s.theme} className="h-32 w-full rounded-2xl" />
                <span className="mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: s.theme.tint, color: s.theme.ink }}>
                  {s.discipline}
                </span>
              </div>
            </div>
          </FormSection>

          <FormSection title="Where it appears on Discover">
            <div className="grid gap-2 sm:grid-cols-3">
              {(
                [
                  ["featured", "Featured discoveries"],
                  ["trending", "Trending"],
                  ["emerging", "Emerging technologies"],
                  ["beginnerFriendly", "Beginner friendly"],
                  ["universityLevel", "University level"],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  <input type="checkbox" className="h-4 w-4 accent-sky-600" checked={!!s[k]} onChange={(e) => set(k, e.target.checked)} />
                  {label}
                </label>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <Field label="Date added" hint="Drives “Recently added”.">
                <input type="date" className={inputCls} value={s.addedAt} onChange={(e) => set("addedAt", e.target.value)} />
              </Field>
              <Field label="Estimated hours">
                <input type="number" min={0} className={inputCls} value={s.estimatedHours} onChange={(e) => set("estimatedHours", Number(e.target.value))} />
              </Field>
              <Field label="Learners exploring" hint="Ranks Trending.">
                <input type="number" min={0} className={inputCls} value={s.learnersExploring} onChange={(e) => set("learnersExploring", Number(e.target.value))} />
              </Field>
              <Field label="Sort order" hint="Lower shows first.">
                <input type="number" className={inputCls} value={s.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Subject page">
            <Field label="Introduction">
              <textarea className={inputCls} rows={4} value={s.introduction} onChange={(e) => set("introduction", e.target.value)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Why it matters" hint="One point per line.">
                <LinesInput value={s.whyItMatters} onChange={(v) => set("whyItMatters", v)} />
              </Field>
              <Field label="Learning outcomes" hint="One per line.">
                <LinesInput value={s.outcomes} onChange={(v) => set("outcomes", v)} />
              </Field>
              <Field label="Foundational knowledge" hint="One per line.">
                <LinesInput value={s.foundationalKnowledge} onChange={(v) => set("foundationalKnowledge", v)} />
              </Field>
              <div className="space-y-3">
                <Field label="Duration label" hint="e.g. “12–16 weeks”">
                  <input className={inputCls} value={s.durationLabel} onChange={(e) => set("durationLabel", e.target.value)} />
                </Field>
                <Field label="Related EduMate category slug" hint="Links to an existing Learn category.">
                  <input className={inputCls} value={s.relatedCategorySlug ?? ""} onChange={(e) => set("relatedCategorySlug", e.target.value || undefined)} />
                </Field>
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">Real-world applications</p>
              <RowsEditor
                value={s.applications}
                onChange={(v) => set("applications", v)}
                blank={{ title: "", description: "" }}
                addLabel="Add application"
                fields={[
                  { key: "title", label: "Title", width: "sm:col-span-4" },
                  { key: "description", label: "Description", width: "sm:col-span-8" },
                ]}
              />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">Prerequisites</p>
              <RowsEditor<Prerequisite & Record<string, unknown>>
                value={s.prerequisites as (Prerequisite & Record<string, unknown>)[]}
                onChange={(v) => set("prerequisites", v.map((p) => ({ ...p, categorySlug: p.categorySlug || undefined })))}
                blank={{ title: "", why: "", categorySlug: "" }}
                addLabel="Add prerequisite"
                fields={[
                  { key: "title", label: "Title", width: "sm:col-span-4" },
                  { key: "why", label: "Why it's needed", width: "sm:col-span-5" },
                  { key: "categorySlug", label: "Category slug (optional)", width: "sm:col-span-3" },
                ]}
              />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">Learning stages</p>
              <RowsEditor<LearningStage & Record<string, unknown>>
                value={s.stages as (LearningStage & Record<string, unknown>)[]}
                onChange={(v) => set("stages", v)}
                blank={{ id: "", title: "", academy: "Foundation", summary: "", weeks: 4 }}
                addLabel="Add stage"
                fields={[
                  { key: "title", label: "Title", width: "sm:col-span-4" },
                  { key: "academy", label: "Academy level", type: "select", options: ACADEMY_LEVELS, width: "sm:col-span-3" },
                  { key: "weeks", label: "Weeks", type: "number", width: "sm:col-span-2" },
                  { key: "summary", label: "Summary", width: "sm:col-span-12" },
                ]}
              />
            </div>
          </FormSection>

          <FormSection title="Curriculum (advanced)">
            <Field
              label="Curriculum JSON"
              hint="Optional. Modules, topics, assessments and further study. Leave empty for no curriculum page. Tip: copy an existing subject's curriculum as a starting point."
            >
              <textarea
                className={`${inputCls} font-mono text-xs`}
                rows={10}
                spellCheck={false}
                value={curriculumText}
                onChange={(e) => setCurriculumText(e.target.value)}
              />
            </Field>
          </FormSection>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" className="h-4 w-4 accent-sky-600" checked={s.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />
            Published — visible to students
          </label>
        </fieldset>

        {error && <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnSecondary}>{readOnly ? "Close" : "Cancel"}</button>
          {!readOnly && (
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Saving…" : "Save subject"}</button>
          )}
        </div>
      </form>
    </Modal>
  );
}
