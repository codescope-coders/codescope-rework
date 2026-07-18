"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Button,
  EmptyState,
  PageHeader,
  Spinner,
  Table,
  TableWrap,
  Td,
  Th,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useReports, useDeleteReport } from "@/hooks/useReports";
import type { ReportDto } from "@/services/reports";
import { reportsDict } from "./reports.i18n";
import { ReportModal } from "./reports-modal";

export default function ReportsPage() {
  const t = useTranslations("dash");
  const d = useDict(reportsDict);
  const L = useLabels();
  const can = useCan();
  const canAll = can(PERMISSIONS.VIEW_REPORTS_ALL);
  const canManage = can(PERMISSIONS.MANAGE_REPORTS);

  const { data, isLoading } = useReports();
  const reports = data?.payload ?? [];
  const remove = useDeleteReport((m) => toast.success(m));

  const [modal, setModal] = useState<{ editing: ReportDto | null } | null>(null);

  return (
    <>
      <PageHeader
        title={t("nav.reports")}
        subtitle={canAll ? d.subtitleAll : d.subtitleOwn}
        action={
          canManage && (
            <Button onClick={() => setModal({ editing: null })}>
              + {d.addReport}
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Spinner /> ...
        </div>
      ) : reports.length === 0 ? (
        <EmptyState>{d.empty}</EmptyState>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>{d.colDate}</Th>
                <Th>{d.colEmployee}</Th>
                <Th>{d.colDone}</Th>
                <Th>{d.colOngoing}</Th>
                <Th>{d.colBlockers}</Th>
                {canManage && <Th className="text-end" />}
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setModal({ editing: r })}
                  className="cursor-pointer"
                >
                  <Td className="whitespace-nowrap">{r.date}</Td>
                  <Td className="whitespace-nowrap">
                    {r.employeeName || L.actions.none}
                  </Td>
                  <Td className="max-w-[220px]">
                    <span className="line-clamp-2 text-muted-foreground">
                      {r.done || L.actions.none}
                    </span>
                  </Td>
                  <Td className="max-w-[220px]">
                    <span className="line-clamp-2 text-muted-foreground">
                      {r.ongoing || L.actions.none}
                    </span>
                  </Td>
                  <Td className="max-w-[220px]">
                    {r.blockers ? (
                      <span className="line-clamp-2 text-destructive-600">
                        {r.blockers}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {L.actions.none}
                      </span>
                    )}
                  </Td>
                  {canManage && (
                    <Td className="text-end">
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={remove.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          remove.mutate(r.id);
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

      {modal && (
        <ReportModal editing={modal.editing} onClose={() => setModal(null)} />
      )}
    </>
  );
}
