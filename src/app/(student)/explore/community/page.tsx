import CommunityClient from "@/components/explore/CommunityClient";
import { ScreenHeader, headerGradients } from "@/components/explore/ui";
import { listCommunityPosts, listSubjects, parseDemo } from "@/lib/explore/api";
import { exploreRoutes } from "@/lib/explore/routes";

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; demo?: string }>;
}) {
  const { subject, demo } = await searchParams;
  const [posts, subjects] = await Promise.all([listCommunityPosts(parseDemo(demo)), listSubjects()]);
  const fromSubject = subjects.find((s) => s.slug === subject);

  return (
    <>
      <ScreenHeader
        title="Community"
        subtitle="Projects & discoveries from learners worldwide"
        gradient={headerGradients.community}
        back={
          fromSubject
            ? { href: exploreRoutes.subject(fromSubject.slug), label: fromSubject.title }
            : { href: exploreRoutes.discover(), label: "Discover" }
        }
      />
      <CommunityClient posts={posts} subjects={subjects} initialSubject={subject} />
    </>
  );
}
