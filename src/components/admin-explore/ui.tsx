"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { ContentKind } from "@/lib/explore/admin";

// ── Styles (match the existing admin pages) ─────────────────────────────────

export const inputCls =
  "w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:bg-slate-50 disabled:text-slate-500";
export const btnPrimary =
  "inline-flex items-center justify-center rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none";
export const btnSecondary =
  "rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50";
export const btnDanger =
  "rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-400";

// ── Layout pieces ───────────────────────────────────────────────────────────

export function Modal({
  eyebrow,
  title,
  onClose,
  children,
  wide = false,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 px-4 py-8" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${wide ? "max-w-4xl" : "max-w-md"} rounded-4xl bg-white p-5 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">{eyebrow}</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className}`}>
      <span className="mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-slate-400">{hint}</span>}
    </label>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-3xl border border-slate-200 p-4">
      <legend className="px-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</legend>
      {children}
    </fieldset>
  );
}

export function Banner({ feedback }: { feedback: { type: "success" | "error"; message: string } | null }) {
  if (!feedback) return null;
  return (
    <div
      role={feedback.type === "error" ? "alert" : "status"}
      className={`rounded-2xl border px-4 py-2.5 text-sm ${
        feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {feedback.message}
    </div>
  );
}

export function StatusBadge({ published }: { published: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
      {published ? "Published" : "Hidden"}
    </span>
  );
}

// ── List inputs ─────────────────────────────────────────────────────────────

/** Edits a string[] as one item per line. */
export function LinesInput({ value, onChange, rows = 4, placeholder }: { value: string[]; onChange: (v: string[]) => void; rows?: number; placeholder?: string }) {
  // Keep the raw text locally so blank lines survive while typing.
  const [text, setText] = useState(value.join("\n"));
  return (
    <textarea
      className={inputCls}
      rows={rows}
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean));
      }}
    />
  );
}

export interface RowField<T> {
  key: keyof T & string;
  label: string;
  type?: "text" | "number" | "textarea" | "select";
  options?: readonly string[];
  width?: string;
}

