import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  topPadding?: boolean;
  rounded?: boolean;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  backHref = "/home",
  backLabel = "Back",
  topPadding = true,
  rounded = true,
  className = "",
}: PageHeaderProps) {
  const paddingClass = topPadding ? "pt-4 pb-4" : "pt-0 pb-4";
  const radiusClass = rounded ? "rounded-[1.75rem]" : "rounded-none";

  return (
    <section className={`overflow-hidden ${radiusClass} bg-brand px-5 ${paddingClass} text-white shadow-lg shadow-slate-950/10 ${className}`}>
      <div className="flex items-center gap-4">
        {/* <Link href={backHref} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white transition hover:bg-white/25">
          <span className="text-xl">←</span>
        </Link> */}
        <div>
          {/* <p className="text-sm uppercase tracking-[0.24em] text-white/80">{backLabel}</p> */}
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-100/90">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}
