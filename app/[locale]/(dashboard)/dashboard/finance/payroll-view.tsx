"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  EmptyState,
  Spinner,
  StatCard,
  StatusBadge,
  Table,
  TableWrap,
  Td,
  Th,
} from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import {
  fmtMoney,
  monthLabel,
  currentMonthKey,
  netPay,
} from "@/lib/dashboard/format";
import { CURRENCIES, SHEET_STATUS_TONE } from "@/lib/dashboard/constants";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import {
  useDecideSheet,
  useDeleteEmployee,
  useDeleteSheet,
  useEmployees,
  usePayEmployee,
  useSheets,
} from "@/hooks/usePayroll";
import type { SheetDto } from "@/services/payroll";
import { payrollDict } from "./payroll.i18n";
import { PayrollModal } from "./payroll-modal";
import { SheetBuilderModal } from "./sheet-builder-modal";

export function PayrollView() {
  const d = useDict(payrollDict);
  const L = useLabels();
  const locale = useLocale() as "en" | "ar";
  const can = useCan();
  const canManage = can(PERMISSIONS.MANAGE_PAYROLL);
  const canApprove = can(PERMISSIONS.APPROVE_PAYROLL);

  const { data: empData, isLoading } = useEmployees();
  const employees = empData?.payload ?? [];
  const { data: sheetData } = useSheets();
  const sheets = sheetData?.payload ?? [];

  const pay = usePayEmployee((m) => toast.success(m));
  const removeEmp = useDeleteEmployee((m) => toast.success(m));
  const decide = useDecideSheet((m) => toast.success(m));
  const removeSheet = useDeleteSheet((m) => toast.success(m));

  const [rosterOpen, setRosterOpen] = useState(false);
  const [empModal, setEmpModal] = useState<{ editing: null | (typeof employees)[number] } | null>(null);
  const [builder, setBuilder] = useState<{ editing: SheetDto | null } | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const totalIqd = employees
    .filter((e) => e.currency !== "USD")
    .reduce((s, e) => s + Number(e.salary || 0), 0);
  const totalUsd = employees
    .filter((e) => e.currency === "USD")
    .reduce((s, e) => s + Number(e.salary || 0), 0);

  const thisMonth = currentMonthKey();
  const monthHasSheet = sheets.some((s) => s.month === thisMonth);

  const sheetNetByCurrency = (sheet: SheetDto, cur: string) =>
    sheet.items
      .filter((i) => (i.currency || "IQD") === cur)
      .reduce((s, i) => s + netPay(i), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
        <Spinner /> ...
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard tone="primary" value={employees.length} label={d.stEmployees} />
        <StatCard tone="teal" value={totalIqd.toLocaleString("en-US")} label={d.stTotalIqd} />
        <StatCard tone="teal" value={"$" + totalUsd.toLocaleString("en-US")} label={d.stTotalUsd} />
      </div>

      {/* Roster */}
      <button
        type="button"
        onClick={() => setRosterOpen((o) => !o)}
        className="surface-raised mb-3 flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-start"
      >
        <span className="text-[13.5px] font-bold text-foreground">
          {d.rosterTitle} ({employees.length})
        </span>
        <span className="text-xs font-bold text-primary">
          {rosterOpen ? d.hideRoster : d.showRoster}
        </span>
      </button>

      {rosterOpen && (
        <div className="mb-6">
          {canManage && (
            <div className="mb-3 flex justify-end">
              <Button size="sm" onClick={() => setEmpModal({ editing: null })}>
                + {d.addEmployee}
              </Button>
            </div>
          )}
          {employees.length === 0 ? (
            <EmptyState>{d.noEmployees}</EmptyState>
          ) : (
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>{d.colName}</Th>
                    <Th>{d.colPosition}</Th>
                    <Th>{d.colSalary}</Th>
                    <Th>{d.colLastPaid}</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e) => (
                    <tr key={e.id}>
                      <Td
                        className={canManage ? "cursor-pointer font-bold" : "font-bold"}
                        onClick={() => canManage && setEmpModal({ editing: e })}
                      >
                        {e.name}
                      </Td>
                      <Td>{e.position || L.actions.none}</Td>
                      <Td className="font-bold">{fmtMoney(e.salary, e.currency, locale)}</Td>
                      <Td className="text-muted-foreground">{e.lastPaid || L.actions.none}</Td>
                      <Td>
                        {e.pendingRequest ? (
                          <StatusBadge tone="warning">{d.pendingApproval}</StatusBadge>
                        ) : (
                          <div className="flex gap-1.5">
                            <Button
                              variant="success"
                              size="sm"
                              disabled={pay.isPending}
                              onClick={() => pay.mutate(e.id)}
                            >
                              {d.payNow}
                            </Button>
                            {canManage && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeEmp.mutate(e.id)}
                              >
                                {L.actions.delete}
                              </Button>
                            )}
                          </div>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          )}
        </div>
      )}

      {/* Monthly sheets */}
      <div className="mb-2 text-sm font-bold text-foreground">{d.sheetsTitle}</div>
      <p className="mb-3 rounded-lg bg-primary/8 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        {d.sheetsHint}
      </p>
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-[13px] text-muted-foreground">
          {monthLabel(thisMonth, locale)}
        </span>
        {canManage && (
          <Button
            disabled={employees.length === 0 || monthHasSheet}
            onClick={() => setBuilder({ editing: null })}
          >
            {monthHasSheet ? d.sheetExists : "+ " + d.createSheet}
          </Button>
        )}
      </div>

      {sheets.length === 0 ? (
        <EmptyState>{d.noSheets}</EmptyState>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sheets.map((sheet) => {
            const isOpen = expanded === sheet.id;
            const sc = SHEET_STATUS_TONE[sheet.status];
            const currencies = CURRENCIES.filter((c) =>
              sheet.items.some((i) => (i.currency || "IQD") === c),
            );
            return (
              <div key={sheet.id} className="surface-raised rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-start"
                    onClick={() => setExpanded(isOpen ? null : sheet.id)}
                    aria-expanded={isOpen}
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <strong className="text-sm">
                        {d.sheetOf.replace("{month}", monthLabel(sheet.month, locale))}
                      </strong>
                      <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
                        {d.employeesN.replace("{n}", String(sheet.items.length))} · {d.by}{" "}
                        {sheet.createdByName || "—"}
                        {currencies.map((c) => (
                          <span key={c}>
                            {" "}
                            · {d.net} {fmtMoney(sheetNetByCurrency(sheet, c), c as "IQD" | "USD", locale)}
                          </span>
                        ))}
                      </span>
                      {sheet.status === "PENDING" && (
                        <span
                          className={cn(
                            "mt-1 block text-[11px] font-semibold",
                            canApprove ? "text-primary" : "text-warning-600",
                          )}
                        >
                          {canApprove ? d.reviewCta : d.awaitingApproval}
                        </span>
                      )}
                    </span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    {canApprove && sheet.status === "PENDING" && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setBuilder({ editing: sheet })}>
                          {d.edit}
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => removeSheet.mutate(sheet.id)}>
                          {L.actions.delete}
                        </Button>
                      </>
                    )}
                    <StatusBadge tone={sc}>{L.sheetStatus[sheet.status]}</StatusBadge>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-3 border-t border-border pt-3">
                    <div className="overflow-x-auto">
                      <Table>
                        <thead>
                          <tr>
                            <Th>{d.colName}</Th>
                            <Th>{d.colBase}</Th>
                            <Th>{d.colDeduction}</Th>
                            <Th>{d.colBonus}</Th>
                            <Th>{d.colNet}</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {sheet.items.map((it, idx) => (
                            <tr key={idx}>
                              <Td>{it.name}</Td>
                              <Td>{fmtMoney(it.salary, it.currency, locale)}</Td>
                              <Td className={Number(it.deduction) > 0 ? "text-destructive-600" : "text-muted-foreground"}>
                                {Number(it.deduction) > 0
                                  ? "-" +
                                    fmtMoney(it.deduction, it.currency, locale) +
                                    (it.deductionReason ? ` (${it.deductionReason})` : "")
                                  : L.actions.none}
                              </Td>
                              <Td className={Number(it.bonus) > 0 ? "text-success-600" : "text-muted-foreground"}>
                                {Number(it.bonus) > 0
                                  ? "+" + fmtMoney(it.bonus, it.currency, locale)
                                  : L.actions.none}
                              </Td>
                              <Td className="font-bold">{fmtMoney(netPay(it), it.currency, locale)}</Td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {canApprove && sheet.status === "PENDING" && (
                      <div className="mt-3 flex justify-end gap-2">
                        <Button variant="danger" size="sm" onClick={() => decide.mutate({ id: sheet.id, decision: "REJECTED" })}>
                          {L.actions.reject}
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => decide.mutate({ id: sheet.id, decision: "PAID" })}
                        >
                          {d.approveAll}
                        </Button>
                      </div>
                    )}
                    {sheet.status !== "PENDING" && (
                      <div className="mt-2 text-[11.5px] text-muted-foreground">
                        {d.decidedByOn
                          .replace("{name}", sheet.decidedByName || "—")
                          .replace("{date}", sheet.decidedDate || "—")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {empModal && (
        <PayrollModal editing={empModal.editing} onClose={() => setEmpModal(null)} />
      )}
      {builder && (
        <SheetBuilderModal
          month={builder.editing ? builder.editing.month : thisMonth}
          employees={employees}
          editing={builder.editing}
          onClose={() => setBuilder(null)}
        />
      )}
    </>
  );
}
