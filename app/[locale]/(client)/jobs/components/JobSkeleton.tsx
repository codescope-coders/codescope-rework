import { Skeleton } from "@/components/ui/skeleton";

export default function JobCardSkeleton() {
  return (
    <div className="job p-5 bg-[#34333b] rounded-md flex flex-col">
      <div className="header pb-4 border-b mb-4 border-b-[#4d4b57] items-start flex flex-col gap-2">
        <div className="title flex gap-2 items-start">
          <Skeleton className="h-6 w-62.5 bg-gray-500" />
        </div>
        <div className="status flex gap-2">
          <Skeleton className="h-6 w-24 bg-gray-500" />
          <Skeleton className="h-6 w-16 bg-gray-500" />
        </div>
      </div>
      <div className="grow">
        <Skeleton className="h-4 w-full mb-2 bg-gray-500" />
        <Skeleton className="h-4 w-5/6 mb-2 bg-gray-500" />
        <Skeleton className="h-4 w-4/6 bg-gray-500" />
      </div>
      <div className="footer mt-4 flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full bg-gray-500" />
            <Skeleton className="h-4 w-20 bg-gray-500" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full bg-gray-500" />
            <Skeleton className="h-4 w-24 bg-gray-500" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mt-2 bg-gray-500" />
      </div>
    </div>
  );
}
