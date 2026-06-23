import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  gradientClass?: string;
  backHref?: string;
  backLabel?: string;
}

export default function PageHeader({
  title,
  subtitle,
  gradientClass = "from-sky-600 via-indigo-600 to-fuchsia-600",
  backHref = "/home",
  backLabel = "Back",
}: PageHeaderProps) {
  return (
    <section className={`overflow-hidden rounded-[1.75rem] bg-gradient-to-r ${gradientClass} p-5 text-white shadow-lg shadow-slate-950/10`}>
      <div className="flex items-center gap-4">
        <Link href={backHref} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white transition hover:bg-white/25">
          <span className="text-xl">←</span>
        </Link>
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/80">{backLabel}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-100/90">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}
