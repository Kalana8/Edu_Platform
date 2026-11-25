/*
 * Shared building blocks for admin / moderator pages so headers, tables,
 * badges and row actions look the same everywhere.
 * (The gradient banner is reserved for the dashboard.)
 */
import type { ReactNode } from "react";

/* ---------- Loader ---------- */

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin text-brand ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Centered spinner with a label. Announced to screen readers. */
export function Loader({ label = "Loading…", className = "py-10" }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-2.5 ${className}`}>
      <Spinner className="h-7 w-7" />
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}

/** Loader that fits inside a <tbody>. */
export function TableLoader({ colSpan, label }: { colSpan: number; label?: string }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <Loader label={label} />
      </td>
    </tr>
  );
}

/* ---------- Stat tiles shown above a page's table ---------- */

export function StatRow({ children }: { children: ReactNode }) {
  return <section className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">{children}</section>;
}

export function HeaderStat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-lg font-semibold leading-snug tracking-tight text-slate-900">
        {value}
        {hint ? <span className="ml-1.5 text-xs font-normal text-slate-500">{hint}</span> : null}
      </p>
    </div>
  );
}

/** Right-hand group in a TableCard toolbar (search + primary button). */
export function ToolbarActions({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">{children}</div>;
}

/** Primary call-to-action button (e.g. "Add School"). */
export function HeaderButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
    >
      <PlusIcon />
      {children}
    </button>
  );
}

/* ---------- Tabs ---------- */

export function SegmentedTabs<T extends string>({
  tabs,
  active,
  onChange,
  label,
}: {
  tabs: { id: T; label: string; count?: number }[];
  active: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex max-w-full flex-wrap gap-1 rounded-lg bg-white p-1 ring-1 ring-slate-200/80">
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              isActive ? "bg-brand text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {t.label}
            {t.count !== undefined ? (
              <span
                className={`rounded-full px-1.5 text-xs font-semibold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {t.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Plain card ---------- */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg bg-white shadow-sm ring-1 ring-slate-200/80 ${className}`}>{children}</div>;
}

/* ---------- Table card ---------- */

export function TableCard({ toolbar, children }: { toolbar?: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200/80">
      {toolbar ? (
        <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          {toolbar}
        </div>
      ) : null}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export const tableClass = {
  table: "min-w-full text-sm",
  thead: "bg-slate-50/80",
  th: "whitespace-nowrap px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500",
  thRight: "whitespace-nowrap px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500",
  tbody: "divide-y divide-slate-100",
  tr: "transition-colors hover:bg-blue-50/40",
  td: "px-4 py-2 align-middle text-slate-600",
  tdRight: "px-4 py-2 text-right align-middle text-slate-600",
};

export function TableMessage({ children, colSpan }: { children: ReactNode; colSpan?: number }) {
  if (colSpan) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-slate-500">
          {children}
        </td>
      </tr>
    );
  }
  return <div className="px-4 py-8 text-center text-sm text-slate-500">{children}</div>;
}

/** Table section title shown in the TableCard toolbar. */
export function TableTitle({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {count !== undefined ? (
        <span className="rounded-full bg-brand-tint px-2 py-0.5 text-xs font-semibold text-blue-800">{count}</span>
      ) : null}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block w-full sm:max-w-xs">
      <span className="sr-only">{placeholder}</span>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
        <SearchIcon />
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm placeholder-slate-400 transition focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}

/* ---------- Badges ---------- */

export function StatusBadge({ active, label }: { active: boolean; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        active ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-slate-100 text-slate-600 ring-slate-500/20"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
      {label ?? (active ? "Active" : "Inactive")}
    </span>
  );
}

export type PillTone = "brand" | "emerald" | "amber" | "rose" | "slate";

export function Pill({ children, tone = "brand" }: { children: ReactNode; tone?: PillTone }) {
  const tones: Record<PillTone, string> = {
    brand: "bg-blue-50 text-blue-700 ring-blue-600/20",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
    rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
    slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
  };
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** Initials avatar for people rows. */
export function Avatar({ name }: { name: string }) {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-xs font-semibold text-blue-800">
      {initials}
    </div>
  );
}

/* ---------- Row actions ---------- */

export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-1">{children}</div>;
}

export function RowAction({
  variant,
  onClick,
  label,
}: {
  variant: "view" | "edit" | "delete" | "publish" | "hide";
  onClick: () => void;
  label?: string;
}) {
  const styles = {
    view: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    edit: "text-brand hover:bg-blue-50",
    delete: "text-rose-600 hover:bg-rose-50",
    publish: "text-emerald-700 hover:bg-emerald-50",
    hide: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };
  const icons = {
    view: <EyeIcon />,
    edit: <PencilIcon />,
    delete: <TrashIcon />,
    publish: <CheckIcon />,
    hide: <EyeOffIcon />,
  };
  const text = label ?? { view: "View", edit: "Edit", delete: "Delete", publish: "Publish", hide: "Hide" }[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold transition ${styles[variant]}`}
    >
      {icons[variant]}
      <span className="hidden sm:inline">{text}</span>
      <span className="sr-only sm:hidden">{text}</span>
    </button>
  );
}

/* ---------- Icons ---------- */

const icon = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function PlusIcon() {
  return (
    <svg {...icon} className="h-4 w-4">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg {...icon} className="h-4 w-4">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg {...icon} className="h-3.5 w-3.5">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg {...icon} className="h-3.5 w-3.5">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9" />
      <path d="M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg {...icon} className="h-3.5 w-3.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg {...icon} className="h-3.5 w-3.5">
      <path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg {...icon} className="h-3.5 w-3.5">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </svg>
  );
}
