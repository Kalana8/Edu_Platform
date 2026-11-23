type ProgressRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
};

export default function ProgressRing({ value, size = 32, stroke = 3, className = "" }: ProgressRingProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${pct}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-brand-tint" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          className="stroke-brand transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute font-semibold text-slate-900" style={{ fontSize: Math.max(8, size * 0.26) }}>
        {pct}%
      </span>
    </div>
  );
}
