"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Button,
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
import {
  TICKET_STATUSES,
  TICKET_STATUS_TONE,
  TICKET_PRIORITY_TONE,
} from "@/lib/dashboard/constants";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useTickets, useDeleteTicket } from "@/hooks/useTickets";
import type { TicketDto } from "@/services/support";
import { supportDict } from "./support.i18n";
import { SupportModal } from "./support-modal";

export default function SupportPage() {
  const t = useTranslations("dash");
  const d = useDict(supportDict);
  const L = useLabels();
  const can = useCan();
  const canAll = can(PERMISSIONS.VIEW_SUPPORT_ALL);
  const canManage = can(PERMISSIONS.MANAGE_SUPPORT);

  const { data, isLoading } = useTickets();
  const tickets = data?.payload ?? [];
  const remove = useDeleteTicket((m) => toast.success(m));

  const [filter, setFilter] = useState<string>("all");
  const [modal, setModal] = useState<{ editing: TicketDto | null } | null>(null);

  const statusTabs = [
    { id: "all", label: L.actions.all },
    ...TICKET_STATUSES.map((s) => ({ id: s, label: L.ticketStatus[s] })),
  ];

  const openCount = tickets.filter((tk) => tk.status === "OPEN").length;
  const filtered =
    filter === "all" ? tickets : tickets.filter((tk) => tk.status === filter);

  return (
    <>
      <PageHeader
        title={t("nav.support")}
        subtitle={canAll ? d.subtitleAll : d.subtitleOwn}
        action={
          canManage && (
            <Button onClick={() => setModal({ editing: null })}>
              + {d.addTicket}
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Spinner /> ...
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState>{d.empty}</EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard value={openCount} label={d.openTickets} tone="warning" />
          </div>

          <SubTabs tabs={statusTabs} value={filter} onChange={setFilter} />

          {filtered.length === 0 ? (
            <EmptyState>{d.empty}</EmptyState>
          ) : (
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>{d.hDate}</Th>
                    <Th>{d.hCompany}</Th>
                    <Th>{d.hSubject}</Th>
                    <Th>{d.hPriority}</Th>
                    <Th>{d.hAssignee}</Th>
                    <Th>{d.hStatus}</Th>
                    {canManage && <Th className="text-end">{d.hActions}</Th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tk) => (
                    <tr
                      key={tk.id}
                      onClick={() => setModal({ editing: tk })}
                      className="cursor-pointer"
                    >
                      <Td className="whitespace-nowrap">{tk.date}</Td>
                      <Td>
                        <div className="font-semibold text-foreground">
                          {tk.company}
                        </div>
                        {tk.phone && (
                          <div className="text-[11px] text-muted-foreground">
                            {tk.phone}
                          </div>
                        )}
                      </Td>
                      <Td>{tk.subject}</Td>
                      <Td>
                        <StatusBadge tone={TICKET_PRIORITY_TONE[tk.priority]}>
                          {L.ticketPriority[tk.priority]}
                        </StatusBadge>
                      </Td>
                      <Td>{tk.assignedToName || L.actions.none}</Td>
                      <Td>
                        <StatusBadge tone={TICKET_STATUS_TONE[tk.status]}>
                          {L.ticketStatus[tk.status]}
                        </StatusBadge>
                      </Td>
                      {canManage && (
                        <Td className="text-end">
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={remove.isPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              remove.mutate(tk.id);
                            }}
                          >
                            {L.actions.delete}
                          </Button>
                        </Td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          )}
        </div>
      )}

      {modal && (
        <SupportModal editing={modal.editing} onClose={() => setModal(null)} />
      )}
    </>
  );
}
