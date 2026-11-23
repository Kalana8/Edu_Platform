import ResourceLibraryClient from "@/components/explore/ResourceLibraryClient";
import { IllustrativeNotice, ScreenHeader, headerGradients } from "@/components/explore/ui";
import { listResources, listSubjects, parseDemo } from "@/lib/explore/api";
import { exploreRoutes } from "@/lib/explore/routes";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; demo?: string }>;
}) {
  const { subject, demo } = await searchParams;
  const [resources, subjects] = await Promise.all([listResources(parseDemo(demo)), listSubjects()]);
  const fromSubject = subjects.find((s) => s.slug === subject);

  return (
    <>
      <ScreenHeader
        title="Academic Resources"
        subtitle="Lectures, papers, textbooks & more"
        gradient={headerGradients.resources}
        back={
          fromSubject
            ? { href: exploreRoutes.subject(fromSubject.slug), label: fromSubject.title }
            : { href: exploreRoutes.discover(), label: "Discover" }
        }
      />
      <ResourceLibraryClient resources={resources} subjects={subjects} initialSubject={subject} />
      <div className="mt-6">
        <IllustrativeNotice>
          <strong className="font-semibold">About sources.</strong> External resources open on their original sites —
          EduMate links to material it doesn’t have permission to reproduce. Always check each source’s own licence.
        </IllustrativeNotice>
      </div>
    </>
  );
}
