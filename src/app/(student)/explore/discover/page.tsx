import DiscoverClient from "@/components/explore/DiscoverClient";
import { ScreenHeader } from "@/components/explore/ui";
import { listSubjects, parseDemo } from "@/lib/explore/api";
import { exploreRoutes } from "@/lib/explore/routes";

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const { demo } = await searchParams;
  const subjects = await listSubjects(parseDemo(demo));

  return (
    <>
      <ScreenHeader
        title="Discover & Explore"
        back={{ href: exploreRoutes.entry(), label: "Categories" }}
      />
      <DiscoverClient subjects={subjects} />
    </>
  );
}
