"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import {
  Button,
  EmptyState,
  Spinner,
  StatusBadge,
  Table,
  TableWrap,
  Td,
  Th,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { fmtMoney } from "@/lib/dashboard/format";
import { REQUEST_STATUS_TONE } from "@/lib/dashboard/constants";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useMe } from "@/hooks/useMe";
import {
  useRequests,
  useDecideRequest,
  useDeleteRequest,
} from "@/hooks/useRequests";
import { requestsDict } from "./requests.i18n";
import { RequestModal } from "./requests-modal";

export function RequestsView() {
  const d = useDict(requestsDict);
  const L = useLabels();
  const locale = useLocale() as "en" | "ar";
  const can = useCan();
  const canApprove = can(PERMISSIONS.APPROVE_SPEND_REQUESTS);
  const canCreate = can(PERMISSIONS.CREATE_SPEND_REQUEST);

  const { data: me } = useMe();
  const myId = me?.payload?.id;

  const { data, isLoading } = useRequests();
  const requests = data?.payload ?? [];

  const decide = useDecideRequest((m) => toast.success(m));
  const remove = useDeleteRequest((m) => toast.success(m));
  const busy = decide.isPending || remove.isPending;

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">
          {canApprove ? d.subtitleAll : d.subtitleOwn}
        </p>
        {canCreate && (
          <Button onClick={() => setModalOpen(true)}>+ {d.newRequest}</Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Spinner /> ...
        </div>
      ) : requests.length === 0 ? (
        <EmptyState>{d.empty}</EmptyState>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>{d.colDate}</Th>
                <Th>{d.colRequestedBy}</Th>
                <Th>{d.colReason}</Th>
                <Th>{d.colAmount}</Th>
                <Th>{d.colStatus}</Th>
                <Th>{d.colActions}</Th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const isOwner = r.requestedById === myId;
                const isPending = r.status === "PENDING";
                return (
                  <tr key={r.id}>
                    <Td className="whitespace-nowrap">{r.date}</Td>
                    <Td className="font-semibold">
                      {r.requestedByName || L.actions.none}
                    </Td>
                    <Td className="max-w-[260px] whitespace-normal">
                      {r.reason || L.actions.none}
                    </Td>
                    <Td className="whitespace-nowrap font-bold">
                      {fmtMoney(r.amount, r.currency, locale)}
                    </Td>
                    <Td>
                      <StatusBadge tone={REQUEST_STATUS_TONE[r.status]}>
                        {L.requestStatus[r.status]}
                      </StatusBadge>
                    </Td>
                    <Td>
                      {canApprove ? (
                        isPending ? (
                          <div className="flex gap-1.5">
                            <Button
                              variant="success"
                              size="sm"
                              disabled={busy}
                              onClick={() =>
                                decide.mutate({ id: r.id, decision: "PAID" })
                              }
                            >
                              {L.actions.approve}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={busy}
                              onClick={() =>
                                decide.mutate({ id: r.id, decision: "REJECTED" })
                              }
                            >
                              {L.actions.reject}
                            </Button>
                          </div>
                        ) : (
                          <span className="whitespace-nowrap text-xs text-muted-foreground">
                            {r.decidedDate || L.actions.none}
                          </span>
                        )
                      ) : isOwner && isPending ? (
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={busy}
                          onClick={() => remove.mutate(r.id)}
                        >
                          {L.actions.delete}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {L.actions.none}
                        </span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
      )}

      {modalOpen && <RequestModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
