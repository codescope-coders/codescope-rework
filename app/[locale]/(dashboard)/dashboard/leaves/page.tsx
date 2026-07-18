"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Button,
  EmptyState,
  PageHeader,
  Spinner,
  StatusBadge,
  Table,
  TableWrap,
  Td,
  Th,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { leaveDays } from "@/lib/dashboard/format";
import { LEAVE_STATUS_TONE } from "@/lib/dashboard/constants";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useMe } from "@/hooks/useMe";
import { useLeaves, useSaveLeave, useDeleteLeave } from "@/hooks/useLeaves";
import type { LeaveDto } from "@/services/leaves";
import { leavesDict } from "./leaves.i18n";
import { LeavesModal } from "./leaves-modal";

export default function LeavesPage() {
  const t = useTranslations("dash");
  const d = useDict(leavesDict);
  const L = useLabels();
  const can = useCan();
  const canAll = can(PERMISSIONS.VIEW_LEAVES_ALL);
  const canApprove = can(PERMISSIONS.APPROVE_LEAVES);
  const canRequest = can(PERMISSIONS.REQUEST_LEAVE);

  const { data: me } = useMe();
  const myId = me?.payload?.id;

  const { data, isLoading } = useLeaves();
  const leaves = data?.payload ?? [];

  const save = useSaveLeave((m) => toast.success(m));
  const remove = useDeleteLeave((m) => toast.success(m));
  const busy = save.isPending || remove.isPending;

  const [modalOpen, setModalOpen] = useState(false);

  const decide = (leave: LeaveDto, decision: "APPROVED" | "REJECTED") =>
    save.mutate({ id: leave.id, data: { decision } });

  const showActions = canApprove || canRequest;

  return (
    <>
      <PageHeader
        title={t("nav.leaves")}
        subtitle={canAll ? d.subtitleAll : d.subtitleOwn}
        action={
          canRequest && (
            <Button onClick={() => setModalOpen(true)}>+ {d.requestLeave}</Button>
          )
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Spinner /> ...
        </div>
      ) : leaves.length === 0 ? (
        <EmptyState>{d.empty}</EmptyState>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>{d.colEmployee}</Th>
                <Th>{d.colType}</Th>
                <Th>{d.colFrom}</Th>
                <Th>{d.colTo}</Th>
                <Th>{d.colDays}</Th>
                <Th>{d.colReason}</Th>
                <Th>{d.colStatus}</Th>
                {showActions && <Th>{d.colActions}</Th>}
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => {
                const isOwner = leave.employeeId === myId;
                const isPending = leave.status === "PENDING";
                return (
                  <tr key={leave.id}>
                    <Td className="font-semibold">
                      {leave.employeeName || L.actions.none}
                    </Td>
                    <Td>
                      {leave.type === "UNPAID" ? (
                        <StatusBadge tone="danger">
                          {L.leaveType.UNPAID}
                        </StatusBadge>
                      ) : (
                        L.leaveType[leave.type]
                      )}
                    </Td>
                    <Td className="whitespace-nowrap">{leave.startDate}</Td>
                    <Td className="whitespace-nowrap">{leave.endDate}</Td>
                    <Td>
                      <span className="font-bold">
                        {leaveDays(leave.startDate, leave.endDate)}
                      </span>
                    </Td>
                    <Td className="max-w-[260px] whitespace-normal">
                      {leave.reason || L.actions.none}
                    </Td>
                    <Td>
                      <StatusBadge tone={LEAVE_STATUS_TONE[leave.status]}>
                        {L.leaveStatus[leave.status]}
                      </StatusBadge>
                    </Td>
                    {showActions && (
                      <Td>
                        {canApprove ? (
                          isPending ? (
                            <div className="flex gap-1.5">
                              <Button
                                variant="success"
                                size="sm"
                                disabled={busy}
                                onClick={() => decide(leave, "APPROVED")}
                              >
                                {L.actions.approve}
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                disabled={busy}
                                onClick={() => decide(leave, "REJECTED")}
                              >
                                {L.actions.reject}
                              </Button>
                            </div>
                          ) : (
                            <span className="whitespace-nowrap text-xs text-muted-foreground">
                              {d.by} {leave.decidedByName || L.actions.none}
                            </span>
                          )
                        ) : isOwner && isPending ? (
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={busy}
                            onClick={() => remove.mutate(leave.id)}
                          >
                            {L.actions.delete}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {L.actions.none}
                          </span>
                        )}
                      </Td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
      )}

      {modalOpen && <LeavesModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
