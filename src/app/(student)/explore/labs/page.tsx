import LabsClient from "@/components/explore/LabsClient";
import { ScreenHeader, headerGradients } from "@/components/explore/ui";
import { listLabProjects, listSubjects, parseDemo } from "@/lib/explore/api";
import { exploreRoutes } from "@/lib/explore/routes";

export default async function LabsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; demo?: string }>;
}) {
  const { subject, demo } = await searchParams;
  const [projects, subjects] = await Promise.all([listLabProjects(parseDemo(demo)), listSubjects()]);
  const fromSubject = subjects.find((s) => s.slug === subject);

  return (
    <>
      <ScreenHeader
        title="Virtual Labs"
        subtitle="Experiments, simulations & projects"
        gradient={headerGradients.labs}
        back={
          fromSubject
            ? { href: exploreRoutes.subject(fromSubject.slug), label: fromSubject.title }
            : { href: exploreRoutes.discover(), label: "Discover" }
        }
      />
      <LabsClient projects={projects} subjects={subjects} initialSubject={subject} />
    </>
  );
}
