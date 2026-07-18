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
  Table,
  TableWrap,
  Td,
  Th,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { SERVER_STATUS_TONE } from "@/lib/dashboard/constants";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useServers, useDeleteServer } from "@/hooks/useServers";
import type { ServerDto } from "@/services/servers";
import { serversDict } from "./servers.i18n";
import { ServersModal } from "./servers-modal";

export default function ServersPage() {
  const t = useTranslations("dash");
  const d = useDict(serversDict);
  const L = useLabels();
  const can = useCan();
  const canManage = can(PERMISSIONS.MANAGE_SERVERS);

  const { data, isLoading } = useServers();
  const servers = data?.payload ?? [];
  const remove = useDeleteServer((m) => toast.success(m));

  const [modal, setModal] = useState<{ editing: ServerDto | null } | null>(null);

  const total = servers.length;
  const active = servers.filter((s) => s.status === "ACTIVE").length;

  return (
    <>
      <PageHeader
        title={t("nav.servers")}
        subtitle={d.subtitle}
        action={
          canManage && (
            <Button onClick={() => setModal({ editing: null })}>
              + {d.addServer}
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Spinner /> ...
        </div>
      ) : servers.length === 0 ? (
        <EmptyState>{d.empty}</EmptyState>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-md">
            <StatCard value={total} label={d.statTotal} tone="primary" />
            <StatCard value={active} label={d.statActive} tone="success" />
          </div>

          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>{d.colName}</Th>
                  <Th>{d.colProvider}</Th>
                  <Th>{d.colIp}</Th>
                  <Th>{d.colSpecs}</Th>
                  <Th>{d.colSysAdmin}</Th>
                  <Th>{d.colStatus}</Th>
                  {canManage && <Th className="text-end">{L.actions.edit}</Th>}
                </tr>
              </thead>
              <tbody>
                {servers.map((s) => (
                  <tr
                    key={s.id}
                    onClick={
                      canManage ? () => setModal({ editing: s }) : undefined
                    }
                    className={canManage ? "cursor-pointer" : undefined}
                  >
                    <Td className="font-semibold text-foreground">{s.name}</Td>
                    <Td>{s.provider || L.actions.none}</Td>
                    <Td dir="ltr" className="text-start">
                      {s.ip || L.actions.none}
                    </Td>
                    <Td className="text-muted-foreground">
                      {s.specs || L.actions.none}
                    </Td>
                    <Td>{s.sysAdmin || L.actions.none}</Td>
                    <Td>
                      <StatusBadge tone={SERVER_STATUS_TONE[s.status]}>
                        {L.serverStatus[s.status]}
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
                            remove.mutate(s.id);
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
        </>
      )}

      {modal && (
        <ServersModal editing={modal.editing} onClose={() => setModal(null)} />
      )}
    </>
  );
}
