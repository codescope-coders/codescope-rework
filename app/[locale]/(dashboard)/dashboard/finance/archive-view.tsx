"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  StatCard,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { monthLabel, currentMonthKey, fmtNumber } from "@/lib/dashboard/format";
import { useLedger } from "@/hooks/useLedger";
import { useRequests } from "@/hooks/useRequests";
import { useInvoices } from "@/hooks/useInvoices";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useSheets } from "@/hooks/usePayroll";

const archiveDict = {
  en: {
    prev: "Previous month",
    next: "Next month",
    inIqd: "Income (IQD)",
    outIqd: "Expense (IQD)",
    netIqd: "Net (IQD)",
    inUsd: "Income (USD)",
    outUsd: "Expense (USD)",
    netUsd: "Net (USD)",
    summary: "Summary",
    movements: "Ledger movements",
    requests: "Spend requests",
    sheet: "Payroll sheet",
    noSheet: "not created",
    invoices: "Invoices issued",
    newSubs: "New subscriptions",
    emptyMonth: "No financial activity recorded in {month}.",
  },
  ar: {
    prev: "الشهر السابق",
    next: "الشهر التالي",
    inIqd: "الوارد (د.ع)",
    outIqd: "الصادر (د.ع)",
    netIqd: "صافي الشهر (د.ع)",
    inUsd: "الوارد (دولار)",
    outUsd: "الصادر (دولار)",
    netUsd: "صافي الشهر (دولار)",
    summary: "ملخّص",
    movements: "عدد الحركات المالية",
    requests: "طلبات الصرف",
    sheet: "مشف الرواتب",
    noSheet: "لم يُنشأ",
    invoices: "الفواتير الصادرة",
    newSubs: "شركات اشتركت جديدة",
    emptyMonth: "لا يوجد أي نشاط مالي مسجّل بشهر {month}.",
  },
};

export function ArchiveView() {
  const d = useDict(archiveDict);
  const L = useLabels();
  const locale = useLocale() as "en" | "ar";

  const ledger = useLedger().data?.payload ?? [];
  const requests = useRequests().data?.payload ?? [];
  const invoices = useInvoices().data?.payload ?? [];
  const subs = useSubscriptions().data?.payload ?? [];
  const sheets = useSheets().data?.payload ?? [];

  const months = useMemo(() => {
    const set = new Set<string>([currentMonthKey()]);
    ledger.forEach((l) => l.date && set.add(l.date.slice(0, 7)));
    requests.forEach((r) => r.date && set.add(r.date.slice(0, 7)));
    invoices.forEach((i) => i.date && set.add(i.date.slice(0, 7)));
    subs.forEach((s) => s.startDate && set.add(s.startDate.slice(0, 7)));
    sheets.forEach((s) => set.add(s.month));
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [ledger, requests, invoices, subs, sheets]);

  const [selected, setSelected] = useState<string>("");
  const month = selected || months[0] || currentMonthKey();
  const idx = months.indexOf(month);

  const inMonth = (dateStr?: string | null) => (dateStr || "").slice(0, 7) === month;
  const ledgerM = ledger.filter((l) => inMonth(l.date));
  const requestsM = requests.filter((r) => inMonth(r.date));
  const invoicesM = invoices.filter((i) => inMonth(i.date));
  const newSubsM = subs.filter((s) => inMonth(s.startDate));
  const sheetM = sheets.find((s) => s.month === month);

  const sum = (type: "INCOME" | "EXPENSE", cur: "IQD" | "USD") =>
    ledgerM
      .filter((l) => l.type === type && l.currency === cur)
      .reduce((s, l) => s + Number(l.amount || 0), 0);
  const inIqd = sum("INCOME", "IQD");
  const outIqd = sum("EXPENSE", "IQD");
  const inUsd = sum("INCOME", "USD");
  const outUsd = sum("EXPENSE", "USD");

  const nothing =
    ledgerM.length === 0 &&
    requestsM.length === 0 &&
    !sheetM &&
    invoicesM.length === 0 &&
    newSubsM.length === 0;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={idx >= months.length - 1}
          onClick={() => setSelected(months[idx + 1])}
        >
          ‹ {d.prev}
        </Button>
        <select
          value={month}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-md border border-border bg-overlay px-3 py-1.5 text-sm font-bold text-primary"
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m, locale)}
            </option>
          ))}
        </select>
        <Button
          variant="ghost"
          size="sm"
          disabled={idx <= 0}
          onClick={() => setSelected(months[idx - 1])}
        >
          {d.next} ›
        </Button>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-3">
        <StatCard tone="success" value={fmtNumber(inIqd)} label={d.inIqd} />
        <StatCard tone="danger" value={fmtNumber(outIqd)} label={d.outIqd} />
        <StatCard tone="teal" value={fmtNumber(inIqd - outIqd)} label={d.netIqd} />
      </div>
      {(inUsd > 0 || outUsd > 0) && (
        <div className="mb-4 grid grid-cols-3 gap-3">
          <StatCard tone="success" value={"$" + fmtNumber(inUsd)} label={d.inUsd} />
          <StatCard tone="danger" value={"$" + fmtNumber(outUsd)} label={d.outUsd} />
          <StatCard tone="teal" value={"$" + fmtNumber(inUsd - outUsd)} label={d.netUsd} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {d.summary} — {monthLabel(month, locale)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-[13px] text-foreground sm:grid-cols-3">
            <div>
              {d.movements}: <strong>{ledgerM.length}</strong>
            </div>
            <div>
              {d.requests}: <strong>{requestsM.length}</strong>
            </div>
            <div>
              {d.sheet}: <strong>{sheetM ? L.sheetStatus[sheetM.status] : d.noSheet}</strong>
            </div>
            <div>
              {d.invoices}: <strong>{invoicesM.length}</strong>
            </div>
            <div>
              {d.newSubs}:{" "}
              <strong className={newSubsM.length > 0 ? "text-success-600" : undefined}>
                {newSubsM.length}
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {nothing && (
        <div className="mt-4">
          <EmptyState>
            {d.emptyMonth.replace("{month}", monthLabel(month, locale))}
          </EmptyState>
        </div>
      )}
    </>
  );
}
