"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import {
  Button,
  Field,
  Input,
  Modal,
  NativeSelect,
  Table,
  TableWrap,
  Td,
  Textarea,
  Th,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { CURRENCIES, type Currency } from "@/lib/dashboard/constants";
import { fmtMoney, toEnDigits, todayStr } from "@/lib/dashboard/format";
import { usePartners } from "@/hooks/usePartners";
import { useCreateDistribution } from "@/hooks/useDistributions";
import { partnersDict } from "./partners.i18n";

export function DistributionModal({ onClose }: { onClose: () => void }) {
  const d = useDict(partnersDict);
  const L = useLabels();
  const locale = useLocale() as "en" | "ar";

  const { data } = usePartners();
  const partners = data?.payload ?? [];

  const [date, setDate] = useState(todayStr());
  const [currency, setCurrency] = useState<Currency>("IQD");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const done = (msg: string) => {
    toast.success(msg);
    onClose();
  };
  const create = useCreateDistribution(done);

  const total = Number(amount) || 0;
  const preview = partners.map((p) => ({
    id: p.id,
    name: p.name,
    percentage: p.percentage,
    share: Math.round((total * p.percentage) / 100),
  }));

  const submit = () =>
    create.mutate({
      date,
      amount: total,
      currency,
      note: note || null,
    });

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={d.newDistributionTitle}
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={create.isPending}
          >
            {L.actions.cancel}
          </Button>
          <Button
            size="sm"
            disabled={create.isPending || !date || total <= 0}
            onClick={submit}
          >
            {d.confirmDistribution}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fDistDate}>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(toEnDigits(e.target.value))}
            />
          </Field>
          <Field label={d.fCurrency}>
            <NativeSelect
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
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
            value={amount}
            onChange={(e) => setAmount(toEnDigits(e.target.value))}
            placeholder="0"
          />
        </Field>
        <Field label={d.fDistNote}>
          <Textarea value={note} onChange={(e) => setNote(toEnDigits(e.target.value))} />
        </Field>

        <div>
          <div className="mb-1.5 text-xs font-bold text-muted-foreground">
            {d.previewTitle}
          </div>
          {preview.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-[12px] text-muted-foreground">
              {d.previewEmpty}
            </p>
          ) : (
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>{d.shareName}</Th>
                    <Th>{d.sharePercentage}</Th>
                    <Th className="text-end">{d.shareAmount}</Th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((s) => (
                    <tr key={s.id}>
                      <Td className="font-semibold">{s.name}</Td>
                      <Td>{s.percentage}%</Td>
                      <Td className="text-end tabular-nums">
                        {fmtMoney(s.share, currency, locale)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          )}
        </div>

        <p className="rounded-lg bg-warning-50 px-3 py-2 text-[11px] leading-relaxed text-warning-700">
          {d.ledgerNote}
        </p>
      </div>
    </Modal>
  );
}
