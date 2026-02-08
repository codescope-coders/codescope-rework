"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DetailsRow,
  TableHandler,
  TableHandlerDetailsRow,
  TableHandlerProvider,
} from "@/components/ui/TableHandler";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useGetJobs } from "@/hooks/useJobs";
import { jobStatusEnum, jobTypeEnum } from "@/lib/db/schema";
import { Search } from "lucide-react";
import { JobRow } from "./JobRow";
import { useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { EditJobDialog } from "../EditJobDialog";
import { EmptyState } from "@/assets/illustrations/EmptyState";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/helpers/date";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 15;

export const JobsTable = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    type: string | undefined;
    search: string | undefined;
    status: string | undefined;
  }>({
    type: undefined,
    search: undefined,
    status: undefined,
  });
  const timeoutRef = useRef<number | null>(null);
  const { data, isPending } = useGetJobs({
    ...(filters?.type ? { type: filters.type } : {}),
    ...(filters?.status ? { status: filters.status } : {}),
    ...(filters?.search ? { search: filters.search } : {}),
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });
  const [isOpen, setIsOpen] = useState(false);

  const totalPages = data?.pagination?.totalPages || 0;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Reset to page 1 when filters change
  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | undefined,
  ) => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="rounded-xl bg-white p-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {isOpen ? <EditJobDialog closeDialog={() => setIsOpen(false)} /> : null}
      </Dialog>
      <div className="flex flex-wrap gap-3">
        <Input
          icon={<Search className="h-4 w-4" />}
          type="text"
          placeholder="Search jobs by position..."
          size="sm"
          ref={inputRef}
          className="flex-1 md:min-w-sm min-w-full max-w-md"
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
        <Select
          value={filters.status}
          onValueChange={(v) => handleFilterChange("status", v)}
        >
          <SelectTrigger className="w-45 h-full max-sm:w-full capitalize">
            <SelectValue placeholder="Job status" />
          </SelectTrigger>
          <SelectContent>
            {jobStatusEnum.enumValues.map((val, i) => (
              <SelectItem value={val} key={i} className="capitalize">
                {val.toLowerCase().replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.type}
          onValueChange={(v) => handleFilterChange("type", v)}
        >
          <SelectTrigger className="w-45 h-full max-sm:w-full capitalize">
            <SelectValue placeholder="Job type" />
          </SelectTrigger>
          <SelectContent>
            {jobTypeEnum.enumValues.map((val, i) => (
              <SelectItem value={val} key={i} className="capitalize">
                {val.toLowerCase().replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {data && data?.payload?.length > 0 && (
        <>
          <TableHandler
            className="mt-4 w-full"
            columns={[
              { key: "position" },
              { key: "location", breakpoint: "sm" },
              { key: "type", breakpoint: "md" },
              { key: "status", breakpoint: "lg" },
              { key: "created", classes: "text-center", breakpoint: "lg" },
              { key: "actions", classes: "text-center" },
            ]}
          >
            {!isPending &&
              data?.payload?.map((job, i) => (
                <TableHandlerProvider
                  rowsLength={data?.payload?.length}
                  index={i}
                  key={i}
                >
                  <JobRow job={job} openDialog={() => setIsOpen(true)} />
                  <TableHandlerDetailsRow>
                    <dl>
                      <DetailsRow
                        columnKey="created"
                        className="flex items-center justify-between gap-3 font-medium text-sm"
                      >
                        <dt>Created:</dt>
                        <dd>{timeAgo(job.createdAt)}</dd>
                      </DetailsRow>
                      <DetailsRow
                        columnKey="status"
                        className="flex items-center justify-between gap-3 font-medium text-sm"
                      >
                        <dt>Status:</dt>
                        <dd>
                          <Badge
                            variant={
                              job.status === "AVAILABLE" ? "green" : "secondary"
                            }
                            className="capitalize"
                          >
                            {job.status.toLowerCase()}
                          </Badge>
                        </dd>
                      </DetailsRow>
                      <DetailsRow
                        columnKey="created"
                        className="flex items-center justify-between gap-3 font-medium text-sm"
                      >
                        <dt>Type:</dt>
                        <dd className="capitalize">{job.type.replace("_", " ").toLowerCase()}</dd>
                      </DetailsRow>
                      <DetailsRow
                        columnKey="created"
                        className="flex items-center justify-between gap-3 font-medium text-sm"
                      >
                        <dt>Location:</dt>
                        <dd>{job.location}</dd>
                      </DetailsRow>
                    </dl>
                  </TableHandlerDetailsRow>
                </TableHandlerProvider>
              ))}
          </TableHandler>

          {totalPages > 1 && (
            <Pagination className="mt-4 justify-start">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => setCurrentPage(page as number)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
      {!isPending && data?.payload && data?.payload?.length < 1 && (
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
                  type: "",
                  search: "",
                  status: "",
                });
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};
