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
import { toEnDigits, todayStr } from "@/lib/dashboard/format";
import { CURRENCIES } from "@/lib/dashboard/constants";
import { useCreateRequest } from "@/hooks/useRequests";
import { requestsDict } from "./requests.i18n";

type FormState = {
  date: string;
  reason: string;
  currency: string;
  amount: string;
};

export function RequestModal({ onClose }: { onClose: () => void }) {
  const d = useDict(requestsDict);
  const L = useLabels();

  const [f, setF] = useState<FormState>({
    date: todayStr(),
    reason: "",
    currency: "IQD",
    amount: "",
  });
  const set = (k: keyof FormState, v: string) =>
    setF((prev) => ({ ...prev, [k]: toEnDigits(v) }));

  const done = (msg: string) => {
    toast.success(msg);
    onClose();
  };
  const create = useCreateRequest(done);
  const busy = create.isPending;

  const submit = () => {
    create.mutate({
      date: f.date,
      reason: f.reason || null,
      amount: Number(f.amount || 0),
      currency: f.currency as "IQD" | "USD",
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={d.newRequest}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            {L.actions.cancel}
          </Button>
          <Button
            size="sm"
            disabled={busy || !(Number(f.amount) > 0) || !f.date}
            onClick={submit}
          >
            {L.actions.save}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="rounded-lg bg-primary/8 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          {d.hint}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fDate}>
            <Input
              type="date"
              value={f.date}
              onChange={(e) => set("date", e.target.value)}
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
        <Field label={d.fAmount}>
          <Input
            type="number"
            value={f.amount}
            onChange={(e) => set("amount", e.target.value)}
            placeholder={d.amountPh}
            autoFocus
          />
        </Field>
        <Field label={d.fReason}>
          <Textarea
            value={f.reason}
            onChange={(e) => set("reason", e.target.value)}
            placeholder={d.reasonPh}
          />
        </Field>
      </div>
    </Modal>
  );
}
