import { Skeleton } from "@/components/ui/skeleton";

export const ApplicationCardSkeleton = () => {
  return (
    <div className="shadow-xs rounded-md border border-input/40">
      <header className="flex justify-between gap-4 mb-1 p-4">
        <div className="flex-1">
          <Skeleton className="h-7 w-48 mb-2" variant="gray" />
          <Skeleton className="h-4 w-64" variant="light" />
        </div>
        <Skeleton className="h-6 w-20" variant="primary" />
      </header>

      <div className="px-2 py-4 m-2 bg-blue-50/50 border border-blue-400/20 rounded-lg grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="size-7 rounded-sm" variant="light" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-16" variant="light" />
              <Skeleton className="h-5 w-24" variant="gray" />
            </div>
          </div>
        ))}
      </div>

      <hr className="border-input" />

      <div className="px-4 my-4">
        <Skeleton className="h-6 w-16 mb-3" variant="gray" />
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" variant="primary" />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-3 py-1.5">
        <Skeleton className="h-4 w-32" variant="light" />
        <Skeleton className="h-8 w-16" variant="gray" />
      </div>
    </div>
  );
};
