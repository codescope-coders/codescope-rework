"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Button,
  Field,
  Modal,
  NativeSelect,
  StatusBadge,
  Textarea,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useSaveWebsiteRequest } from "@/hooks/useWebsiteRequests";
import type {
  WebsiteRequestDto,
  WebsiteRequestStatus,
} from "@/services/website-requests";
import { websiteRequestsDict } from "./website-requests.i18n";
import {
  REQUEST_PACKAGE_TONE,
  REQUEST_STATUSES,
  REQUEST_STATUS_TONE,
  fmtReceived,
} from "./website-requests.constants";

/** One read-only fact from the submission. */
function Fact({
  label,
  value,
  ltr,
  href,
}: {
  label: string;
  value: string;
  ltr?: boolean;
  href?: string;
}) {
  // `ltr` pins the machine-readable facts (email / phone / timestamp) that are
  // written left-to-right in every language; everything else gets `auto`, so a
  // Latin agency name in this Arabic-first console keeps its trailing period on
  // the right end.
  const dir = ltr ? "ltr" : "auto";
  const body = href ? (
    <a
      href={href}
      className="text-primary underline-offset-2 hover:underline"
      dir={dir}
    >
      {value}
    </a>
  ) : (
    <span dir={dir}>{value}</span>
  );
  return (
    <div className="min-w-0">
      <span className="mb-1 block text-xs font-bold text-muted-foreground">
        {label}
      </span>
      <div
        className={`break-words text-sm text-foreground ${ltr ? "text-start" : ""}`}
      >
        {body}
      </div>
    </div>
  );
}

/**
 * The request as it arrived (read-only) plus the two things staff own: its
 * status and an internal note. The visitor's own words are never editable —
 * see `services/website-requests.ts`.
 */
export function WebsiteRequestModal({
  request,
  onClose,
}: {
  request: WebsiteRequestDto;
  onClose: () => void;
}) {
  const d = useDict(websiteRequestsDict);
  const L = useLabels();
  const can = useCan();
  const canManage = can(PERMISSIONS.MANAGE_WEBSITE_REQUESTS);

  const [status, setStatus] = useState<WebsiteRequestStatus>(request.status);
  const [note, setNote] = useState(request.note ?? "");

  const save = useSaveWebsiteRequest((msg) => {
    toast.success(msg);
    onClose();
  });

  const dirty = status !== request.status || note !== (request.note ?? "");

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={
        <span className="flex flex-wrap items-center gap-2">
          {d.detailTitle}
          {request.kind === "CONTACT" ? (
            <StatusBadge tone="neutral">{d.kindCONTACT}</StatusBadge>
          ) : (
            <StatusBadge
              tone={
                request.package ? REQUEST_PACKAGE_TONE[request.package] : "neutral"
              }
            >
              {request.package ? L.packageTier[request.package] : d.notSure}
            </StatusBadge>
          )}
          <StatusBadge tone={REQUEST_STATUS_TONE[request.status]}>
            {d[`status${request.status}` as const]}
          </StatusBadge>
        </span>
      }
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={save.isPending}>
            {L.actions.cancel}
          </Button>
          {canManage && (
            <Button
              size="sm"
              disabled={save.isPending || !dirty}
              onClick={() =>
                save.mutate({
                  id: request.id,
                  data: { status, note: note.trim() || null },
                })
              }
            >
              {L.actions.save}
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* One column on a phone: at 390 the modal is ~358px wide, and two
            columns of facts there wraps an email onto four lines. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Fact label={d.fName} value={request.name} />
          <Fact label={d.fAgency} value={request.agency || d.noAgency} />
          <Fact
            label={d.fEmail}
            value={request.email}
            ltr
            href={`mailto:${request.email}`}
          />
          <Fact
            label={d.fPhone}
            value={request.phone || d.noAgency}
            ltr
            href={request.phone ? `tel:${request.phone.replace(/[^\d+]/g, "")}` : undefined}
          />
          <Fact
            label={d.fLanguage}
            value={request.locale === "ar" ? d.langAr : d.langEn}
          />
          <Fact label={d.fReceived} value={fmtReceived(request.createdAt)} ltr />
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
            {d.fMessage}
          </span>
          {/* `auto`, not the console's direction and not `request.locale`:
              the visitor may have written Arabic on the English site or the
              reverse, so only the text itself knows which way it runs. Which
              language to REPLY in is what the Language fact and the hint below
              carry. */}
          <p
            dir="auto"
            className="whitespace-pre-wrap rounded-xl border border-border bg-muted/40 p-3 text-[13px] leading-relaxed text-foreground"
          >
            {request.message}
          </p>
          <span className="mt-1 block text-[11px] text-muted-foreground">
            {d.replyHint}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={d.fStatus}>
            <NativeSelect
              value={status}
              disabled={!canManage}
              onChange={(e) =>
                setStatus(e.target.value as WebsiteRequestStatus)
              }
            >
              {REQUEST_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {d[`status${s}` as const]}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>

        <Field label={d.fNote}>
          {/* `dir="auto"` for the same reason the message has it: an agent in
              the Arabic console often types the note in English. */}
          <Textarea
            dir="auto"
            value={note}
            disabled={!canManage}
            placeholder={d.notePh}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
