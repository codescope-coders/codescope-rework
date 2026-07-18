"use client";

import { useTranslations } from "next-intl";
import {
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { fmtNumber } from "@/lib/dashboard/format";
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_TONE,
  type PipelineStage,
} from "@/lib/dashboard/constants";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useRouter } from "@/i18n/routing";
import { useMe } from "@/hooks/useMe";
import { useLeads } from "@/hooks/usePipeline";
import { useTickets } from "@/hooks/useTickets";
import { useLedger } from "@/hooks/useLedger";
import { useRequests } from "@/hooks/useRequests";
import { useReports } from "@/hooks/useReports";
import { homeDict } from "./dashboard.i18n";

function PipelineCards() {
  const d = useDict(homeDict);
  const leads = useLeads().data?.payload ?? [];
  const active = leads.filter(
    (l) => l.stage === "PROPOSAL" || l.stage === "NEGOTIATION",
  ).length;
  const signed = leads.filter((l) => l.stage === "SIGNED").length;
  return (
    <>
      <StatCard tone="teal" value={active} label={d.stActive} />
      <StatCard tone="success" value={signed} label={d.stSigned} />
    </>
  );
}

function SupportCard() {
  const d = useDict(homeDict);
  const router = useRouter();
  const tickets = useTickets().data?.payload ?? [];
  const open = tickets.filter((t) => t.status !== "RESOLVED").length;
  return (
    <StatCard
      tone={open > 0 ? "danger" : "teal"}
      value={open}
      label={d.stOpenTickets}
      onClick={() => router.push("/dashboard/support")}
    />
  );
}

function FinanceCards() {
  const d = useDict(homeDict);
  const router = useRouter();
  const ledger = useLedger().data?.payload ?? [];
  const requests = useRequests().data?.payload ?? [];
  const net = ledger
    .filter((l) => l.currency === "IQD")
    .reduce((s, l) => s + (l.type === "INCOME" ? 1 : -1) * Number(l.amount || 0), 0);
  const pending = requests.filter((r) => r.status === "PENDING").length;
  return (
    <>
      <StatCard tone="teal" value={fmtNumber(net)} label={d.stBalance} />
      <StatCard
        tone={pending > 0 ? "danger" : "teal"}
        value={pending}
        label={d.stPending}
        onClick={() => router.push("/dashboard/finance?tab=requests")}
      />
    </>
  );
}

function ReportsCard() {
  const d = useDict(homeDict);
  const reports = useReports().data?.payload ?? [];
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const cnt = reports.filter(
    (r) => new Date(r.date + "T00:00:00").getTime() >= weekAgo,
  ).length;
  return <StatCard tone="primary" value={cnt} label={d.stReports} />;
}

function PipelineStageSummary() {
  const d = useDict(homeDict);
  const L = useLabels();
  const router = useRouter();
  const leads = useLeads().data?.payload ?? [];
  const counts = PIPELINE_STAGES.reduce(
    (acc, s) => {
      acc[s] = leads.filter((l) => l.stage === s).length;
      return acc;
    },
    {} as Record<PipelineStage, number>,
  );
  const nearest = [...leads]
    .filter((l) => l.nextDate)
    .sort((a, b) => (b.nextDate || "").localeCompare(a.nextDate || ""))
    .slice(0, 5);

  return (
    <div className="mt-6">
      <div className="mb-3 text-sm font-bold text-foreground">{d.stageTitle}</div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {PIPELINE_STAGES.map((s) => (
          <StatCard
            key={s}
            tone={PIPELINE_STAGE_TONE[s]}
            value={counts[s]}
            label={L.pipelineStage[s]}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => router.push("/dashboard/pipeline")}
        className="mb-3 text-sm font-bold text-foreground transition-colors hover:text-primary"
      >
        {d.nearest}
      </button>
      {nearest.length === 0 ? (
        <EmptyState>{d.noLeads}</EmptyState>
      ) : (
        <div className="flex flex-col gap-2">
          {nearest.map((l) => (
            <div
              key={l.id}
              className="surface-raised flex flex-wrap items-center gap-2.5 rounded-lg border border-border px-3.5 py-2.5 text-[13px]"
            >
              <StatusBadge tone={PIPELINE_STAGE_TONE[l.stage]}>
                {L.pipelineStage[l.stage]}
              </StatusBadge>
              <strong>{l.company}</strong>
              <span className="text-muted-foreground">— {l.nextAction || d.noStep}</span>
              {l.nextDate && (
                <span className="ms-auto text-muted-foreground">{l.nextDate}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardHome() {
  const t = useTranslations("dash");
  const d = useDict(homeDict);
  const can = useCan();
  const { data: me } = useMe();
  const name = me?.payload?.name;

  return (
    <>
      <PageHeader title={t("dashboard.title")} subtitle={t("dashboard.subtitle")} />
      <div className="mb-4 text-sm text-muted-foreground">
        {name ? d.greeting.replace("{name}", name) : d.greetingNoName}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {can(PERMISSIONS.VIEW_PIPELINE) && <PipelineCards />}
        {can(PERMISSIONS.VIEW_SUPPORT) && <SupportCard />}
        {can(PERMISSIONS.VIEW_FINANCE) && <FinanceCards />}
        <ReportsCard />
      </div>
      {can(PERMISSIONS.VIEW_PIPELINE) && <PipelineStageSummary />}
    </>
  );
}
