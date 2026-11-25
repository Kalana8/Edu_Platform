import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/* Shared form controls for the brand-blue auth screens: white soft-bordered
   inputs, solid white primary button, outlined secondary button, labelled
   divider and an inline error pill. */

const focusRing = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/35";

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  error?: boolean;
  trailing?: ReactNode;
};

export function TextField({ id, label, error = false, trailing, className = "", ...props }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-bold text-white">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error || undefined}
          className={`h-10 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.06),0_1px_2px_rgba(4,43,68,0.15)] outline-none transition placeholder:text-[13px] placeholder:text-slate-400 focus:ring-4 ${
            error
              ? "border-rose-400 ring-4 ring-rose-300/60 focus:ring-rose-300/60"
              : "border-white focus:ring-white/35"
          } ${trailing ? "pr-12" : ""} ${className}`}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-3 flex items-center text-slate-400">{trailing}</div>}
      </div>
    </div>
  );
}

export function FormError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p
      id={id}
      role="alert"
      className="mx-auto inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
    >
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4.5M12 16h.01" />
      </svg>
      {children}
    </p>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".3" strokeWidth={3} />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

// Pill with centred label and a round arrow badge pinned right (same as landing "Get Started").
const primaryBase = `group relative flex h-14 items-center justify-center rounded-full bg-white font-semibold text-slate-900 shadow-[0_12px_32px_-8px_rgba(4,43,68,0.45)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(4,43,68,0.55)] active:translate-y-0 active:scale-[0.98] disabled:cursor-wait disabled:hover:translate-y-0 ${focusRing}`;
const primaryClass = `${primaryBase} w-full px-16 text-lg`;
// Content-width variant, centred in its column (matches the landing "Get Started").
const primaryCompactClass = `${primaryBase} self-center pl-6 pr-16 text-base`;

const secondaryClass = `inline-flex h-8 items-center justify-center gap-1.5 self-start rounded-full pl-3 pr-5 text-sm font-medium text-white/85 ring-1 ring-inset ring-white/35 transition hover:bg-white/10 hover:text-white active:scale-[0.99] ${focusRing}`;

function ArrowBadge({ loading = false }: { loading?: boolean }) {
  return (
    <span className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-rotate-8 group-disabled:rotate-0">
      {loading ? (
        <Spinner />
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      )}
    </span>
  );
}

export function PrimaryButton({
  loading = false,
  compact = false,
  disabled,
  children,
  className = "",
  ...props
}: ComponentProps<"button"> & { loading?: boolean; compact?: boolean }) {
  return (
    <button {...props} className={`${compact ? primaryCompactClass : primaryClass} ${className}`} disabled={loading || disabled}>
      {children}
      <ArrowBadge loading={loading} />
    </button>
  );
}

export function PrimaryLink({ children, className = "", ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props} className={`${primaryClass} ${className}`}>
      {children}
      <ArrowBadge />
    </Link>
  );
}

export function SecondaryLink({ className = "", ...props }: ComponentProps<typeof Link>) {
  return <Link className={`${secondaryClass} ${className}`} {...props} />;
}

export function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 text-sm text-white/70">
      <span className="h-px flex-1 bg-white/25" />
      {children}
      <span className="h-px flex-1 bg-white/25" />
    </div>
  );
}
