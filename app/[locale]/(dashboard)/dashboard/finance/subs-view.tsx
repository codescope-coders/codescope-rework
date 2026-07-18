"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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
  type SubTab,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import {
  PACKAGE_TIERS,
  PACKAGE_TONE,
  SUBSCRIPTION_STATUS_TONE,
} from "@/lib/dashboard/constants";
import {
  currentMonthKey,
  daysUntil,
  fmtMoney,
  type Currency,
  type Locale,
} from "@/lib/dashboard/format";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useSubscriptions, useDeleteSubscription } from "@/hooks/useSubscriptions";
import type { SubscriptionDto } from "@/services/subscriptions";
import { subsDict } from "./subs.i18n";
import { SubsModal } from "./subs-modal";

export function SubscriptionsView() {
  const t = useTranslations("dash");
  const d = useDict(subsDict);
  const L = useLabels();
  const locale = useLocale() as Locale;
  const can = useCan();
  const canManage = can(PERMISSIONS.MANAGE_SUBSCRIPTIONS);

  const { data, isLoading } = useSubscriptions();
  const subs = data?.payload ?? [];
  const remove = useDeleteSubscription((m) => toast.success(m));

  const [pkg, setPkg] = useState<string>("all");
  const [modal, setModal] = useState<{ editing: SubscriptionDto | null } | null>(
    null,
  );

  // ── Stats ───────────────────────────────────────────────────────────────
  const total = subs.length;
  const active = subs.filter((s) => s.status === "ACTIVE").length;
  const pending = subs.filter((s) => s.status === "PENDING_ACTIVATION").length;
  const dueSoon = subs.filter((s) => {
    if (s.status !== "ACTIVE") return false;
    const n = daysUntil(s.nextDue);
    return n !== null && n >= 0 && n <= 7;
  }).length;
  const newThisMonth = subs.filter(
    (s) => (s.startDate || "").slice(0, 7) === currentMonthKey(),
  ).length;

  // ── Package filter ──────────────────────────────────────────────────────
  const tabs: SubTab[] = [
    { id: "all", label: L.actions.all },
    ...PACKAGE_TIERS.map((p) => ({ id: p, label: L.packageTier[p] })),
  ];
  const rows =
    pkg === "all" ? subs : subs.filter((s) => s.package === pkg);

  const dueHint = (sub: SubscriptionDto) => {
    const n = daysUntil(sub.nextDue);
    if (n === null) return null;
    if (n === 0) return d.dueToday;
    if (n > 0) return d.dueIn.replace("{n}", String(n));
    return d.overdueBy.replace("{n}", String(Math.abs(n)));
  };

  return (
    <>
      <PageHeader
        title={t("nav.finance_subs")}
        subtitle={d.subtitle}
        action={
          canManage && (
            <Button onClick={() => setModal({ editing: null })}>
              + {d.addSub}
            </Button>
          )
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard value={total} label={d.stTotal} tone="primary" />
        <StatCard value={active} label={d.stActive} tone="success" />
        <StatCard value={pending} label={d.stPending} tone="warning" />
        <StatCard value={dueSoon} label={d.stDueSoon} tone="danger" />
        <StatCard value={newThisMonth} label={d.stNewMonth} tone="teal" />
      </div>

      <SubTabs tabs={tabs} value={pkg} onChange={setPkg} className="mb-4" />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Spinner /> ...
        </div>
      ) : rows.length === 0 ? (
        <EmptyState>{d.empty}</EmptyState>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>{d.colCompany}</Th>
                <Th>{d.colSystem}</Th>
                <Th>{d.colPackage}</Th>
                <Th>{d.colAmount}</Th>
                <Th>{d.colCycle}</Th>
                <Th>{d.colNextDue}</Th>
                <Th>{d.colStatus}</Th>
                {canManage && <Th className="text-end">{d.colActions}</Th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const n = daysUntil(s.nextDue);
                const danger =
                  s.status === "ACTIVE" && n !== null && n <= 7;
                return (
                  <tr
                    key={s.id}
                    onClick={() => setModal({ editing: s })}
                    className="cursor-pointer"
                  >
                    <Td>
                      <div className="font-bold text-foreground">
                        {s.company}
                      </div>
                      {s.phone && (
                        <div className="text-[11.5px] text-muted-foreground">
                          {s.phone}
                        </div>
                      )}
                    </Td>
                    <Td className="text-muted-foreground">
                      {s.systemName || L.actions.none}
                    </Td>
                    <Td>
                      <StatusBadge tone={PACKAGE_TONE[s.package]}>
                        {L.packageTier[s.package]}
                      </StatusBadge>
                    </Td>
                    <Td className="whitespace-nowrap tabular-nums">
                      {s.amount == null
                        ? L.actions.none
                        : fmtMoney(s.amount, s.currency as Currency, locale)}
                    </Td>
                    <Td className="text-muted-foreground">
                      {L.billingCycle[s.cycle]}
                    </Td>
                    <Td
                      className={
                        danger ? "text-destructive-600" : "text-foreground"
                      }
                    >
                      <div className="whitespace-nowrap tabular-nums">
                        {s.nextDue || L.actions.none}
                      </div>
                      {dueHint(s) && (
                        <div
                          className={
                            danger
                              ? "text-[11px] font-semibold text-destructive-600"
                              : "text-[11px] text-muted-foreground"
                          }
                        >
                          {dueHint(s)}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <StatusBadge tone={SUBSCRIPTION_STATUS_TONE[s.status]}>
                        {L.subscriptionStatus[s.status]}
                      </StatusBadge>
                    </Td>
                    {canManage && (
                      <Td className="text-end">
                        <Button
                          variant="danger"
                          size="icon-sm"
                          disabled={remove.isPending}
                          aria-label={L.actions.delete}
                          onClick={(e) => {
                            e.stopPropagation();
                            remove.mutate(s.id);
                          }}
                        >
                          <Trash2 className="size-4" />
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
        <SubsModal editing={modal.editing} onClose={() => setModal(null)} />
      )}
    </>
  );
}
