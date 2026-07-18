"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
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
import { fmtMoney, type Locale } from "@/lib/dashboard/format";
import {
  CURRENCIES,
  LEDGER_TYPE_TONE,
  type Currency,
} from "@/lib/dashboard/constants";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useLedger } from "@/hooks/useLedger";
import type { LedgerEntryDto } from "@/services/ledger";
import { ledgerDict } from "./ledger.i18n";
import { LedgerModal } from "./ledger-modal";

type Row = LedgerEntryDto & { balance: number; system: boolean };

export function LedgerView() {
  const t = useTranslations("dash");
  const d = useDict(ledgerDict);
  const L = useLabels();
  const locale = useLocale() as Locale;
  const can = useCan();
  const canManage = can(PERMISSIONS.MANAGE_LEDGER);

  const { data, isLoading } = useLedger();
  const entries = useMemo(() => data?.payload ?? [], [data]);

  const [currency, setCurrency] = useState<Currency>("IQD");
  const [modal, setModal] = useState<{ editing: LedgerEntryDto | null } | null>(
    null,
  );

  // Running balance is rolled forward over the date-asc order the API returns,
  // per selected currency, then displayed newest-first.
  const { rows, income, expense, net } = useMemo(() => {
    let balance = 0;
    let inc = 0;
    let exp = 0;
    const acc: Row[] = [];
    for (const e of entries) {
      if (e.currency !== currency) continue;
      const amt = Number(e.amount || 0);
      if (e.type === "INCOME") {
        balance += amt;
        inc += amt;
      } else {
        balance -= amt;
        exp += amt;
      }
      acc.push({
        ...e,
        balance,
        system:
          e.requestId != null || e.sheetId != null || e.distributionId != null,
      });
    }
    acc.reverse(); // newest first
    return { rows: acc, income: inc, expense: exp, net: inc - exp };
  }, [entries, currency]);

  return (
    <>
      <PageHeader
        title={t("nav.finance_ledger")}
        subtitle={d.subtitle}
        action={
          canManage && (
            <Button onClick={() => setModal({ editing: null })}>
              + {d.addEntry}
            </Button>
          )
        }
      />

      <div className="mb-4 inline-flex rounded-lg border border-border bg-muted p-0.5">
        {CURRENCIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCurrency(c)}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-xs font-bold transition-colors",
              currency === c
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {L.currency[c]}
          </button>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          tone="success"
          label={d.statIncome}
          value={fmtMoney(income, currency, locale)}
        />
        <StatCard
          tone="danger"
          label={d.statExpense}
          value={fmtMoney(expense, currency, locale)}
        />
        <StatCard
          tone={net < 0 ? "danger" : "primary"}
          label={d.statNet}
          value={fmtMoney(net, currency, locale)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Spinner /> ...
        </div>
      ) : entries.length === 0 ? (
        <EmptyState>{d.empty}</EmptyState>
      ) : rows.length === 0 ? (
        <EmptyState>{d.emptyCurrency}</EmptyState>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>{d.colDate}</Th>
                <Th>{d.colType}</Th>
                <Th>{d.colCategory}</Th>
                <Th className="text-end">{d.colAmount}</Th>
                <Th className="text-end">{d.colBalance}</Th>
                <Th>{d.colNotes}</Th>
                <Th className="text-end">{d.colActions}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td className="whitespace-nowrap tabular-nums">{r.date}</Td>
                  <Td>
                    <StatusBadge tone={LEDGER_TYPE_TONE[r.type]}>
                      {L.ledgerType[r.type]}
                    </StatusBadge>
                  </Td>
                  <Td>{r.category || L.actions.none}</Td>
                  <Td
                    className={cn(
                      "whitespace-nowrap text-end font-bold tabular-nums",
                      r.type === "INCOME"
                        ? "text-success-600"
                        : "text-destructive-600",
                    )}
                  >
                    {r.type === "INCOME" ? "+ " : "− "}
                    {fmtMoney(r.amount, currency, locale)}
                  </Td>
                  <Td className="whitespace-nowrap text-end tabular-nums text-muted-foreground">
                    {fmtMoney(r.balance, currency, locale)}
                  </Td>
                  <Td className="max-w-[220px] text-muted-foreground">
                    {r.notes || L.actions.none}
                  </Td>
                  <Td className="text-end">
                    {r.system ? (
                      <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                        {d.systemManaged}
                      </span>
                    ) : canManage ? (
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setModal({ editing: r })}
                        >
                          {L.actions.edit}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{L.actions.none}</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}

      {modal && (
        <LedgerModal editing={modal.editing} onClose={() => setModal(null)} />
      )}
    </>
  );
}
