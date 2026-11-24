"use client";

import { useMemo, useState } from "react";
import { RESOURCE_TYPES, type AdminResource, type AdminSubject } from "@/lib/explore/admin";
import { Banner, ConfirmDelete, Field, Modal, StatusBadge, btnPrimary, btnSecondary, inputCls, useCollection } from "./ui";

const blankResource = (sortOrder: number): AdminResource => ({
  id: "",
  title: "",
  author: "",
  type: "article",
  description: "",
  url: "https://",
  access: "external",
  subjectSlugs: [],
  isPublished: false,
  sortOrder,
});

export default function ResourcesPanel({ canEdit }: { canEdit: boolean }) {
  const { items, loading, feedback, save, remove, togglePublished } = useCollection<AdminResource>("resources", (r) => r.id);
  const subjects = useCollection<AdminSubject>("subjects", (s) => s.slug).items;
  const [editing, setEditing] = useState<{ resource: AdminResource; isNew: boolean } | null>(null);
  const [deleting, setDeleting] = useState<AdminResource | null>(null);
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((r) => `${r.title} ${r.author} ${r.id}`.toLowerCase().includes(q)) : items;
  }, [items, query]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search resources"
          aria-label="Search resources"
          className={`${inputCls} max-w-xs`}
        />
        {canEdit && (
          <button type="button" className={btnPrimary} onClick={() => setEditing({ resource: blankResource(items.length), isNew: true })}>
            + Add resource
          </button>
        )}
      </div>

      <Banner feedback={feedback} />

      <div className="overflow-x-auto rounded-4xl bg-white shadow ring-1 ring-slate-200">
        {loading ? (
          <div className="px-6 py-8 text-center text-sm text-slate-500">Loading resources…</div>
        ) : shown.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-500">{items.length ? "No resources match." : "No resources yet."}</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {["Resource", "Type", "Subjects", "Status", ""].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-600 sm:px-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {shown.map((r) => (
                <tr key={r.id} className="transition hover:bg-slate-50">
                  <td className="max-w-md px-4 py-3 sm:px-6">
                    <div className="text-sm font-semibold text-slate-950">{r.title}</div>
                    <div className="text-xs text-slate-500">{r.author}{r.year ? ` · ${r.year}` : ""}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 sm:px-6">
                    {r.type}
                    <div className="text-xs text-slate-400">{r.access === "edumate" ? "EduMate" : "External link"}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 sm:px-6">{r.subjectSlugs.length}</td>
                  <td className="px-4 py-3 sm:px-6"><StatusBadge published={r.isPublished} /></td>
                  <td className="px-4 py-3 text-right text-xs font-medium text-slate-600 sm:px-6">
                    <div className="flex justify-end gap-3 whitespace-nowrap">
                      {canEdit ? (
                        <>
                          <button type="button" onClick={() => togglePublished(r)} className="hover:text-slate-950">{r.isPublished ? "Hide" : "Publish"}</button>
                          <button type="button" onClick={() => setEditing({ resource: r, isNew: false })} className="hover:text-slate-950">Edit</button>
                          <button type="button" onClick={() => setDeleting(r)} className="text-red-500 hover:text-red-700">Delete</button>
                        </>
                      ) : (
                        <button type="button" onClick={() => setEditing({ resource: r, isNew: false })} className="hover:text-slate-950">View</button>
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
        <ResourceEditor
          initial={editing.resource}
          isNew={editing.isNew}
          readOnly={!canEdit}
          subjects={subjects}
          onClose={() => setEditing(null)}
          onSave={async (r) => {
            await save(r, editing.isNew ? undefined : editing.resource.id);
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

function ResourceEditor({
  initial,
  isNew,
  readOnly,
  subjects,
  onClose,
  onSave,
}: {
  initial: AdminResource;
  isNew: boolean;
  readOnly: boolean;
  subjects: AdminSubject[];
  onClose: () => void;
  onSave: (r: AdminResource) => Promise<void>;
}) {
  const [r, setR] = useState<AdminResource>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof AdminResource>(k: K, v: AdminResource[K]) => setR((cur) => ({ ...cur, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal eyebrow={isNew ? "New resource" : readOnly ? "Resource" : "Edit resource"} title={r.title || "Untitled resource"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={readOnly} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title">
              <input className={inputCls} value={r.title} required onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="ID" hint={isNew ? "e.g. mit-ocw-robotics. Can't be changed later." : "Can't be changed after creation."}>
              <input className={inputCls} value={r.id} disabled={!isNew} required onChange={(e) => set("id", e.target.value)} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Author / publisher" className="sm:col-span-2">
              <input className={inputCls} value={r.author} onChange={(e) => set("author", e.target.value)} />
            </Field>
            <Field label="Type">
              <select className={inputCls} value={r.type} onChange={(e) => set("type", e.target.value as AdminResource["type"])}>
                {RESOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Year">
              <input className={inputCls} value={r.year ?? ""} onChange={(e) => set("year", e.target.value || undefined)} />
            </Field>
          </div>
          <Field label="URL" hint="Full link for external resources, or a path like /explore/... for EduMate pages.">
            <input className={inputCls} value={r.url} required onChange={(e) => set("url", e.target.value)} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Access">
              <select className={inputCls} value={r.access} onChange={(e) => set("access", e.target.value as AdminResource["access"])}>
                <option value="external">External link</option>
                <option value="edumate">EduMate content</option>
              </select>
            </Field>
            <Field label="Licence" hint="e.g. CC BY-NC-SA 4.0">
              <input className={inputCls} value={r.licence ?? ""} onChange={(e) => set("licence", e.target.value || undefined)} />
            </Field>
            <Field label="Sort order">
              <input type="number" className={inputCls} value={r.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />
            </Field>
          </div>
          <Field label="Description">
            <textarea className={inputCls} rows={3} value={r.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-700">Subjects</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {subjects.map((s) => (
                <label key={s.slug} className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-sky-600"
                    checked={r.subjectSlugs.includes(s.slug)}
                    onChange={(e) =>
                      set("subjectSlugs", e.target.checked ? [...r.subjectSlugs, s.slug] : r.subjectSlugs.filter((x) => x !== s.slug))
                    }
                  />
                  {s.title}
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" className="h-4 w-4 accent-sky-600" checked={r.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />
            Published — visible to students
          </label>
        </fieldset>

        {error && <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnSecondary}>{readOnly ? "Close" : "Cancel"}</button>
          {!readOnly && <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Saving…" : "Save resource"}</button>}
        </div>
      </form>
    </Modal>
  );
}
