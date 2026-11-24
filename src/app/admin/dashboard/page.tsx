import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboard() {
  let totalStudents = 0;
  let activeStudents = 0;
  let activeSchools = 0;

  try {
    const supabase = createAdminClient();

    const [studentsRes, schoolsRes, progressRes] = await Promise.all([
      supabase
        .from("students")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("schools")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),

      supabase.from("reading_progress").select("user_id"),
    ]);

    totalStudents = studentsRes.count ?? 0;
    activeSchools = schoolsRes.count ?? 0;

    const progressData = progressRes.data ?? [];
    activeStudents = new Set(progressData.map((p) => p.user_id)).size;
  } catch (error) {
    console.error("Failed to load dashboard stats", error);
  }

  const activeRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;
  const inactiveStudents = Math.max(totalStudents - activeStudents, 0);
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const stats = [
    { label: "Total Students", value: totalStudents, icon: <UsersIcon />, tone: "bg-brand-tint text-slate-900" },
    { label: "Active Students", value: activeStudents, icon: <PulseIcon />, tone: "bg-brand-soft text-slate-900" },
    { label: "Active Schools", value: activeSchools, icon: <SchoolIcon />, tone: "bg-blue-50 text-slate-900" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-1 py-2 sm:px-2">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-4xl bg-linear-to-br from-blue-700 via-brand to-blue-300 px-5 pb-5 pt-6 text-white sm:px-8 sm:pb-8 sm:pt-8">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-1/3 h-64 w-64 rounded-full bg-brand-soft/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-10 top-10 hidden h-40 w-40 rounded-full border border-white/20 sm:block" />
        <div aria-hidden className="pointer-events-none absolute right-20 top-20 hidden h-40 w-40 rounded-full border border-white/10 sm:block" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Platform Overview</h1>
            <p className="mt-1 text-sm text-blue-50/90">How students and schools are engaging today.</p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium backdrop-blur-sm sm:text-sm">
            {today}
          </span>
        </div>

        {/* Stat cards inside the banner */}
        <div className="relative mt-8 grid grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className={`rounded-[1.75rem] p-5 shadow-lg shadow-blue-950/15 ${stat.tone}`}>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/70 text-brand">{stat.icon}</span>
                {stat.label}
              </div>
              <p className="mt-6 text-4xl font-semibold tracking-tight">{stat.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Detail cards */}
      <section className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Active rate ring */}
        <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <h2 className="text-lg font-semibold text-slate-900">Engagement</h2>
          <p className="text-sm text-slate-500">Students with reading activity</p>
          <div className="mt-4 flex justify-center">
            <ProgressRing percent={activeRate} />
          </div>
        </div>

        {/* Active vs inactive breakdown */}
        <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <h2 className="text-lg font-semibold text-slate-900">Student Activity</h2>
          <p className="text-sm text-slate-500">Active vs. not yet started</p>

          <div className="mt-8 flex h-4 overflow-hidden rounded-full bg-brand-tint">
            <div className="h-full rounded-full bg-brand" style={{ width: `${activeRate}%` }} />
          </div>

          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-3 w-3 rounded-full bg-brand" /> Active
              </dt>
              <dd className="text-lg font-semibold text-slate-900">{activeStudents.toLocaleString()}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-3 w-3 rounded-full bg-brand-tint ring-1 ring-slate-300" /> Not started
              </dt>
              <dd className="text-lg font-semibold text-slate-900">{inactiveStudents.toLocaleString()}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <dt className="text-sm text-slate-600">Students per active school</dt>
              <dd className="text-lg font-semibold text-slate-900">
                {activeSchools > 0 ? Math.round(totalStudents / activeSchools).toLocaleString() : "—"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Quick actions (dark contrast card) */}
        <div className="flex flex-col rounded-[1.75rem] bg-slate-900 p-5 text-white shadow-sm">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <p className="text-sm text-slate-400">Jump to common admin tasks</p>

          <div className="mt-5 space-y-2">
            <QuickLink href="/admin/approvals" title="Review approvals" subtitle="Pending requests" />
            <QuickLink href="/admin/moderators" title="Manage moderators" subtitle="Add or update moderators" />
          </div>
        </div>
      </section>
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(percent, 0), 100) / 100);

  return (
    <div className="relative h-44 w-44">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" strokeWidth="14" className="stroke-brand-tint" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-brand"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-slate-900">{percent}%</span>
        <span className="text-xs text-slate-500">active</span>
      </div>
    </div>
  );
}

function QuickLink({ href, title, subtitle }: { href: string; title: string; subtitle: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 transition hover:bg-white/10"
    >
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-900 transition group-hover:bg-brand-soft">
        <ArrowIcon />
      </span>
    </Link>
  );
}

const iconProps = {
  className: "h-4 w-4",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function UsersIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
      <path d="M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </svg>
  );
}

function SchoolIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 10 12 5l9 5-9 5-9-5Z" />
      <path d="M7 12.5V17c0 1.5 2.5 3 5 3s5-1.5 5-3v-4.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg {...iconProps}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}
