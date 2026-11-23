import Link from "next/link";
import { EmptyState, ScreenHeader, btn } from "@/components/explore/ui";
import { exploreRoutes } from "@/lib/explore/routes";

export default function ExploreNotFound() {
  return (
    <>
      <ScreenHeader title="Not Found" subtitle="This page doesn’t exist yet" />
      <div className="mt-4">
        <EmptyState
          title="We couldn’t find that"
          message="This subject or activity doesn’t exist yet. Explore the available subjects instead."
          action={
            <Link href={exploreRoutes.discover()} className={btn.primary}>
              Go to Discover
            </Link>
          }
        />
      </div>
    </>
  );
}
