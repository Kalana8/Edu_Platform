import Link from "next/link";
import { notFound } from "next/navigation";
import CurriculumModules, { SourceBadge } from "@/components/explore/CurriculumModules";
import ResourceCard from "@/components/explore/ResourceCard";
import { Card, EmptyState, IllustrativeNotice, ScreenHeader, Section, SectionHeading, btn } from "@/components/explore/ui";
import { getResourcesByIds, getSubject, listLabProjects } from "@/lib/explore/api";
import { exploreRoutes } from "@/lib/explore/routes";

export default async function CurriculumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const back = { href: exploreRoutes.subject(slug), label: subject.title };
  const c = subject.curriculum;

  if (!c) {
    return (
      <>
        <ScreenHeader title="Curriculum" subtitle={subject.title} back={back} />
        <div className="mt-4">
          <EmptyState
            title="Curriculum in development"
            message={`The ${subject.title} curriculum is being prepared. Save the subject to hear when it opens.`}
            action={<Link href={exploreRoutes.subject(slug)} className={btn.primary}>Back to subject</Link>}
          />
        </div>
      </>
    );
  }

  const ids = [...new Set([...c.furtherStudy, ...c.modules.flatMap((m) => [...m.readings, ...m.lectureRefs])])];
  const [refs, projects] = await Promise.all([getResourcesByIds(ids), listLabProjects()]);
  const resourceMap = Object.fromEntries(refs.map((r) => [r.id, { id: r.id, title: r.title, url: r.url, access: r.access }]));
  const projectTitles = Object.fromEntries(projects.map((p) => [p.id, p.title]));
  const topicCount = c.modules.reduce((n, m) => n + m.topics.length, 0);

  return (
    <>
      <ScreenHeader title="Curriculum" subtitle={subject.title} back={back} />

      {/* Reference unit card */}
      <Card className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">University-informed</p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">{c.referenceUnitTitle}</h2>
        <p className="mt-0.5 font-mono text-xs text-slate-500">{c.referenceUnitCode ?? "Unit code not available"}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{c.description}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            [String(c.modules.length), "Modules"],
            [String(topicCount), "Lessons"],
            [`${subject.estimatedHours}h`, "Total"],
          ].map(([v, k]) => (
            <div key={k} className="rounded-2xl bg-slate-50 py-3">
              <p className="text-lg font-bold text-slate-900">{v}</p>
              <p className="text-[11px] text-slate-500">{k}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-slate-50 p-3">
          <p className="text-[11px] font-semibold text-slate-500">Academic reference institution</p>
          <p className="text-xs text-slate-700">{c.referenceInstitution}</p>
        </div>
      </Card>

      <div className="mt-3">
        <IllustrativeNotice />
      </div>

      {/* Outcomes */}
      <Section>
        <Card>
          <h2 className="font-bold text-slate-900">Learning outcomes</h2>
          <ol className="mt-3 space-y-2.5">
            {c.outcomes.map((o, i) => (
              <li key={o} className="flex gap-3 text-sm text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-700">{i + 1}</span>
                {o}
              </li>
            ))}
          </ol>
        </Card>
        <Card className="mt-3">
          <h2 className="font-bold text-slate-900">Prerequisites</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            {c.prerequisites.map((p) => <li key={p}>• {p}</li>)}
          </ul>
          <Link href={`${exploreRoutes.subject(slug)}#foundations`} className="mt-3 inline-block text-xs font-semibold text-blue-600">
            New to this? Start from zero →
          </Link>
        </Card>
      </Section>

      {/* Modules */}
      <Section aria-labelledby="modules">
        <SectionHeading id="modules" title="Modules" subtitle="Each lesson is a micro-lesson in EduMate" />
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <SourceBadge source="edumate" /> original EduMate content
          <SourceBadge source="reference" /> based on academic references
        </div>
        <CurriculumModules
          modules={c.modules}
          resources={resourceMap}
          projectTitles={projectTitles}
          categorySlug={subject.relatedCategorySlug}
        />
      </Section>

      {/* Assessments */}
      <Section aria-labelledby="assessments">
        <SectionHeading id="assessments" title="Assessments" subtitle="Uses EduMate mastery verification · counts toward your Mastery Passport" />
        <div className="space-y-3">
          {c.assessments.map((a) => (
            <div key={a.title} className="flex items-center gap-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-blue-50">
                <span className="text-base font-bold text-blue-700">{a.weight}%</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">{a.title}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-600">{a.type}</p>
                <p className="mt-0.5 text-xs text-slate-600">{a.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Further study */}
      <Section>
        <SectionHeading title="Further study" />
        <div className="space-y-3">
          {refs.filter((r) => c.furtherStudy.includes(r.id)).map((r) => <ResourceCard key={r.id} resource={r} compact />)}
        </div>
      </Section>

      <Section>
        <Link href={exploreRoutes.labs(slug)} className={`${btn.primary} w-full`}>
          🧪 Go to practical labs
        </Link>
      </Section>
    </>
  );
}
