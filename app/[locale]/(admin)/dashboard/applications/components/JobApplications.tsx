"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applicationStatusEnum } from "@/lib/db/schema";
import { Search } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { Application } from "./Application";
import { useGetApplications } from "@/hooks/useApplications";
import { ApplicationCardSkeleton } from "./ApplicationSkeleton";
import { EmptyState } from "@/assets/illustrations/EmptyState";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 10;

export const JobApplications = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    search: string | undefined;
    status: string | undefined;
    expectedSalary: string | undefined;
    availability: string | undefined;
  }>({
    search: undefined,
    status: undefined,
    expectedSalary: undefined,
    availability: undefined,
  });

  const { data, isPending } = useGetApplications({
    ...(filters?.search ? { search: filters.search } : {}),
    ...(filters?.status && filters.status != "all"
      ? { status: filters.status }
      : {}),
    ...(filters?.expectedSalary && filters?.expectedSalary != "all"
      ? { expectedSalary: filters.expectedSalary }
      : {}),
    ...(filters?.availability && filters?.availability != "all"
      ? { availability: filters?.availability }
      : {}),
  });

  const totalApplications = data?.payload?.length || 0;
  const displayedApplications =
    data?.payload?.slice(0, currentPage * ITEMS_PER_PAGE) || [];
  const hasMore = displayedApplications.length < totalApplications;

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | undefined,
  ) => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

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
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl shadow-sm">
        <Input
          icon={<Search className="h-4 w-4" />}
          type="text"
          placeholder="Search by email..."
          size="sm"
          ref={inputRef}
          className="flex-1 md:min-w-sm min-w-full xl:max-w-md"
          onChange={(e) => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = window.setTimeout(
              () => handleFilterChange("search", e.target.value),
              300,
            );
          }}
        />
        <div className="grid md:grid-cols-3 gird-cols-1 gap-3 flex-1 min-w-full lg:min-w-lg">
          <Select
            value={filters.status}
            onValueChange={(v) => handleFilterChange("status", v)}
          >
            <SelectTrigger className="w-full capitalize">
              <SelectValue placeholder="Status" className="capitalize" />
            </SelectTrigger>
            <SelectContent>
              {applicationStatusEnum.enumValues.map((val, i) => (
                <SelectItem value={val} key={i} className="capitalize">
                  {val.toLowerCase().replace(/_/g, " ")}
                </SelectItem>
              ))}{" "}
              <SelectItem value="all" className="capitalize">
                All
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.expectedSalary}
            onValueChange={(v) => handleFilterChange("expectedSalary", v)}
          >
            <SelectTrigger className="w-full capitalize">
              <SelectValue
                placeholder="Expected Salary"
                className="capitalize"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highest" className="capitalize">
                Highest
              </SelectItem>
              <SelectItem value="lowest" className="capitalize">
                Lowest
              </SelectItem>
              <SelectItem value="all" className="capitalize">
                All
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.availability}
            onValueChange={(v) => handleFilterChange("availability", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="earliest">Available Soonest</SelectItem>
              <SelectItem value="immediate">Available Immediately</SelectItem>
              <SelectItem value="later">Available Later</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {displayedApplications && displayedApplications.length > 0 && (
        <div className="p-3 bg-white rounded-xl shadow-sm grid xl:grid-cols-2 gap-2">
          {displayedApplications.map((application, i) => (
            <Application key={i} application={application} />
          ))}
        </div>
      )}

      {/* Intersection Observer Target */}
      {hasMore && !isPending && (
        <div
          ref={observerTarget}
          className="h-20 flex items-center justify-center"
        >
          <div className="text-sm text-gray-500">Loading more...</div>
        </div>
      )}

      {isPending && currentPage === 1 && (
        <div className="p-3 bg-white rounded-xl shadow-sm xl:grid grid-cols-2 gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <ApplicationCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isPending && currentPage > 1 && (
        <div className="p-3 bg-white rounded-xl shadow-sm xl:grid grid-cols-2 gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <ApplicationCardSkeleton key={i} />
          ))}
        </div>
      )}

      {data && data?.payload?.length < 1 && (
        <div className="p-3 bg-white rounded-xl shadow-sm gap-2">
          <div className="flex items-center justify-center w-full h-full flex-col">
            <EmptyState />
            <h2 className="text-3xl text-gray-400 mb-4 -mt-4">Not Found</h2>
            <div className="flex gap-4">
              <Button
                variant={"outline"}
                onClick={() => {
                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                  setFilters({
                    search: "",
                    status: "",
                    expectedSalary: "",
                    availability: "",
                  });
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
