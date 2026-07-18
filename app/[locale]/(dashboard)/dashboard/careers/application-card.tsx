"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  Flag,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquare,
  MoreVertical,
  Phone,
  Trash2,
  X,
} from "lucide-react";
import { useLocale } from "next-intl";
import { StatusBadge } from "@/components/dashboard/ui";
import { HeaderMenu } from "@/components/dashboard/header/header-menu";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/helpers/date";
import { displayUrl } from "@/helpers/links";
import { useDict } from "@/lib/dashboard/useDict";
import type { Tone } from "@/lib/dashboard/constants";
import {
  useDeleteApplication,
  useUpdateApplication,
} from "@/hooks/useApplications";
import type { ApplicationDto, ApplicationStatus } from "@/services/applications";
import { careersDict } from "./careers.i18n";

const STATUS_TONE: Record<ApplicationStatus, Tone> = {
  PENDING: "warning",
  APPROVED: "success",
  INTERVIEWED: "info",
  REJECTED: "danger",
};

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-[13px] font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

export function ApplicationCard({ application }: { application: ApplicationDto }) {
  const d = useDict(careersDict);
  const locale = useLocale() as "en" | "ar";
  const update = useUpdateApplication(application.id);
  const remove = useDeleteApplication(application.id);
  const busy = update.isPending || remove.isPending;

  const cvUrl = application.cvUrl
    ? application.cvUrl.startsWith("/uploads/")
      ? `/api${application.cvUrl}`
      : application.cvUrl
    : "";

  const setStatus = (status: ApplicationStatus) => update.mutate({ status });

  const dob = application.date_of_birth
    ? new Date(application.date_of_birth).toLocaleDateString(locale)
    : null;
  const avail = application.availabilityToStart
    ? new Date(application.availabilityToStart).toLocaleDateString(locale)
    : d.immediately;

  return (
    <div
      className={cn(
        "surface-raised flex flex-col overflow-hidden rounded-2xl border border-border transition-opacity",
        busy && "pointer-events-none opacity-50",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border/70 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-bold text-foreground">
              {application.fullName}
            </h3>
            <StatusBadge tone={STATUS_TONE[application.status] ?? "neutral"}>
              {d.appStatus[application.status]}
            </StatusBadge>
          </div>
          <a
            href={`mailto:${application.email}`}
            className="mt-0.5 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary"
          >
            <Mail className="size-3.5" />
            <span className="truncate">{application.email}</span>
          </a>
        </div>

        <HeaderMenu
          width={190}
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-label="actions"
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-neutral-100 hover:text-foreground",
                open && "bg-neutral-100 text-foreground",
              )}
            >
              <MoreVertical className="size-4" />
            </button>
          )}
        >
          {(close) => (
            <div className="p-1.5">
              {application.status !== "APPROVED" && (
                <MenuItem
                  icon={Check}
                  label={d.accept}
                  className="hover:bg-success-500/10 hover:text-success-700"
                  onClick={() => {
                    setStatus("APPROVED");
                    close();
                  }}
                />
              )}
              {application.status !== "INTERVIEWED" && (
                <MenuItem
                  icon={MessageSquare}
                  label={d.interviewed}
                  className="hover:bg-info-500/10 hover:text-info-700"
                  onClick={() => {
                    setStatus("INTERVIEWED");
                    close();
                  }}
                />
              )}
              {application.status !== "REJECTED" && (
                <MenuItem
                  icon={X}
                  label={d.reject}
                  className="hover:bg-destructive-500/10 hover:text-destructive-600"
                  onClick={() => {
                    setStatus("REJECTED");
                    close();
                  }}
                />
              )}
              <div className="my-1 h-px bg-border" />
              <MenuItem
                icon={Trash2}
                label={d.deleteApp}
                className="text-destructive-600 hover:bg-destructive-500/10"
                onClick={() => {
                  remove.mutate();
                  close();
                }}
              />
            </div>
          )}
        </HeaderMenu>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 p-4 sm:grid-cols-2">
        {application.job?.position && (
          <Detail icon={Briefcase} label={d.aPosition} value={application.job.position} />
        )}
        {application.phoneNumber && (
          <Detail icon={Phone} label={d.aPhone} value={application.phoneNumber} />
        )}
        {application.currentCity && (
          <Detail icon={MapPin} label={d.aCity} value={application.currentCity} />
        )}
        {application.nationality && (
          <Detail icon={Flag} label={d.aNationality} value={application.nationality} />
        )}
        {dob && <Detail icon={Calendar} label={d.aDob} value={dob} />}
        <Detail icon={Calendar} label={d.aAvailability} value={avail} />
        {application.lastJobTitle && (
          <Detail icon={Briefcase} label={d.aLastJob} value={application.lastJobTitle} />
        )}
        {application.yearsOfExperience != null && (
          <Detail icon={Clock} label={d.aExperience} value={application.yearsOfExperience} />
        )}
        {application.expectedSalary && (
          <Detail
            icon={DollarSign}
            label={d.aExpectedSalary}
            value={d.expectedSalary[application.expectedSalary]}
          />
        )}
        {application.highestEducationLevel && (
          <Detail
            icon={GraduationCap}
            label={d.aEducation}
            value={d.educationLevel[application.highestEducationLevel]}
          />
        )}
        {application.fieldOfStudy && (
          <Detail icon={BookOpen} label={d.aField} value={application.fieldOfStudy} />
        )}
        {application.graduationYear && (
          <Detail icon={Calendar} label={d.aGraduation} value={application.graduationYear} />
        )}
      </div>

      {/* Links */}
      {application.links?.length > 0 && (
        <div className="px-4 pb-3">
          <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            {d.aLinks}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {application.links.map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-muted/50 px-2 py-1 text-[12px] text-primary transition-colors hover:bg-primary/10 hover:underline"
              >
                {displayUrl(link)}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Calendar className="size-3.5" />
          {d.applied} {timeAgo(application.createdAt, locale)}
        </span>
        {cvUrl && (
          <HeaderMenu
            width={190}
            trigger={({ open, toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-neutral-100",
                  open && "bg-neutral-100",
                )}
              >
                <FileText className="size-3.5" />
                {d.cv}
              </button>
            )}
          >
            {(close) => (
              <div className="p-1.5">
                <MenuItem
                  icon={Eye}
                  label={d.viewCv}
                  onClick={() => {
                    window.open(cvUrl, "_blank");
                    close();
                  }}
                />
                <a
                  href={cvUrl}
                  download
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-foreground transition-colors hover:bg-neutral-100"
                >
                  <Download className="size-4" />
                  {d.downloadCv}
                </a>
              </div>
            )}
          </HeaderMenu>
        )}
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-[13px] text-foreground transition-colors hover:bg-neutral-100",
        className,
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
