"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { toEnDigits } from "@/lib/dashboard/format";
import {
  PACKAGE_TIERS,
  BILLING_CYCLES,
  CURRENCIES,
  SUBSCRIPTION_STATUSES,
} from "@/lib/dashboard/constants";
import {
  useCreateSubscription,
  useSaveSubscription,
  useDeleteSubscription,
} from "@/hooks/useSubscriptions";
import type { SubscriptionDto } from "@/services/subscriptions";
import { subsDict } from "./subs.i18n";

type FormState = {
  company: string;
  systemName: string;
  phone: string;
  address: string;
  package: string;
  currency: string;
  amount: string;
  cycle: string;
  startDate: string;
  nextDue: string;
  status: string;
  notes: string;
};

function fromSub(sub: SubscriptionDto | null): FormState {
  return {
    company: sub?.company ?? "",
    systemName: sub?.systemName ?? "",
    phone: sub?.phone ?? "",
    address: sub?.address ?? "",
    package: sub?.package ?? "STANDARD",
    currency: sub?.currency ?? "IQD",
    amount: sub?.amount ?? "",
    cycle: sub?.cycle ?? "MONTHLY",
    startDate: sub?.startDate ?? "",
    nextDue: sub?.nextDue ?? "",
    status: sub?.status ?? "ACTIVE",
    notes: sub?.notes ?? "",
  };
}

export function SubsModal({
  editing,
  onClose,
}: {
  editing: SubscriptionDto | null;
  onClose: () => void;
}) {
  const d = useDict(subsDict);
  const L = useLabels();

  const [f, setF] = useState<FormState>(fromSub(editing));
  const set = (k: keyof FormState, v: string) =>
    setF((prev) => ({ ...prev, [k]: toEnDigits(v) }));

  const done = (msg: string) => {
    toast.success(msg);
    onClose();
  };
  const create = useCreateSubscription(done);
  const save = useSaveSubscription(done);
  const remove = useDeleteSubscription(done);
  const busy = create.isPending || save.isPending || remove.isPending;

  const submit = () => {
    const payload = {
      company: f.company.trim(),
      systemName: f.systemName || null,
      phone: f.phone || null,
      address: f.address || null,
      package: f.package as SubscriptionDto["package"],
      currency: f.currency as SubscriptionDto["currency"],
      amount: f.amount === "" ? null : f.amount,
      cycle: f.cycle as SubscriptionDto["cycle"],
      startDate: f.startDate || null,
      nextDue: f.nextDue || null,
      status: f.status as SubscriptionDto["status"],
      notes: f.notes || null,
    };
    if (editing) save.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? d.editSub : d.newSub}
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
          <Button
            size="sm"
            disabled={busy || !f.company.trim()}
            onClick={submit}
          >
            {L.actions.save}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label={d.fCompany}>
          <Input
            value={f.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder={d.companyPh}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fSystem}>
            <Input
              value={f.systemName}
              onChange={(e) => set("systemName", e.target.value)}
            />
          </Field>
          <Field label={d.fPhone}>
            <Input
              value={f.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="07xx xxx xxxx"
            />
          </Field>
        </div>
        <Field label={d.fAddress}>
          <Input
            value={f.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fPackage}>
            <NativeSelect
              value={f.package}
              onChange={(e) => set("package", e.target.value)}
            >
              {PACKAGE_TIERS.map((p) => (
                <option key={p} value={p}>
                  {L.packageTier[p]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={d.fCurrency}>
            <div className="flex gap-1.5">
              {CURRENCIES.map((c) => (
                <Button
                  key={c}
                  type="button"
                  size="sm"
                  variant={f.currency === c ? "primary" : "outline"}
                  className="flex-1"
                  onClick={() => set("currency", c)}
                >
                  {L.currency[c]}
                </Button>
              ))}
            </div>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fAmount}>
            <Input
              type="number"
              value={f.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder={d.amountPh}
            />
          </Field>
          <Field label={d.fCycle}>
            <NativeSelect
              value={f.cycle}
              onChange={(e) => set("cycle", e.target.value)}
            >
              {BILLING_CYCLES.map((c) => (
                <option key={c} value={c}>
                  {L.billingCycle[c]}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fStartDate}>
            <Input
              type="date"
              value={f.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </Field>
          <Field label={d.fNextDue}>
            <Input
              type="date"
              value={f.nextDue}
              onChange={(e) => set("nextDue", e.target.value)}
            />
          </Field>
        </div>
        <Field label={d.fStatus}>
          <NativeSelect
            value={f.status}
            onChange={(e) => set("status", e.target.value)}
          >
            {SUBSCRIPTION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {L.subscriptionStatus[s]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={d.fNotes}>
          <Textarea
            value={f.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
