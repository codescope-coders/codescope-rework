"use client";

import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { EmptyState, PageHeader, SubTabs } from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { careersDict } from "./careers.i18n";
import { JobsView } from "./jobs-view";
import { ApplicationsView } from "./applications-view";

const TAB_IDS = ["jobs", "applications"];

export default function CareersPage() {
  const t = useTranslations("dash");
  const d = useDict(careersDict);
  const can = useCan();
  const [tab, setTab] = useQueryState("tab", { defaultValue: "jobs" });
  const active = TAB_IDS.includes(tab) ? tab : "jobs";
  const canManage = can(PERMISSIONS.MANAGE_CAREERS);

  if (!can(PERMISSIONS.VIEW_CAREERS)) {
    return (
      <>
        <PageHeader title={t("nav.careers")} />
        <EmptyState>{d.noAccess}</EmptyState>
      </>
    );
  }

  const tabs = [
    { id: "jobs", label: d.tabJobs },
    { id: "applications", label: d.tabApplications },
  ];

  return (
    <>
      <PageHeader title={t("nav.careers")} subtitle={d.subtitle} />
      <SubTabs tabs={tabs} value={active} onChange={setTab} className="mb-5" />
      {active === "jobs" && <JobsView canManage={canManage} />}
      {active === "applications" && <ApplicationsView />}
    </>
  );
}
