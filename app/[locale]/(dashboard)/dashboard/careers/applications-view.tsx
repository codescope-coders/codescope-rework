"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Hourglass,
  MessageSquare,
  Search,
  XCircle,
} from "lucide-react";
import {
  Button,
  EmptyState,
  NativeSelect,
  Spinner,
  StatCard,
  controlClass,
} from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";
import { useDict } from "@/lib/dashboard/useDict";
import { applicationStatusEnum } from "@/lib/db/schema";
import { useGetApplications } from "@/hooks/useApplications";
import type { ApplicationStatus } from "@/services/applications";
import { careersDict } from "./careers.i18n";
import { ApplicationCard } from "./application-card";

const PER_PAGE = 8;

export function ApplicationsView() {
  const d = useDict(careersDict);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [salary, setSalary] = useState("");
  const [availability, setAvailability] = useState("");
  const [visible, setVisible] = useState(PER_PAGE);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => setVisible(PER_PAGE), [search, status, salary, availability]);

  const { data, isPending } = useGetApplications({
    ...(search ? { search } : {}),
    ...(salary ? { expectedSalary: salary } : {}),
    ...(availability ? { availability } : {}),
  });
  const base = useMemo(() => data?.payload ?? [], [data]);

  const counts = useMemo(() => {
    const c = { total: base.length, PENDING: 0, APPROVED: 0, INTERVIEWED: 0, REJECTED: 0 };
    for (const a of base) c[a.status] += 1;
    return c;
  }, [base]);

  const filtered = status ? base.filter((a) => a.status === status) : base;
  const shown = filtered.slice(0, visible);
  const hasMore = shown.length < filtered.length;

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setSalary("");
    setAvailability("");
  };
  const filtersActive = Boolean(search || status || salary || availability);

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard tone="info" icon={FileText} value={counts.total} label={d.kpiTotalApps} />
        <StatCard tone="warning" icon={Hourglass} value={counts.PENDING} label={d.kpiPending} />
        <StatCard tone="success" icon={CheckCircle2} value={counts.APPROVED} label={d.kpiApproved} />
        <StatCard tone="primary" icon={MessageSquare} value={counts.INTERVIEWED} label={d.kpiInterviewed} />
        <StatCard tone="danger" icon={XCircle} value={counts.REJECTED} label={d.kpiRejected} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={d.searchApps}
            className={cn(controlClass, "ps-9")}
          />
        </div>
        <NativeSelect
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-auto min-w-[140px]"
        >
          <option value="">{d.allAppStatuses}</option>
          {applicationStatusEnum.enumValues.map((v) => (
            <option key={v} value={v}>
              {d.appStatus[v as ApplicationStatus]}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          className="w-auto min-w-[150px]"
        >
          <option value="">{d.salaryAny}</option>
          <option value="highest">{d.salaryHighest}</option>
          <option value="lowest">{d.salaryLowest}</option>
        </NativeSelect>
        <NativeSelect
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="w-auto min-w-[150px]"
        >
          <option value="">{d.availAny}</option>
          <option value="immediate">{d.availImmediate}</option>
          <option value="soonest">{d.availSoonest}</option>
          <option value="later">{d.availLater}</option>
        </NativeSelect>
      </div>

      {isPending ? (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
          <Spinner /> …
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState>
          <div className="flex flex-col items-center gap-3">
            <span>{d.noApps}</span>
            {filtersActive && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                {d.clearFilters}
              </Button>
            )}
          </div>
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {shown.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <span className="text-[12px] text-muted-foreground">
              {d.showingOf
                .replace("{shown}", String(shown.length))
                .replace("{total}", String(filtered.length))}
            </span>
            {hasMore && (
              <Button variant="outline" size="sm" onClick={() => setVisible((v) => v + PER_PAGE)}>
                {d.loadMore}
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
}
