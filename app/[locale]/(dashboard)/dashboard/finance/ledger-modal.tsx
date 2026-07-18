"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Button,
  Field,
  Input,
  Modal,
  NativeSelect,
  Textarea,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { toEnDigits, todayStr } from "@/lib/dashboard/format";
import { CURRENCIES, LEDGER_TYPES } from "@/lib/dashboard/constants";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useSettings } from "@/hooks/useSettings";
import {
  useCreateLedgerEntry,
  useSaveLedgerEntry,
  useDeleteLedgerEntry,
} from "@/hooks/useLedger";
import type { LedgerEntryDto } from "@/services/ledger";
import { ledgerDict } from "./ledger.i18n";

type FormState = {
  date: string;
  type: string; // INCOME | EXPENSE
  category: string;
  currency: string; // IQD | USD
  amount: string;
  notes: string;
};

function fromEntry(entry: LedgerEntryDto | null): FormState {
  return {
    date: entry?.date ?? todayStr(),
    type: entry?.type ?? "INCOME",
    category: entry?.category ?? "",
    currency: entry?.currency ?? "IQD",
    amount: entry?.amount ?? "",
    notes: entry?.notes ?? "",
  };
}

export function LedgerModal({
  editing,
  onClose,
}: {
  editing: LedgerEntryDto | null;
  onClose: () => void;
}) {
  const d = useDict(ledgerDict);
  const L = useLabels();
  const can = useCan();
  const canExpense = can(PERMISSIONS.MANAGE_LEDGER_EXPENSE);

  const { data: settingsData } = useSettings();
  const incomeCats = settingsData?.payload?.incomeCategories ?? [];
  const expenseCats = settingsData?.payload?.expenseCategories ?? [];

  const [f, setF] = useState<FormState>(fromEntry(editing));
  const set = (k: keyof FormState, v: string) =>
    setF((prev) => ({ ...prev, [k]: toEnDigits(v) }));

  const categories = f.type === "EXPENSE" ? expenseCats : incomeCats;
  // EXPENSE is only offered to admins; when editing an existing expense we keep
  // its type available so a MANAGE_LEDGER-only user doesn't silently flip it.
  const typeOptions = LEDGER_TYPES.filter(
    (tp) => tp === "INCOME" || canExpense || tp === editing?.type,
  );

  const setType = (v: string) => {
    const list = v === "EXPENSE" ? expenseCats : incomeCats;
    const keep = list.includes(f.category);
    setF((prev) => ({ ...prev, type: v, category: keep ? prev.category : "" }));
  };

  const done = (msg: string) => {
    toast.success(msg);
    onClose();
  };
  const create = useCreateLedgerEntry(done);
  const save = useSaveLedgerEntry(done);
  const remove = useDeleteLedgerEntry(done);
  const busy = create.isPending || save.isPending || remove.isPending;

  const amountValid = Number(f.amount) > 0;

  const submit = () => {
    const payload = {
      date: f.date || todayStr(),
      type: f.type as LedgerEntryDto["type"],
      category: f.category || null,
      currency: f.currency as LedgerEntryDto["currency"],
      amount: f.amount,
      notes: f.notes || null,
    };
    if (editing) save.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? d.editEntry : d.newEntry}
      footer={
        <>
          {editing && (
            <Button
              variant="danger"
              size="sm"
              className="me-auto"
              disabled={busy}
              onClick={() => remove.mutate(editing.id)}
            >
              {L.actions.delete}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            {L.actions.cancel}
          </Button>
          <Button size="sm" disabled={busy || !amountValid} onClick={submit}>
            {L.actions.save}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fDate}>
            <Input
              type="date"
              value={f.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </Field>
          <Field label={d.fType}>
            <NativeSelect
              value={f.type}
              onChange={(e) => setType(e.target.value)}
            >
              {typeOptions.map((tp) => (
                <option key={tp} value={tp}>
                  {L.ledgerType[tp]}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>

        <Field label={d.fCategory}>
          <NativeSelect
            value={f.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">{d.noCategory}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </NativeSelect>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fCurrency}>
            <div className="inline-flex w-full rounded-md border border-border bg-muted p-0.5">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("currency", c)}
                  className={cn(
                    "flex-1 rounded px-2 py-1.5 text-xs font-bold transition-colors",
                    f.currency === c
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {L.currency[c]}
                </button>
              ))}
            </div>
          </Field>
          <Field label={d.fAmount}>
            <Input
              type="number"
              inputMode="numeric"
              value={f.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder={d.amountPh}
              autoFocus
            />
          </Field>
        </div>

        <Field label={d.fNotes}>
          <Textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
