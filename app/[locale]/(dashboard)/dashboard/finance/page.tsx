"use client";

import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { EmptyState, PageHeader, SubTabs } from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { financeDict } from "./finance.i18n";
import { LedgerView } from "./ledger-view";
import { RequestsView } from "./requests-view";
import { PayrollView } from "./payroll-view";
import { SubscriptionsView } from "./subs-view";
import { InvoicesView } from "./invoices-view";
import { ArchiveView } from "./archive-view";

const TAB_IDS = ["ledger", "requests", "payroll", "subs", "invoices", "archive"];

export default function FinancePage() {
  const t = useTranslations("dash");
  const d = useDict(financeDict);
  const can = useCan();
  const [tab, setTab] = useQueryState("tab", { defaultValue: "ledger" });
  const active = TAB_IDS.includes(tab) ? tab : "ledger";

  const tabs = [
    { id: "ledger", label: t("nav.finance_ledger") },
    { id: "requests", label: t("nav.finance_requests") },
    { id: "payroll", label: t("nav.finance_payroll") },
    { id: "subs", label: t("nav.finance_subs") },
    { id: "invoices", label: t("nav.finance_invoices") },
    { id: "archive", label: t("nav.finance_archive") },
  ];

  if (!can(PERMISSIONS.VIEW_FINANCE)) {
    return (
      <>
        <PageHeader title={t("nav.finance")} />
        <EmptyState>{d.noAccess}</EmptyState>
      </>
    );
  }

  return (
    <>
      <PageHeader title={t("nav.finance")} subtitle={d.subtitle} />
      <SubTabs tabs={tabs} value={active} onChange={setTab} className="mb-5" />
      {active === "ledger" && <LedgerView />}
      {active === "requests" && <RequestsView />}
      {active === "payroll" && <PayrollView />}
      {active === "subs" && <SubscriptionsView />}
      {active === "invoices" && <InvoicesView />}
      {active === "archive" && <ArchiveView />}
    </>
  );
}
