"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
import { fmtMoney } from "@/lib/dashboard/format";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import {
  usePartners,
  useDeletePartner,
} from "@/hooks/usePartners";
import {
  useDistributions,
  useDeleteDistribution,
} from "@/hooks/useDistributions";
import type { PartnerDto } from "@/services/partners";
import { partnersDict } from "./partners.i18n";
import { PartnerModal } from "./partners-modal";
import { DistributionModal } from "./distribution-modal";

export default function PartnersPage() {
  const t = useTranslations("dash");
  const d = useDict(partnersDict);
  const L = useLabels();
  const locale = useLocale() as "en" | "ar";
  const can = useCan();
  const canManage = can(PERMISSIONS.MANAGE_PARTNERS);
  const canDistribute = can(PERMISSIONS.MANAGE_DISTRIBUTIONS);

  const { data: partnersData, isLoading } = usePartners();
  const partners = partnersData?.payload ?? [];
  const { data: distData } = useDistributions();
  const distributions = distData?.payload ?? [];

  const removePartner = useDeletePartner((m) => toast.success(m));
  const removeDist = useDeleteDistribution((m) => toast.success(m));

  const [partnerModal, setPartnerModal] = useState<{ editing: PartnerDto | null } | null>(null);
  const [distOpen, setDistOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const totalPct = Math.round(
    partners.reduce((s, p) => s + Number(p.percentage || 0), 0),
  );
  const balanced = totalPct === 100;

  return (
    <>
      <PageHeader
        title={t("nav.partners")}
        subtitle={d.subtitle}
        action={
          canManage && (
            <Button onClick={() => setPartnerModal({ editing: null })}>
              + {d.addPartner}
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
          <Spinner /> ...
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard tone="primary" value={partners.length} label={d.partnersTitle} />
            <StatCard
              tone={balanced ? "success" : "danger"}
              value={totalPct + "%"}
              label={d.totalShare}
            />
            <StatCard tone="teal" value={distributions.length} label={d.distributionsTitle} />
          </div>

          {partners.length > 0 && !balanced && (
            <div className="mb-4 rounded-lg bg-destructive-50 px-3 py-2 text-[12px] font-semibold text-destructive-600">
              {d.shareWarn.replace("{sum}", String(totalPct))}
            </div>
          )}

          {/* Partners */}
          {partners.length === 0 ? (
            <EmptyState className="mb-6">{d.empty}</EmptyState>
          ) : (
            <TableWrap className="mb-6">
              <Table>
                <thead>
                  <tr>
                    <Th>{d.colName}</Th>
                    <Th>{d.colPercentage}</Th>
                    <Th>{d.colPhone}</Th>
                    <Th>{d.colJoinDate}</Th>
                    <Th>{d.colReceived}</Th>
                    {canManage && <Th />}
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => canManage && setPartnerModal({ editing: p })}
                      className={canManage ? "cursor-pointer" : undefined}
                    >
                      <Td className="font-bold">{p.name}</Td>
                      <Td>
                        <StatusBadge tone="primary">{p.percentage}%</StatusBadge>
                      </Td>
                      <Td>{p.phone || L.actions.none}</Td>
                      <Td>{p.joinDate || L.actions.none}</Td>
                      <Td className="font-bold text-success-600">
                        {fmtMoney(p.receivedTotal, "IQD", locale)}
                      </Td>
                      {canManage && (
                        <Td onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removePartner.mutate(p.id)}
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

          {/* Distributions */}
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-bold text-foreground">
              {d.distributionsTitle}
            </div>
            {canDistribute && (
              <Button
                disabled={partners.length === 0}
                onClick={() => setDistOpen(true)}
              >
                + {d.newDistribution}
              </Button>
            )}
          </div>

          {distributions.length === 0 ? (
            <EmptyState>{d.distEmpty}</EmptyState>
          ) : (
            <div className="flex flex-col gap-2.5">
              {distributions.map((dist) => {
                const isOpen = expanded === dist.id;
                return (
                  <div key={dist.id} className="surface-raised rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-start"
                        onClick={() => setExpanded(isOpen ? null : dist.id)}
                      >
                        <strong className="text-sm">
                          {d.distTotal}: {fmtMoney(dist.amount, dist.currency, locale)}
                        </strong>
                        <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                          {dist.date}
                          {dist.note ? ` — ${dist.note}` : ""}
                        </div>
                      </button>
                      {canDistribute && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeDist.mutate(dist.id)}
                        >
                          {d.deleteDistribution}
                        </Button>
                      )}
                    </div>
                    {isOpen && (
                      <div className="mt-3 border-t border-border pt-3">
                        {dist.shares.length === 0 ? (
                          <p className="text-center text-[12px] text-muted-foreground">
                            {d.noShares}
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <thead>
                                <tr>
                                  <Th>{d.shareName}</Th>
                                  <Th>{d.sharePercentage}</Th>
                                  <Th className="text-end">{d.shareAmount}</Th>
                                </tr>
                              </thead>
                              <tbody>
                                {dist.shares.map((s) => (
                                  <tr key={s.id}>
                                    <Td className="font-semibold">{s.name}</Td>
                                    <Td>{s.percentage}%</Td>
                                    <Td className="text-end tabular-nums font-bold">
                                      {fmtMoney(s.amount, dist.currency, locale)}
                                    </Td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {partnerModal && (
        <PartnerModal editing={partnerModal.editing} onClose={() => setPartnerModal(null)} />
      )}
      {distOpen && <DistributionModal onClose={() => setDistOpen(false)} />}
    </>
  );
}
