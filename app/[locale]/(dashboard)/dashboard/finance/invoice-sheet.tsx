"use client";

import { useLocale } from "next-intl";
import {
  Button,
  Modal,
  StatusBadge,
  Table,
  Td,
  Th,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { fmtMoney } from "@/lib/dashboard/format";
import { INVOICE_STATUS_TONE, invoiceStatus } from "@/lib/dashboard/constants";
import type { InvoiceDto } from "@/services/invoices";
import { invoicesDict } from "./invoices.i18n";

export function InvoiceSheet({
  invoice,
  onClose,
}: {
  invoice: InvoiceDto;
  onClose: () => void;
}) {
  const d = useDict(invoicesDict);
  const L = useLabels();
  const locale = useLocale() as "en" | "ar";

  const total = Number(invoice.total || 0);
  const paid = Number(invoice.paid || 0);
  const remaining = total - paid;
  const status = invoiceStatus(total, paid);
  const cur = invoice.currency;

  const rows: [string, string | null][] = [
    [d.lblSystem, invoice.systemName],
    [d.lblPhone, invoice.phone],
    [d.lblAddress, invoice.address],
  ];

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`${d.sheetTitle} #${invoice.number}`}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {L.actions.close}
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            {L.actions.print}
          </Button>
        </>
      }
    >
      <div className="rounded-xl border border-border bg-card p-5 text-foreground">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="text-lg font-bold text-primary">{d.issuer}</div>
            <div className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
              {d.sheetTitle}
            </div>
          </div>
          <div className="text-end text-xs text-muted-foreground">
            <div>
              <span className="font-bold text-foreground">{d.lblNumber}:</span>{" "}
              {invoice.number}
            </div>
            <div className="mt-0.5">
              <span className="font-bold text-foreground">{d.lblDate}:</span>{" "}
              {invoice.date}
            </div>
            <div className="mt-1.5">
              <StatusBadge tone={INVOICE_STATUS_TONE[status]}>
                {L.invoiceStatus[status]}
              </StatusBadge>
            </div>
          </div>
        </div>

        {/* Bill to */}
        <div className="py-4">
          <div className="mb-1.5 text-xs font-bold text-muted-foreground">
            {d.lblBillTo}
          </div>
          <div className="text-sm font-bold text-foreground">{invoice.company}</div>
          {rows
            .filter(([, v]) => v)
            .map(([label, v]) => (
              <div key={label} className="mt-0.5 text-[12.5px] text-muted-foreground">
                <span className="font-bold text-foreground">{label}:</span> {v}
              </div>
            ))}
        </div>

        {/* Line item */}
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <Th>{d.lblDescription}</Th>
                <Th>{d.lblPackage}</Th>
                <Th className="text-end">{d.lblAmount}</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td>{invoice.systemName || d.descFallback}</Td>
                <Td>{L.packageTier[invoice.package]}</Td>
                <Td className="text-end font-bold">
                  {fmtMoney(total, cur, locale)}
                </Td>
              </tr>
            </tbody>
          </Table>
        </div>

        {/* Totals */}
        <div className="mt-4 flex flex-col items-end gap-1.5 text-sm">
          <div className="flex w-full max-w-[260px] justify-between">
            <span className="text-muted-foreground">{d.lblTotal}</span>
            <span className="font-bold text-foreground">
              {fmtMoney(total, cur, locale)}
            </span>
          </div>
          <div className="flex w-full max-w-[260px] justify-between">
            <span className="text-muted-foreground">{d.lblPaid}</span>
            <span className="font-bold text-success-600">
              {fmtMoney(paid, cur, locale)}
            </span>
          </div>
          <div className="flex w-full max-w-[260px] justify-between border-t border-border pt-1.5">
            <span className="text-muted-foreground">{d.lblRemaining}</span>
            <span
              className={
                remaining > 0
                  ? "font-bold text-destructive-600"
                  : "font-bold text-foreground"
              }
            >
              {fmtMoney(remaining, cur, locale)}
            </span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-4 rounded-lg bg-muted px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
            <span className="font-bold text-foreground">{d.lblNotes}:</span>{" "}
            {invoice.notes}
          </div>
        )}

        <div className="mt-4 text-center text-[11.5px] text-muted-foreground">
          {d.thanks}
        </div>
      </div>
    </Modal>
  );
}
