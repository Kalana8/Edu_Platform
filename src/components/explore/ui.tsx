import type { ReactNode } from "react";
import PageHeader from "@/components/PageHeader";
import type { Difficulty } from "@/lib/explore/types";
import { titleCase } from "@/lib/titleCase";

// ── Header (reuses the existing student PageHeader) ─────────────────────────

export function ScreenHeader({
  title,
  subtitle,
  back,
}: {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
}) {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      backHref={back?.href}
      backLabel={back ? `Back to ${back.label}` : undefined}
      rounded={false}
      className="-mx-4"
    />
  );
}

// ── Difficulty ──────────────────────────────────────────────────────────────

const difficultyMeta: Record<Difficulty, { label: string; dots: number; cls: string }> = {
  beginner: { label: "Beginner friendly", dots: 1, cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  intermediate: { label: "Intermediate", dots: 2, cls: "bg-sky-50 text-sky-700 ring-sky-200" },
  advanced: { label: "Advanced", dots: 3, cls: "bg-violet-50 text-violet-700 ring-violet-200" },
  university: { label: "University level", dots: 4, cls: "bg-amber-50 text-amber-800 ring-amber-200" },
};

export function DifficultyBadge({ level }: { level: Difficulty }) {
  const m = difficultyMeta[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${m.cls}`}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3, 4].map((d) => (
          <span key={d} className={`h-1.5 w-1.5 rounded-full bg-current ${d <= m.dots ? "" : "opacity-25"}`} />
        ))}
      </span>
      {m.label}
    </span>
  );
}

export function Chip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ${className}`}>
      {children}
    </span>
  );
}

// ── Layout ──────────────────────────────────────────────────────────────────

export function SectionHeading({
  title,
  subtitle,
  action,
  id,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 id={id} className="text-lg font-bold text-slate-900">
          {titleCase(title)}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Section({ children, className = "", ...rest }: { children: ReactNode; className?: string; "aria-labelledby"?: string }) {
  return (
    <section className={`mt-6 ${className}`} {...rest}>
      {children}
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

/** Horizontally swipeable row — the mobile replacement for multi-column grids. */
export function SwipeRow({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div
      aria-label={label}
      className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none]"
    >
      {children}
    </div>
  );
}

// ── Buttons ─────────────────────────────────────────────────────────────────

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50";
export const btn = {
  primary: `${btnBase} bg-blue-600 text-white hover:bg-blue-700`,
  secondary: `${btnBase} border border-slate-200 bg-white text-slate-800 hover:bg-slate-50`,
  ghost: `${btnBase} text-slate-600 hover:bg-slate-100`,
};

export function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition ${
        active ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

export const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

// ── Notices & states ────────────────────────────────────────────────────────

export function IllustrativeNotice({ children }: { children?: ReactNode }) {
  return (
    <div role="note" className="flex gap-3 rounded-[1.75rem] border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
      <span aria-hidden className="text-base leading-none">ⓘ</span>
      <p>
        {children ?? (
          <>
            <strong className="font-semibold">Illustrative content.</strong> University-informed material here is a
            demonstration modelled on typical academic structures. It is not official university material, and EduMate
            does not claim accreditation or institutional partnership.
          </>
        )}
      </p>
    </div>
  );
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[1.75rem] bg-white px-6 py-10 text-center shadow-sm">
      <div aria-hidden className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
        ∅
      </div>
      <p className="mt-4 font-semibold text-slate-900">{titleCase(title)}</p>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div role="alert" className="rounded-[1.75rem] border border-rose-100 bg-rose-50 px-5 py-8 text-center">
      <p className="font-semibold text-rose-800">Something went wrong</p>
      <p className="mt-1 text-sm text-rose-700">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div
        className="h-2.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function formatDate(iso: string) {
  return new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
