"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorState, ScreenHeader, btn } from "@/components/explore/ui";
import { exploreRoutes } from "@/lib/explore/routes";

export default function ExploreError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <ScreenHeader title="Oops" subtitle="We couldn’t load this screen" />
      <div className="mt-4">
        <ErrorState
          message={error.message || "Please try again."}
          action={
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => unstable_retry()} className={btn.primary}>
                Try again
              </button>
              <Link href={exploreRoutes.discover()} className={btn.secondary}>
                Back to Discover
              </Link>
            </div>
          }
        />
      </div>
    </>
  );
}
