/* Loader for the mobile-first student and sign-in screens.
   tone="brand" sits on light backgrounds, tone="light" on the brand-blue ones. */

type Tone = "brand" | "light";

const toneClasses: Record<Tone, { ring: string; track: string; label: string }> = {
  brand: { ring: "text-brand", track: "text-brand-tint", label: "text-slate-500" },
  light: { ring: "text-white", track: "text-white/25", label: "text-white/80" },
};

export function MobileSpinner({ tone = "brand", className = "h-10 w-10" }: { tone?: Tone; className?: string }) {
  const t = toneClasses[tone];
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth={5} className={t.track} />
      <path d="M44 24a20 20 0 0 0-20-20" stroke="currentColor" strokeWidth={5} strokeLinecap="round" className={t.ring} />
    </svg>
  );
}

export default function MobileLoader({
  label = "Loading…",
  hint,
  tone = "brand",
  className = "py-16",
}: {
  label?: string;
  hint?: string;
  tone?: Tone;
  className?: string;
}) {
  const t = toneClasses[tone];
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-3 text-center ${className}`}>
      <MobileSpinner tone={tone} />
      <div>
        <p className={`text-sm font-medium ${t.label}`}>{label}</p>
        {hint && <p className={`mt-0.5 text-xs ${t.label} opacity-80`}>{hint}</p>}
      </div>
    </div>
  );
}
