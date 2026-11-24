"use client";

import { useState } from "react";
import { ACTIVITY_TYPES, DIFFICULTIES, SIMULATIONS, type AdminLab, type AdminSubject } from "@/lib/explore/admin";
import {
  Banner,
  ConfirmDelete,
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

const blankLab = (subjectSlug: string, sortOrder: number): AdminLab => ({
  id: "",
  subjectSlug,
  title: "",
  type: "simulation",
  difficulty: "beginner",
  durationMins: 30,
  summary: "",
  objectives: [],
  steps: [],
  criteria: [
    { criterion: "Understanding", weight: 30, description: "Accurately explains the concepts involved." },
    { criterion: "Method", weight: 30, description: "Follows a clear, repeatable process and records observations." },
    { criterion: "Analysis", weight: 25, description: "Interprets results and identifies limitations." },
    { criterion: "Communication", weight: 15, description: "Presents findings clearly in their own words." },
  ],
  deliverable: "",
  isPublished: false,
  sortOrder,
});

export default function LabsPanel({ canEdit }: { canEdit: boolean }) {
  const { items, loading, feedback, save, remove, togglePublished } = useCollection<AdminLab>("labs", (l) => l.id);
  const subjects = useCollection<AdminSubject>("subjects", (s) => s.slug).items;
  const [editing, setEditing] = useState<{ lab: AdminLab; isNew: boolean } | null>(null);
  const [deleting, setDeleting] = useState<AdminLab | null>(null);
  const subjectTitle = (slug: string) => subjects.find((s) => s.slug === slug)?.title ?? slug;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Hands-on activities on the Labs page and inside each subject.</p>
        {canEdit && (
          <button
            type="button"
            className={btnPrimary}
            disabled={subjects.length === 0}
            onClick={() => setEditing({ lab: blankLab(subjects[0]?.slug ?? "", items.length), isNew: true })}
          >
            + Add lab
          </button>
        )}
      </div>

      <Banner feedback={feedback} />

      <div className="overflow-x-auto rounded-4xl bg-white shadow ring-1 ring-slate-200">
        {loading ? (
          <div className="px-6 py-8 text-center text-sm text-slate-500">Loading labs…</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-500">No labs yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {["Lab", "Subject", "Type", "Steps", "Status", ""].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 sm:px-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {items.map((l) => (
                <tr key={l.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3 sm:px-6">
                    <div className="text-sm font-semibold text-slate-950">{l.title}</div>
                    <div className="text-xs text-slate-500">{l.id}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 sm:px-6">{subjectTitle(l.subjectSlug)}</td>
                  <td className="px-4 py-3 text-sm capitalize text-slate-600 sm:px-6">
                    {l.type}
                    <div className="text-xs text-slate-400">{l.durationMins} min · {l.difficulty}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 sm:px-6">{l.steps.length}</td>
                  <td className="px-4 py-3 sm:px-6"><StatusBadge published={l.isPublished} /></td>
                  <td className="px-4 py-3 text-right text-xs font-medium text-slate-600 sm:px-6">
                    <div className="flex justify-end gap-3 whitespace-nowrap">
                      {canEdit ? (
                        <>
                          <button type="button" onClick={() => togglePublished(l)} className="hover:text-slate-950">{l.isPublished ? "Hide" : "Publish"}</button>
                          <button type="button" onClick={() => setEditing({ lab: l, isNew: false })} className="hover:text-slate-950">Edit</button>
                          <button type="button" onClick={() => setDeleting(l)} className="text-red-500 hover:text-red-700">Delete</button>
                        </>
                      ) : (
                        <button type="button" onClick={() => setEditing({ lab: l, isNew: false })} className="hover:text-slate-950">View</button>
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
        <LabEditor
          initial={editing.lab}
          isNew={editing.isNew}
          readOnly={!canEdit}
          subjects={subjects}
          onClose={() => setEditing(null)}
          onSave={async (l) => {
            await save(l, editing.isNew ? undefined : editing.lab.id);
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <ConfirmDelete
          name={deleting.title}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await remove(deleting.id);
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}

function LabEditor({
  initial,
  isNew,
  readOnly,
  subjects,
  onClose,
  onSave,
}: {
  initial: AdminLab;
  isNew: boolean;
  readOnly: boolean;
  subjects: AdminSubject[];
  onClose: () => void;
  onSave: (l: AdminLab) => Promise<void>;
}) {
  const [l, setL] = useState<AdminLab>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof AdminLab>(k: K, v: AdminLab[K]) => setL((cur) => ({ ...cur, [k]: v }));
  const totalWeight = l.criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (l.steps.length === 0) return setError("Add at least one step.");
    setError(null);
    setSaving(true);
    try {
      await onSave(l);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal eyebrow={isNew ? "New lab" : readOnly ? "Lab" : "Edit lab"} title={l.title || "Untitled lab"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={readOnly} className="space-y-4">
          <FormSection title="Basics">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title">
                <input className={inputCls} value={l.title} required onChange={(e) => set("title", e.target.value)} />
              </Field>
              <Field label="ID" hint={isNew ? "e.g. lab-wind-turbine. Can't be changed later." : "Can't be changed after creation."}>
                <input className={inputCls} value={l.id} disabled={!isNew} required onChange={(e) => set("id", e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <Field label="Subject" className="sm:col-span-2">
                <select className={inputCls} value={l.subjectSlug} onChange={(e) => set("subjectSlug", e.target.value)}>
                  {subjects.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
                </select>
              </Field>
              <Field label="Type">
                <select className={inputCls} value={l.type} onChange={(e) => set("type", e.target.value as AdminLab["type"])}>
                  {ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Difficulty">
                <select className={inputCls} value={l.difficulty} onChange={(e) => set("difficulty", e.target.value as AdminLab["difficulty"])}>
                  {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Duration (minutes)">
                <input type="number" min={0} className={inputCls} value={l.durationMins} onChange={(e) => set("durationMins", Number(e.target.value))} />
              </Field>
              <Field label="Interactive simulation" hint="Built-in simulations only.">
                <select className={inputCls} value={l.simulation ?? ""} onChange={(e) => set("simulation", (e.target.value || undefined) as AdminLab["simulation"])}>
                  <option value="">None</option>
                  {SIMULATIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Sort order">
                <input type="number" className={inputCls} value={l.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
              </Field>
            </div>
            <Field label="Summary">
              <textarea className={inputCls} rows={2} value={l.summary} required onChange={(e) => set("summary", e.target.value)} />
            </Field>
            <Field label="Learning objectives" hint="One per line.">
              <LinesInput value={l.objectives} onChange={(v) => set("objectives", v)} rows={3} />
            </Field>
          </FormSection>

          <FormSection title="Steps">
            {!isNew && (
              <p className="text-xs text-amber-700">
                Students&apos; progress is tied to each step. Editing text is safe; removing a step removes it from their progress.
              </p>
            )}
            <RowsEditor
              value={l.steps}
              onChange={(v) => set("steps", v)}
              blank={{ id: "", title: "", detail: "" }}
              addLabel="Add step"
              fields={[
                { key: "title", label: "Step title", width: "sm:col-span-4" },
                { key: "detail", label: "What to do", width: "sm:col-span-8" },
              ]}
            />
          </FormSection>

          <FormSection title="Assessment">
            <RowsEditor
              value={l.criteria}
              onChange={(v) => set("criteria", v)}
              blank={{ criterion: "", weight: 0, description: "" }}
              addLabel="Add criterion"
              fields={[
                { key: "criterion", label: "Criterion", width: "sm:col-span-3" },
                { key: "weight", label: "Weight %", type: "number", width: "sm:col-span-2" },
                { key: "description", label: "Description", width: "sm:col-span-7" },
              ]}
            />
            <p className={`text-xs ${totalWeight === 100 ? "text-slate-500" : "text-amber-700"}`}>
              Weights total {totalWeight}%{totalWeight === 100 ? "" : " — usually these add up to 100%."}
            </p>
            <Field label="Deliverable" hint="What students submit.">
              <textarea className={inputCls} rows={2} value={l.deliverable} onChange={(e) => set("deliverable", e.target.value)} />
            </Field>
          </FormSection>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" className="h-4 w-4 accent-sky-600" checked={l.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />
            Published — visible to students
          </label>
        </fieldset>

        {error && <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnSecondary}>{readOnly ? "Close" : "Cancel"}</button>
          {!readOnly && <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Saving…" : "Save lab"}</button>}
        </div>
      </form>
    </Modal>
  );
}
