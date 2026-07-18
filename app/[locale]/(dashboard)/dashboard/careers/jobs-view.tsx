"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import {
  Briefcase,
  CheckCircle2,
  FileText,
  Lock,
  Pencil,
  Search,
  Trash2,
  Unlock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  EmptyState,
  NativeSelect,
  Spinner,
  StatCard,
  StatusBadge,
  Table,
  TableWrap,
  Td,
  Th,
  controlClass,
} from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/helpers/date";
import { useDict } from "@/lib/dashboard/useDict";
import { queryClient } from "@/lib/queryClientProvider";
import { jobStatusEnum, jobTypeEnum } from "@/lib/db/schema";
import { useGetStats } from "@/hooks/useStats";
import { useDeleteJob, useGetJobs, useToggleJob } from "@/hooks/useJobs";
import type { JobDto } from "@/services/jobs";
import { careersDict } from "./careers.i18n";
import { JobModal } from "./job-modal";

const PER_PAGE = 12;

export function JobsView({ canManage }: { canManage: boolean }) {
  const d = useDict(careersDict);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ editing: JobDto | null } | null>(null);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: statsData } = useGetStats();
  const s = statsData?.payload;

  const { data, isPending } = useGetJobs({
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    page,
    limit: PER_PAGE,
  });
  const jobs = data?.payload ?? [];
  const totalPages = data?.pagination?.totalPages ?? 0;

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setType("");
    setPage(1);
  };

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard tone="primary" icon={Briefcase} value={s?.totalJobs ?? "—"} label={d.kpiTotalJobs} />
        <StatCard tone="success" icon={CheckCircle2} value={s?.activeJobs ?? "—"} label={d.kpiActiveJobs} />
        <StatCard tone="neutral" icon={XCircle} value={s?.closedJobs ?? "—"} label={d.kpiClosedJobs} />
        <StatCard tone="info" icon={FileText} value={s?.totalApplications ?? "—"} label={d.kpiTotalApps} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={d.searchJobs}
            className={cn(controlClass, "ps-9")}
          />
        </div>
        <NativeSelect
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-auto min-w-[150px]"
        >
          <option value="">{d.allStatuses}</option>
          {jobStatusEnum.enumValues.map((v) => (
            <option key={v} value={v}>
              {d.jobStatus[v]}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="w-auto min-w-[150px]"
        >
          <option value="">{d.allTypes}</option>
          {jobTypeEnum.enumValues.map((v) => (
            <option key={v} value={v}>
              {d.jobType[v]}
            </option>
          ))}
        </NativeSelect>
        {canManage && (
          <Button className="ms-auto" onClick={() => setModal({ editing: null })}>
            + {d.newJob}
          </Button>
        )}
      </div>

      {isPending ? (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
          <Spinner /> …
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState>
          <div className="flex flex-col items-center gap-3">
            <span>{search || status || type ? d.notFound : d.noJobs}</span>
            {(search || status || type) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                {d.clearFilters}
              </Button>
            )}
          </div>
        </EmptyState>
      ) : (
        <>
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>{d.colPosition}</Th>
                  <Th>{d.colLocation}</Th>
                  <Th>{d.colType}</Th>
                  <Th>{d.colStatus}</Th>
                  <Th>{d.colCreated}</Th>
                  {canManage && <Th className="text-end" />}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <JobRow key={job.id} job={job} canManage={canManage} onEdit={() => setModal({ editing: job })} />
                ))}
              </tbody>
            </Table>
          </TableWrap>

          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {d.prev}
              </Button>
              <span className="text-[12px] text-muted-foreground">
                {d.pageOf.replace("{page}", String(page)).replace("{total}", String(totalPages))}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {d.next}
              </Button>
            </div>
          )}
        </>
      )}

      {modal && <JobModal editing={modal.editing} onClose={() => setModal(null)} />}
    </>
  );
}

function JobRow({
  job,
  canManage,
  onEdit,
}: {
  job: JobDto;
  canManage: boolean;
  onEdit: () => void;
}) {
  const d = useDict(careersDict);
  const locale = useLocale() as "en" | "ar";
  const isOpen = job.status === "AVAILABLE";

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["jobs"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  };
  const toggle = useToggleJob(job.id, (m) => {
    toast.success(m);
    invalidate();
  });
  const remove = useDeleteJob(job.id, (m) => {
    toast.success(m);
    invalidate();
  });
  const busy = toggle.isPending || remove.isPending;

  return (
    <tr className={cn(busy && "opacity-50")}>
      <Td className="font-bold text-foreground">{job.position}</Td>
      <Td className="text-muted-foreground">{job.location || "—"}</Td>
      <Td>{d.jobType[job.type]}</Td>
      <Td>
        <StatusBadge tone={isOpen ? "success" : "neutral"}>
          {d.jobStatus[job.status]}
        </StatusBadge>
      </Td>
      <Td className="whitespace-nowrap text-[12px] text-muted-foreground">
        {timeAgo(job.createdAt, locale)}
      </Td>
      {canManage && (
        <Td>
          <div className="flex items-center justify-end gap-1">
            <IconBtn
              title={isOpen ? d.closeJob : d.openJob}
              onClick={() => toggle.mutate()}
              disabled={busy}
            >
              {isOpen ? <Lock className="size-4" /> : <Unlock className="size-4" />}
            </IconBtn>
            <IconBtn title={d.edit} onClick={onEdit} disabled={busy}>
              <Pencil className="size-4" />
            </IconBtn>
            <IconBtn
              title={d.delete}
              tone="danger"
              onClick={() => remove.mutate()}
              disabled={busy}
            >
              <Trash2 className="size-4" />
            </IconBtn>
          </div>
        </Td>
      )}
    </tr>
  );
}

function IconBtn({
  children,
  title,
  onClick,
  disabled,
  tone = "default",
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors disabled:opacity-40",
        tone === "danger"
          ? "hover:bg-destructive-500/10 hover:text-destructive-600"
          : "hover:bg-neutral-100 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
