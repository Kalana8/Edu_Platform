import Link from "next/link";
import { notFound } from "next/navigation";
import ResourceCard from "@/components/explore/ResourceCard";
import SaveInterestButton from "@/components/explore/SaveInterestButton";
import SubjectVisual from "@/components/explore/SubjectVisual";
import {
  Card,
  Chip,
  DifficultyBadge,
  IllustrativeNotice,
  ScreenHeader,
  Section,
  SectionHeading,
  btn,
} from "@/components/explore/ui";
import { getResourcesByIds, getSubject, listLabProjects } from "@/lib/explore/api";
import { academyToLevel, existingRoutes } from "@/lib/explore/integration";
import { exploreRoutes } from "@/lib/explore/routes";

const academyStyle = {
  Foundation: { badge: "bg-emerald-100 text-emerald-700", icon: "📗" },
  Advanced: { badge: "bg-sky-100 text-sky-700", icon: "🎓" },
  "Elite Mastery": { badge: "bg-fuchsia-100 text-fuchsia-700", icon: "🏆" },
} as const;

export default async function SubjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const c = subject.curriculum;
  const refIds = c ? [...new Set([...c.furtherStudy, ...c.modules.flatMap((m) => [...m.readings, ...m.lectureRefs])])] : [];
  const [references, allProjects] = await Promise.all([getResourcesByIds(refIds), listLabProjects()]);
  const projects = allProjects.filter((p) => p.subjectSlug === slug);
  const academic = references.filter((r) => ["paper", "textbook", "unit-outline"].includes(r.type));
  const learning = references.filter((r) => !["paper", "textbook", "unit-outline"].includes(r.type));
  const available = subject.status === "available";

  return (
    <>
      <ScreenHeader
        title={subject.title}
        subtitle={subject.tagline}
        back={{ href: exploreRoutes.discover(), label: "Discover" }}
      />

      {/* Hero card */}
      <div className="mt-3 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm">
        <SubjectVisual motif={subject.motif} theme={subject.theme} title={`${subject.title} illustration`} className="aspect-[2/1] w-full" />
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge level={subject.difficulty} />
            <Chip>{subject.discipline}</Chip>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{subject.introduction}</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              ["⏱️", "Duration", `~${subject.estimatedHours} hrs`],
              ["🗂️", "Modules", c ? `${c.modules.length} modules` : "Coming soon"],
            ].map(([icon, k, v]) => (
              <div key={k} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">
                  <span aria-hidden>{icon}</span> {k}
                </p>
                <p className="text-sm font-bold text-slate-900">{v}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">{subject.durationLabel}</p>

          <div className="mt-4 flex flex-col gap-2">
            {available ? (
              <Link href={exploreRoutes.curriculum(slug)} className={btn.primary}>
                Start Learning →
              </Link>
            ) : (
              <span className={`${btn.primary} pointer-events-none opacity-50`} aria-disabled="true">
                Pathway in development
              </span>
            )}
            <SaveInterestButton slug={slug} className="w-full" />
          </div>
          {!available && (
            <p className="mt-3 text-xs text-slate-500">Save it to hear when the full pathway opens. Meanwhile, build the foundations below.</p>
          )}
        </div>
      </div>

      {/* Go deeper */}
      <Section aria-labelledby="go-deeper">
        <SectionHeading id="go-deeper" title="Explore this subject" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "🗂️", title: "Curriculum", desc: c ? `${c.modules.length} modules` : "Coming soon", href: c ? exploreRoutes.curriculum(slug) : null },
            { icon: "🧪", title: "Labs", desc: `${projects.length} activities`, href: exploreRoutes.labs(slug) },
            { icon: "📚", title: "Resources", desc: `${references.length} curated`, href: exploreRoutes.resources(slug) },
            { icon: "🌍", title: "Community", desc: "Learner projects", href: exploreRoutes.community(slug) },
          ].map((x) =>
            x.href ? (
              <Link key={x.title} href={x.href} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-lg">
                <span aria-hidden className="text-2xl">{x.icon}</span>
                <p className="mt-2 text-sm font-bold text-slate-900">{x.title}</p>
                <p className="text-[11px] text-slate-500">{x.desc}</p>
              </Link>
            ) : (
              <div key={x.title} className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 opacity-70">
                <span aria-hidden className="text-2xl grayscale">{x.icon}</span>
                <p className="mt-2 text-sm font-bold text-slate-500">{x.title}</p>
                <p className="text-[11px] text-slate-400">{x.desc}</p>
              </div>
            ),
          )}
        </div>
      </Section>

      {/* Learning stages */}
      {subject.stages.length > 0 && (
        <Section aria-labelledby="stages">
          <SectionHeading id="stages" title="Learning stages" subtitle="Follows the Foundation, Advanced & Elite Mastery academies" />
          <ol className="space-y-3">
            {subject.stages.map((s, i) => (
              <li key={s.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl text-2xl ${academyStyle[s.academy].badge}`}>
                    {academyStyle[s.academy].icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900">{s.title}</h3>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">Stage {i + 1}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">{s.academy} · ~{s.weeks} weeks</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">{s.summary}</p>
                {subject.relatedCategorySlug && (
                  <Link
                    href={existingRoutes.categoryLevel(subject.relatedCategorySlug, academyToLevel[s.academy])}
                    className="mt-2 inline-block text-xs font-semibold text-blue-600"
                  >
                    Related lessons in Learn →
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Applications */}
      <Section aria-labelledby="applications">
        <SectionHeading id="applications" title="Real-world applications" />
        <div className="grid grid-cols-2 gap-3">
          {subject.applications.map((a) => (
            <div key={a.title} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <span className="block h-1 w-6 rounded-full" style={{ background: subject.theme.base }} />
              <h3 className="mt-2 text-sm font-bold text-slate-900">{a.title}</h3>
              <p className="mt-1 text-xs text-slate-600">{a.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Why + outcomes */}
      <Section>
        <Card>
          <h2 className="font-bold text-slate-900">Why this subject matters</h2>
          <ul className="mt-3 space-y-2.5">
            {subject.whyItMatters.map((w) => (
              <li key={w} className="flex gap-3 text-sm text-slate-700">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                {w}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="mt-3">
          <h2 className="font-bold text-slate-900">What you will achieve</h2>
          <ul className="mt-3 space-y-2.5">
            {subject.outcomes.map((o) => (
              <li key={o} className="flex gap-3 text-sm text-slate-700">
                <span aria-hidden className="text-emerald-600">✓</span>
                {o}
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      {/* Foundations */}
      <Section aria-labelledby="foundations">
        <SectionHeading id="foundations" title="Start from zero" subtitle="No university knowledge required" />
        <Card>
          <h3 className="text-sm font-bold text-slate-900">Helpful to know</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {subject.foundationalKnowledge.map((f) => <Chip key={f}>{f}</Chip>)}
          </div>
          <h3 className="mt-5 text-sm font-bold text-slate-900">Prerequisite subjects</h3>
          <ul className="mt-1 divide-y divide-slate-100">
            {subject.prerequisites.map((p) => (
              <li key={p.title} className="py-3">
                <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                <p className="text-xs text-slate-500">{p.why}</p>
                {p.categorySlug && (
                  <Link href={existingRoutes.categoryLevel(p.categorySlug, "essential")} className="mt-1 inline-block text-xs font-semibold text-blue-600">
                    Review in Learn →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      {/* References */}
      {academic.length > 0 && (
        <Section>
          <SectionHeading title="Academic references" />
          <div className="space-y-3">
            {academic.map((r) => <ResourceCard key={r.id} resource={r} compact />)}
          </div>
        </Section>
      )}
      {learning.length > 0 && (
        <Section>
          <SectionHeading
            title="Recommended resources"
            action={<Link href={exploreRoutes.resources(slug)} className="text-xs font-semibold text-blue-600">View all</Link>}
          />
          <div className="space-y-3">
            {learning.map((r) => <ResourceCard key={r.id} resource={r} compact />)}
          </div>
        </Section>
      )}

      <Section>
        <IllustrativeNotice />
      </Section>
    </>
  );
}
