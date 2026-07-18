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
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useMe } from "@/hooks/useMe";
import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import type { UserDto } from "@/services/users";
import { usersDict } from "./users.i18n";
import { UsersModal } from "./users-modal";

export default function UsersPage() {
  const t = useTranslations("dash");
  const d = useDict(usersDict);
  const L = useLabels();
  const can = useCan();
  const canManage = can(PERMISSIONS.MANAGE_USERS);

  const { data: me } = useMe();
  const { data, isLoading } = useUsers();
  const users = data?.payload ?? [];
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  const remove = useDeleteUser((m) => toast.success(m));

  const [modal, setModal] = useState<{ editing: UserDto | null } | null>(null);

  return (
    <>
      <PageHeader
        title={t("nav.users")}
        subtitle={d.subtitle}
        action={
          canManage && (
            <Button onClick={() => setModal({ editing: null })}>
              + {d.newUser}
            </Button>
          )
        }
      />

      <p className="mb-4 rounded-lg bg-primary/10 px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
        {d.otpNote}
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Spinner /> ...
        </div>
      ) : users.length === 0 ? (
        <EmptyState>{d.empty}</EmptyState>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>{d.thName}</Th>
                <Th>{d.thRole}</Th>
                <Th>{d.thEmail}</Th>
                {canManage && <Th className="text-end">{d.thActions}</Th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = me?.payload?.id === u.id;
                const lastAdmin = u.role === "ADMIN" && adminCount <= 1;
                return (
                  <tr
                    key={u.id}
                    className={canManage ? "cursor-pointer" : undefined}
                    onClick={() => canManage && setModal({ editing: u })}
                  >
                    <Td>
                      <span className="font-semibold text-foreground">
                        {u.name || L.actions.none}
                      </span>
                      {isSelf && (
                        <span className="ms-1.5 text-[11px] text-muted-foreground">
                          {d.you}
                        </span>
                      )}
                    </Td>
                    <Td>
                      <StatusBadge tone="primary">{L.role[u.role]}</StatusBadge>
                    </Td>
                    <Td className="text-muted-foreground">{u.email}</Td>
                    {canManage && (
                      <Td className="text-end">
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={lastAdmin || remove.isPending}
                          title={lastAdmin ? d.lastAdmin : undefined}
                          onClick={(e) => {
                            e.stopPropagation();
                            remove.mutate(u.id);
                          }}
                        >
                          {L.actions.delete}
                        </Button>
                      </Td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
      )}

      {modal && (
        <UsersModal editing={modal.editing} onClose={() => setModal(null)} />
      )}
    </>
  );
}
