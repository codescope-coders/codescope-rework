"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Button,
  Field,
  Input,
  Modal,
  NativeSelect,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { toEnDigits } from "@/lib/dashboard/format";
import { CURRENCIES } from "@/lib/dashboard/constants";
import { useCreateEmployee, useSaveEmployee } from "@/hooks/usePayroll";
import type { EmployeeDto } from "@/services/payroll";
import { payrollDict } from "./payroll.i18n";

export function PayrollModal({
  editing,
  onClose,
}: {
  editing: EmployeeDto | null;
  onClose: () => void;
}) {
  const d = useDict(payrollDict);
  const L = useLabels();
  const [f, setF] = useState({
    name: editing?.name ?? "",
    position: editing?.position ?? "",
    salary: editing?.salary ?? "",
    currency: (editing?.currency ?? "IQD") as "IQD" | "USD",
  });
  const set = (k: keyof typeof f, v: string) =>
    setF((p) => ({ ...p, [k]: toEnDigits(v) }));

  const done = (m: string) => {
    toast.success(m);
    onClose();
  };
  const create = useCreateEmployee(done);
  const save = useSaveEmployee(done);
  const busy = create.isPending || save.isPending;

  const submit = () => {
    const payload = {
      name: f.name.trim(),
      position: f.position || null,
      salary: Number(f.salary),
      currency: f.currency,
    };
    if (editing) save.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? d.empEdit : d.empNew}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            {L.actions.cancel}
          </Button>
          <Button
            size="sm"
            disabled={busy || !f.name.trim() || !f.salary}
            onClick={submit}
          >
            {L.actions.save}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label={d.fName}>
          <Input value={f.name} onChange={(e) => set("name", e.target.value)} autoFocus />
        </Field>
        <Field label={d.fPosition}>
          <Input value={f.position} onChange={(e) => set("position", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fSalary}>
            <Input
              type="number"
              value={f.salary}
              onChange={(e) => set("salary", e.target.value)}
            />
          </Field>
          <Field label={d.fCurrency}>
            <NativeSelect
              value={f.currency}
              onChange={(e) => set("currency", e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {L.currency[c]}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
      </div>
    </Modal>
  );
}
