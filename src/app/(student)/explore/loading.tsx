import { Skeleton } from "@/components/explore/ui";

export default function ExploreLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="-mx-4 bg-brand px-5 py-6">
        <div className="h-8 w-2/3 animate-pulse rounded-xl bg-white/25" />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded-lg bg-white/20" />
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white">
            <Skeleton className="aspect-[5/2] rounded-none" />
            <div className="space-y-2 p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
