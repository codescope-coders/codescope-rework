"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { Button, Field, Input, Modal, NativeSelect } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { toEnDigits, fmtMoney, monthLabel } from "@/lib/dashboard/format";
import { useSettings } from "@/hooks/useSettings";
import {
  useCreateSheet,
  useSaveSheet,
  useUnpaidLeaveUserIds,
} from "@/hooks/usePayroll";
import type { EmployeeDto, SheetDto, SheetItemInput } from "@/services/payroll";
import { payrollDict } from "./payroll.i18n";

interface Row {
  payrollEmployeeId: number | null;
  userId: number | null;
  name: string;
  position: string | null;
  salary: string;
  currency: "IQD" | "USD";
  deduction: string;
  deductionReason: string;
  bonus: string;
}

export function SheetBuilderModal({
  month,
  employees,
  editing,
  onClose,
}: {
  month: string;
  employees: EmployeeDto[];
  editing: SheetDto | null;
  onClose: () => void;
}) {
  const d = useDict(payrollDict);
  const L = useLabels();
  const locale = useLocale() as "en" | "ar";
  const { data: settings } = useSettings();
  const reasons = settings?.payload?.deductionReasons ?? [];
  const { data: unpaid } = useUnpaidLeaveUserIds();
  const unpaidSet = new Set(unpaid?.payload ?? []);

  const [rows, setRows] = useState<Row[]>(
    editing
      ? editing.items.map((it) => ({
          payrollEmployeeId: it.payrollEmployeeId,
          userId: null,
          name: it.name,
          position: it.position,
          salary: it.salary,
          currency: it.currency,
          deduction: Number(it.deduction) ? it.deduction : "",
          deductionReason: it.deductionReason ?? "",
          bonus: Number(it.bonus) ? it.bonus : "",
        }))
      : employees.map((e) => ({
          payrollEmployeeId: e.id,
          userId: e.userId,
          name: e.name,
          position: e.position,
          salary: e.salary,
          currency: e.currency,
          deduction: "",
          deductionReason: "",
          bonus: "",
        })),
  );

  const setRowAt = (i: number, key: keyof Row, val: string) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: toEnDigits(val) } : r)));
  const netOf = (r: Row) =>
    Number(r.salary || 0) - Number(r.deduction || 0) + Number(r.bonus || 0);

  const done = (m: string) => {
    toast.success(m);
    onClose();
  };
  const create = useCreateSheet(done);
  const save = useSaveSheet(done);
  const busy = create.isPending || save.isPending;

  const submit = () => {
    const items: SheetItemInput[] = rows.map((r) => ({
      payrollEmployeeId: r.payrollEmployeeId,
      name: r.name,
      position: r.position,
      salary: Number(r.salary || 0),
      currency: r.currency,
      deduction: Number(r.deduction || 0),
      deductionReason: r.deductionReason || null,
      bonus: Number(r.bonus || 0),
    }));
    if (editing) save.mutate({ id: editing.id, items });
    else create.mutate({ items, month });
  };

  const title = (editing ? d.builderEdit : d.builderNew).replace(
    "{month}",
    monthLabel(month, locale),
  );

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={title}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            {L.actions.cancel}
          </Button>
          <Button size="sm" disabled={busy} onClick={submit}>
            {editing ? d.saveSheet : d.sendSheet}
          </Button>
        </>
      }
    >
      <p className="mb-3 rounded-lg bg-primary/8 px-3 py-2 text-[11px] text-muted-foreground">
        {d.builderHint}
      </p>
      <div className="flex flex-col gap-2.5">
        {rows.map((r, i) => {
          const warn = r.userId != null && unpaidSet.has(r.userId);
          const net = netOf(r);
          return (
            <div key={i} className="rounded-xl border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <strong className="text-[13.5px]">{r.name}</strong>
                <span className="text-xs text-muted-foreground">
                  {d.baseLabel} {fmtMoney(r.salary, r.currency, locale)}
                </span>
              </div>
              {warn && (
                <div className="mb-2 rounded-md bg-destructive-50 px-2 py-1.5 text-[11px] font-semibold text-destructive-600">
                  {d.unpaidWarn}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Field label={d.deductionField}>
                  <Input
                    type="number"
                    value={r.deduction}
                    onChange={(e) => setRowAt(i, "deduction", e.target.value)}
                    placeholder="0"
                  />
                </Field>
                <Field label={d.deductionReasonField}>
                  <NativeSelect
                    value={r.deductionReason}
                    onChange={(e) => setRowAt(i, "deductionReason", e.target.value)}
                  >
                    <option value="">{d.noDeduction}</option>
                    {reasons.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
              </div>
              <Field label={d.bonusField} className="mt-2">
                <Input
                  type="number"
                  value={r.bonus}
                  onChange={(e) => setRowAt(i, "bonus", e.target.value)}
                  placeholder="0"
                />
              </Field>
              <div
                className={cn(
                  "mt-2 text-[12.5px] font-bold",
                  net < Number(r.salary || 0)
                    ? "text-destructive-600"
                    : net > Number(r.salary || 0)
                      ? "text-success-600"
                      : "text-foreground",
                )}
              >
                {d.netThisMonth} {fmtMoney(net, r.currency, locale)}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
