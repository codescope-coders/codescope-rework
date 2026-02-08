"use client";
import { MapPinIcon, TimerIcon } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import JobCardSkeleton from "./JobSkeleton";
import { useGetJobs } from "@/hooks/useJobs";
import { timeAgo } from "@/helpers/date";
import { useRef, useState, useEffect, useCallback } from "react";

const ITEMS_PER_PAGE = 6;

export const Content = () => {
  const { data, isPending } = useGetJobs();
  const observerTarget = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalJobs = data?.payload?.length || 0;
  const displayedJobs =
    data?.payload?.slice(0, currentPage * ITEMS_PER_PAGE) || [];
  const hasMore = displayedJobs.length < totalJobs;

  const loadMore = useCallback(() => {
    if (hasMore && !isPending) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore, isPending]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore]);

  return (
    <>
      <div
        className={clsx(
          "grid gap-3 transition duration-200 md:grid-cols-[repeat(auto-fill,minmax(420px,1fr))] grid-cols-[repeat(auto-fill,minmax(100%,1fr))]",
        )}
      >
        {isPending &&
          currentPage === 1 &&
          Array.from({ length: 3 }).map((_, i: number) => {
            return <JobCardSkeleton key={i} />;
          })}
        {displayedJobs?.map((job, i) => (
          <div
            className="job p-4 bg-[#34333b] rounded-md transition duration-200 flex flex-col"
            key={i}
          >
            <div className="header pb-4 border-b mb-4 border-b-[#4d4b57] items-satrt flex flex-col">
              <div className="title flex gap-2 items-start justify-between">
                <h2 className="mt-1 font-bold text-lg">{job?.position}</h2>
                <div
                  className={clsx(
                    "size-3 rounded-full shadow-xs border group-hover:-translate-y-1 duration-150 ease-out",
                    {
                      "shadow-success bg-success/30 border-success":
                        job?.status == "AVAILABLE",
                      "shadow-invalid-color bg-invalid-color/30 border-invalid-color":
                        job?.status == "CLOSED",
                    },
                  )}
                ></div>
              </div>
              <div className="w-fit py-1 px-2 bg-[#42414b] rounded-sm font-bold text-sm capitalize">
                <span>{job?.type.toLowerCase().replace(/_/g, " ")}</span>
              </div>
            </div>
            <p className="grow">{job?.description}</p>
            <div className="footer mt-4 flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="time flex items-center gap-1 text-gray-300">
                  <TimerIcon width={20} />
                  <span>{timeAgo(job?.createdAt)}</span>
                </div>
                <div className="time flex items-center gap-1 text-gray-300">
                  <MapPinIcon width={20} />
                  <span>{job?.location}</span>
                </div>
              </div>
              <Link href={`/jobs/${job.id}`}>
                <Button className="flex w-full h-10 rounded-sm hover:bg-primary bg-secondary transition duration-200 text-white font-bold text-lg cursor-pointer no-underline shadow-lg hover:shadow-xl">
                  Apply Now
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {hasMore && !isPending && (
        <div
          ref={observerTarget}
          className="h-20 flex items-center justify-center mt-4"
        >
          <div className="text-sm text-gray-400">Loading more jobs...</div>
        </div>
      )}

      {isPending && currentPage > 1 && (
        <div className="grid gap-3 mt-3 md:grid-cols-[repeat(auto-fill,minmax(420px,1fr))] grid-cols-[repeat(auto-fill,minmax(100%,1fr))]">
          {Array.from({ length: 3 }).map((_, i: number) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      )}
    </>
  );
};