/** Edits a list of small objects as repeatable rows with add / remove / reorder. */
export function RowsEditor<T extends Record<string, unknown>>({
  value,
  onChange,
  fields,
  blank,
  addLabel,
}: {
  value: T[];
  onChange: (v: T[]) => void;
  fields: RowField<T>[];
  blank: T;
  addLabel: string;
}) {
  const update = (i: number, k: string, v: unknown) => onChange(value.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {value.map((row, i) => (
        <div key={i} className="flex gap-2 rounded-2xl bg-slate-50 p-2">
          <span className="w-6 shrink-0 pt-2.5 text-center text-xs font-semibold text-slate-400">{i + 1}</span>
          <div className="grid flex-1 gap-2 sm:grid-cols-12">
            {fields.map((f) => {
              const v = row[f.key];
              const common = { "aria-label": `${f.label} ${i + 1}`, placeholder: f.label, className: inputCls };
              return (
                <div key={f.key} className={f.width ?? "sm:col-span-12"}>
                  {f.type === "textarea" ? (
                    <textarea {...common} rows={2} value={String(v ?? "")} onChange={(e) => update(i, f.key, e.target.value)} />
                  ) : f.type === "select" ? (
                    <select {...common} value={String(v ?? "")} onChange={(e) => update(i, f.key, e.target.value)}>
                      {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      {...common}
                      type={f.type === "number" ? "number" : "text"}
                      value={f.type === "number" ? Number(v ?? 0) : String(v ?? "")}
                      onChange={(e) => update(i, f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex shrink-0 flex-col gap-1 text-xs">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${i + 1} up`} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-white disabled:opacity-30">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Move ${i + 1} down`} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-white disabled:opacity-30">↓</button>
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${i + 1}`} className="rounded-lg px-2 py-1 text-rose-500 hover:bg-white">✕</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { ...blank }])} className="text-sm font-semibold text-sky-700 hover:text-sky-800">
        + {addLabel}
      </button>
    </div>
  );
}

// ── Data hook ───────────────────────────────────────────────────────────────

type Feedback = { type: "success" | "error"; message: string } | null;

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || `Request failed (${res.status}).`);
  return payload;
}

/** Loads one content collection and exposes save / remove with feedback messages. */
export function useCollection<T>(kind: ContentKind, keyOf: (item: T) => string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const fetchItems = useCallback(
    () =>
      call(`/api/admin/explore/${kind}`, "GET")
        .then(({ items }) => setItems(items))
        .catch((err) => setFeedback({ type: "error", message: err instanceof Error ? err.message : "Unable to load." }))
        .finally(() => setLoading(false)),
    [kind],
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const reload = () => {
    setLoading(true);
    return fetchItems();
  };

  /** Creates when `existingKey` is undefined, otherwise updates. Throws with a readable message on failure. */
  const save = async (item: T, existingKey?: string) => {
    const { item: saved } = existingKey
      ? await call(`/api/admin/explore/${kind}/${encodeURIComponent(existingKey)}`, "PUT", item)
      : await call(`/api/admin/explore/${kind}`, "POST", item);
    setItems((list) => (existingKey ? list.map((x) => (keyOf(x) === existingKey ? saved : x)) : [...list, saved]));
    setFeedback({ type: "success", message: "Saved." });
    return saved as T;
  };

  const remove = async (key: string) => {
    try {
      await call(`/api/admin/explore/${kind}/${encodeURIComponent(key)}`, "DELETE");
      setItems((list) => list.filter((x) => keyOf(x) !== key));
      setFeedback({ type: "success", message: "Deleted." });
      return true;
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Unable to delete." });
      return false;
    }
  };

  /** Flip published / hidden without opening the editor. */
  const togglePublished = async (item: T & { isPublished: boolean }) => {
    try {
      await save({ ...item, isPublished: !item.isPublished }, keyOf(item));
      setFeedback({ type: "success", message: item.isPublished ? "Hidden from students." : "Published to students." });
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Unable to update." });
    }
  };

  return { items, loading, feedback, setFeedback, save, remove, togglePublished, reload };
}

export { call as adminCall };

/** Publish / hide confirmation dialog. `published` is the item's current state. */
export function ConfirmVisibility({
  name,
  published,
  onCancel,
  onConfirm,
}: {
  name: string;
  published: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<unknown>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal eyebrow={published ? "Hide from students" : "Publish to students"} title={`${published ? "Hide" : "Publish"} ${name}?`} onClose={onCancel}>
      <p className="text-sm text-slate-600">
        {published
          ? "Students will no longer see it on Discover or Explore. Their saved progress is kept, and you can publish it again at any time."
          : "Students will see it on Discover and Explore the next time they load the page."}
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={`${btnSecondary} cursor-pointer`}>Cancel</button>
        <button
          type="button"
          disabled={busy}
          className={`${published ? btnDanger : btnPrimary} cursor-pointer`}
          onClick={async () => {
            setBusy(true);
            await onConfirm();
            setBusy(false);
          }}
        >
          {busy ? "Saving…" : published ? "Hide" : "Publish"}
        </button>
      </div>
    </Modal>
  );
}

/** Delete confirmation dialog shared by all panels. */
export function ConfirmDelete({ name, onCancel, onConfirm }: { name: string; onCancel: () => void; onConfirm: () => Promise<unknown> }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal eyebrow="Confirm delete" title={`Delete ${name}?`} onClose={onCancel}>
      <p className="text-sm text-slate-600">
        This permanently removes it. If students have used it, deleting is blocked — unpublish it instead to hide it.
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={btnSecondary}>Cancel</button>
        <button
          type="button"
          disabled={busy}
          className={btnDanger}
          onClick={async () => {
            setBusy(true);
            await onConfirm();
            setBusy(false);
          }}
        >
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
