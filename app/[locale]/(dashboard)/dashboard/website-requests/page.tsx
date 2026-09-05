"use client";

import { useState } from "react";
import {
  EmptyState,
  PageHeader,
  Spinner,
  StatCard,
  StatusBadge,
  SubTabs,
  Table,
  TableWrap,
  Td,
  Th,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { useWebsiteRequests } from "@/hooks/useWebsiteRequests";
import type { WebsiteRequestDto } from "@/services/website-requests";
import { websiteRequestsDict } from "./website-requests.i18n";
import {
  REQUEST_PACKAGE_TONE,
  REQUEST_STATUSES,
  REQUEST_STATUS_TONE,
  fmtReceived,
} from "./website-requests.constants";
import { WebsiteRequestModal } from "./website-requests-modal";

export default function WebsiteRequestsPage() {
  const d = useDict(websiteRequestsDict);
  const L = useLabels();

  const { data, isLoading } = useWebsiteRequests();
  const requests = data?.payload ?? [];

  const [filter, setFilter] = useState<string>("NEW");
  const [editing, setEditing] = useState<WebsiteRequestDto | null>(null);

  const statusTabs = [
    { id: "all", label: L.actions.all },
    ...REQUEST_STATUSES.map((s) => ({
      id: s,
      label: d[`status${s}` as const],
    })),
  ];

  const newCount = requests.filter((r) => r.status === "NEW").length;
  const filtered =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <>
      <PageHeader title={d.title} subtitle={d.subtitle} />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Spinner /> ...
        </div>
      ) : requests.length === 0 ? (
        <EmptyState>{d.empty}</EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {/* The `new` count lives here rather than on the sidebar item: the
              nav config declares a `badge` field but nothing in the sidebar
              renders one, and inventing that machinery is outside this
              module's business. */}
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard value={newCount} label={d.newRequests} tone="warning" />
          </div>

          <SubTabs tabs={statusTabs} value={filter} onChange={setFilter} />

          {filtered.length === 0 ? (
            <EmptyState>{d.emptyFiltered}</EmptyState>
          ) : (
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>{d.hDate}</Th>
                    <Th>{d.hPackage}</Th>
                    <Th>{d.hWho}</Th>
                    <Th>{d.hContact}</Th>
                    <Th>{d.hLang}</Th>
                    <Th>{d.hMessage}</Th>
                    <Th>{d.hStatus}</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setEditing(r)}
                      className="cursor-pointer"
                    >
                      <Td className="whitespace-nowrap">
                        {fmtReceived(r.createdAt)}
                      </Td>
                      <Td>
                        {r.kind === "CONTACT" ? (
                          <StatusBadge tone="neutral">
                            {d.kindCONTACT}
                          </StatusBadge>
                        ) : r.package ? (
                          <StatusBadge tone={REQUEST_PACKAGE_TONE[r.package]}>
                            {L.packageTier[r.package]}
                          </StatusBadge>
                        ) : (
                          <StatusBadge tone="neutral">{d.notSure}</StatusBadge>
                        )}
                      </Td>
                      {/* `dir="auto"`: this console is Arabic-first, so a
                          Latin agency name sits inside an RTL cell and its
                          trailing period renders at the wrong end ("Golden
                          Trips Co." → ".Golden Trips Co"). Letting each string
                          pick its own direction from its first strong
                          character fixes both directions at once. */}
                      <Td>
                        <div dir="auto" className="font-semibold text-foreground">
                          {r.name}
                        </div>
                        {r.agency && (
                          <div dir="auto" className="text-[11px] text-muted-foreground">
                            {r.agency}
                          </div>
                        )}
                      </Td>
                      <Td>
                        {/* `dir="ltr"` + `text-start`: an email and a +964
                            number are Latin-and-digits, and left to the RTL
                            paragraph direction the leading `+` jumps to the
                            wrong end of the number. */}
                        <div
                          dir="ltr"
                          className="text-start text-[12px] text-foreground"
                        >
                          {r.email}
                        </div>
                        {r.phone && (
                          <div
                            dir="ltr"
                            className="text-start text-[11px] text-muted-foreground"
                          >
                            {r.phone}
                          </div>
                        )}
                      </Td>
                      <Td>
                        <span className="rounded-md border border-border px-1.5 py-0.5 text-[11px] font-semibold uppercase text-muted-foreground">
                          {r.locale}
                        </span>
                      </Td>
                      {/* The preview takes its direction from the TEXT, not
                          from the console and not from `locale`. Left to the
                          console's direction, an English message in the Arabic
                          console renders ".Exploring options" — which reads as
                          corruption on the operator's own screen. And `locale`
                          is the wrong key too: it records which site the
                          visitor was on, and someone browsing in Arabic may
                          perfectly well write in English (or the reverse), so
                          only the string itself knows which way it runs. The
                          language to REPLY in is what the Language chip is
                          for. */}
                      <Td className="max-w-[22rem]">
                        <span
                          dir="auto"
                          className="line-clamp-2 block text-start text-[12px] leading-relaxed text-muted-foreground"
                        >
                          {r.message}
                        </span>
                      </Td>
                      <Td>
                        <StatusBadge tone={REQUEST_STATUS_TONE[r.status]}>
                          {d[`status${r.status}` as const]}
                        </StatusBadge>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          )}
        </div>
      )}

      {editing && (
        <WebsiteRequestModal
          request={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
