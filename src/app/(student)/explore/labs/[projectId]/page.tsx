import { notFound } from "next/navigation";
import ProjectWorkspace from "@/components/explore/ProjectWorkspace";
import { DifficultyBadge, ScreenHeader, headerGradients } from "@/components/explore/ui";
import { getLabProject, getSubject } from "@/lib/explore/api";
import { activityLabels } from "@/lib/explore/labels";
import { exploreRoutes } from "@/lib/explore/routes";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getLabProject(projectId);
  if (!project) notFound();
  const subject = await getSubject(project.subjectSlug);

  return (
    <>
      <ScreenHeader
        title={project.title}
        subtitle={activityLabels[project.type]}
        gradient={headerGradients.labs}
        back={{ href: exploreRoutes.labs(subject?.slug), label: "Labs" }}
      />
      <div className="mt-3 rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-sm">
        <p className="text-sm leading-relaxed text-slate-700">{project.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <DifficultyBadge level={project.difficulty} />
          <span className="text-[11px] text-slate-500">~{project.durationMins} min</span>
          {subject && <span className="text-[11px] text-slate-500">· {subject.title}</span>}
        </div>
      </div>
      <ProjectWorkspace project={project} />
    </>
  );
}
