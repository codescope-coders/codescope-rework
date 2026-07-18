"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import {
  Button,
  EmptyState,
  Field,
  Input,
  Modal,
  NativeSelect,
  Spinner,
  StatusBadge,
  Table,
  TableWrap,
  Td,
  Textarea,
  Th,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { fmtMoney, todayStr, toEnDigits } from "@/lib/dashboard/format";
import {
  CURRENCIES,
  PACKAGE_TIERS,
  INVOICE_STATUS_TONE,
  invoiceStatus,
} from "@/lib/dashboard/constants";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import {
  useInvoices,
  useCreateInvoice,
  useSaveInvoice,
  useDeleteInvoice,
} from "@/hooks/useInvoices";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import type { InvoiceDto } from "@/services/invoices";
import { invoicesDict } from "./invoices.i18n";
import { InvoiceSheet } from "./invoice-sheet";

export function InvoicesView() {
  const d = useDict(invoicesDict);
  const L = useLabels();
  const locale = useLocale() as "en" | "ar";
  const can = useCan();
  const canManage = can(PERMISSIONS.MANAGE_INVOICES);

  const { data, isLoading } = useInvoices();
  const invoices = data?.payload ?? [];
  const remove = useDeleteInvoice((m) => toast.success(m));

  const [modal, setModal] = useState<{ editing: InvoiceDto | null } | null>(null);
  const [sheet, setSheet] = useState<InvoiceDto | null>(null);

  return (
    <>
      {canManage && (
        <div className="mb-3 flex justify-end">
          <Button onClick={() => setModal({ editing: null })}>
            + {d.addInvoice}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
          <Spinner /> ...
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState>{d.empty}</EmptyState>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>{d.colNumber}</Th>
                <Th>{d.colCompany}</Th>
                <Th>{d.colPackage}</Th>
                <Th>{d.colTotal}</Th>
                <Th>{d.colPaid}</Th>
                <Th>{d.colRemaining}</Th>
                <Th>{d.colStatus}</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const total = Number(inv.total || 0);
                const paid = Number(inv.paid || 0);
                const remaining = total - paid;
                const status = invoiceStatus(total, paid);
                return (
                  <tr
                    key={inv.id}
                    className="cursor-pointer"
                    onClick={() => setSheet(inv)}
                  >
                    <Td className="font-bold">#{inv.number}</Td>
                    <Td className="font-bold">{inv.company}</Td>
                    <Td>{L.packageTier[inv.package]}</Td>
                    <Td className="font-bold">
                      {fmtMoney(total, inv.currency, locale)}
                    </Td>
                    <Td className="text-success-600">
                      {fmtMoney(paid, inv.currency, locale)}
                    </Td>
                    <Td
                      className={
                        remaining > 0
                          ? "font-bold text-destructive-600"
                          : "text-muted-foreground"
                      }
                    >
                      {fmtMoney(remaining, inv.currency, locale)}
                    </Td>
                    <Td>
                      <StatusBadge tone={INVOICE_STATUS_TONE[status]}>
                        {L.invoiceStatus[status]}
                      </StatusBadge>
                    </Td>
                    <Td onClick={(e) => e.stopPropagation()}>
                      {canManage && (
                        <div className="flex gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setModal({ editing: inv })}
                          >
                            {L.actions.edit}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={remove.isPending}
                            onClick={() => remove.mutate(inv.id)}
                          >
                            {L.actions.delete}
                          </Button>
                        </div>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
      )}

      {sheet && <InvoiceSheet invoice={sheet} onClose={() => setSheet(null)} />}
      {modal && (
        <InvoiceModal editing={modal.editing} onClose={() => setModal(null)} />
      )}
    </>
  );
}

/* ── Add / edit modal ─────────────────────────────────────────────────────── */

type FormState = {
  company: string;
  systemName: string;
  phone: string;
  address: string;
  package: string;
  currency: string;
  date: string;
  total: string;
  paid: string;
  notes: string;
};

function fromInvoice(inv: InvoiceDto | null): FormState {
  return {
    company: inv?.company ?? "",
    systemName: inv?.systemName ?? "",
    phone: inv?.phone ?? "",
    address: inv?.address ?? "",
    package: inv?.package ?? "STANDARD",
    currency: inv?.currency ?? "IQD",
    date: inv?.date ?? todayStr(),
    total: inv?.total ?? "",
    paid: inv?.paid ?? "",
    notes: inv?.notes ?? "",
  };
}

function InvoiceModal({
  editing,
  onClose,
}: {
  editing: InvoiceDto | null;
  onClose: () => void;
}) {
  const d = useDict(invoicesDict);
  const L = useLabels();
  const locale = useLocale() as "en" | "ar";
  const { data: subsData } = useSubscriptions();
  const subs = subsData?.payload ?? [];

  const [f, setF] = useState<FormState>(fromInvoice(editing));
  const set = (k: keyof FormState, v: string) =>
    setF((prev) => ({ ...prev, [k]: toEnDigits(v) }));

  /** Typing/selecting a known subscriber autofills its details. */
  const pickCompany = (value: string) => {
    const v = toEnDigits(value);
    const match = subs.find(
      (s) => s.company.trim().toLowerCase() === v.trim().toLowerCase(),
    );
    setF((prev) => ({
      ...prev,
      company: v,
      ...(match
        ? {
            systemName: match.systemName ?? prev.systemName,
            phone: match.phone ?? prev.phone,
            address: match.address ?? prev.address,
            package: match.package ?? prev.package,
            currency: match.currency ?? prev.currency,
          }
        : {}),
    }));
  };

  const done = (msg: string) => {
    toast.success(msg);
    onClose();
  };
  const create = useCreateInvoice(done);
  const save = useSaveInvoice(done);
  const remove = useDeleteInvoice(done);
  const busy = create.isPending || save.isPending || remove.isPending;

  const remaining = Number(f.total || 0) - Number(f.paid || 0);

  const submit = () => {
    const payload = {
      date: f.date || null,
      company: f.company.trim(),
      systemName: f.systemName || null,
      phone: f.phone || null,
      address: f.address || null,
      package: f.package as InvoiceDto["package"],
      currency: f.currency as InvoiceDto["currency"],
      total: f.total,
      paid: f.paid,
      notes: f.notes || null,
    };
    if (editing) save.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? d.editInvoice : d.newInvoice}
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
            disabled={busy || !f.company.trim() || !f.total}
            onClick={submit}
          >
            {L.actions.save}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label={d.fCompany} hint={d.subHint}>
          <Input
            list="inv-companies"
            value={f.company}
            onChange={(e) => pickCompany(e.target.value)}
            placeholder={d.companyPh}
            autoFocus
          />
          <datalist id="inv-companies">
            {subs.map((s) => (
              <option key={s.id} value={s.company} />
            ))}
          </datalist>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fSystemName}>
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
          <Input value={f.address} onChange={(e) => set("address", e.target.value)} />
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
          <Field label={d.fDate}>
            <Input
              type="date"
              value={f.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </Field>
          <Field label={d.fTotal}>
            <Input
              type="number"
              value={f.total}
              onChange={(e) => set("total", e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fPaid}>
            <Input
              type="number"
              value={f.paid}
              onChange={(e) => set("paid", e.target.value)}
            />
          </Field>
          <Field label={d.remainingLabel}>
            <Input
              value={fmtMoney(remaining, f.currency as "IQD" | "USD", locale)}
              disabled
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
