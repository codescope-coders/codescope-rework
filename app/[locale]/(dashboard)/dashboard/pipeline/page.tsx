"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Phone, User } from "lucide-react";
import {
  Button,
  EmptyState,
  PageHeader,
  Spinner,
  StatusBadge,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import {
  PIPELINE_STAGES,
  POSITIVE_PIPELINE_FLOW,
  PIPELINE_STAGE_TONE,
  type PipelineStage,
} from "@/lib/dashboard/constants";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useLeads, useSaveLead } from "@/hooks/usePipeline";
import type { LeadDto } from "@/services/pipeline";
import { pipelineDict } from "./pipeline.i18n";
import { PipelineModal } from "./pipeline-modal";

export default function PipelinePage() {
  const t = useTranslations("dash");
  const d = useDict(pipelineDict);
  const L = useLabels();
  const can = useCan();
  const canAll = can(PERMISSIONS.VIEW_PIPELINE_ALL);
  const canManage = can(PERMISSIONS.MANAGE_PIPELINE);

  const { data, isLoading } = useLeads();
  const leads = data?.payload ?? [];
  const save = useSaveLead((m) => toast.success(m));

  const [modal, setModal] = useState<{ editing: LeadDto | null } | null>(null);

  const move = (lead: LeadDto, stage: PipelineStage) =>
    save.mutate({ id: lead.id, data: { stage } });

  return (
    <>
      <PageHeader
        title={t("nav.pipeline")}
        subtitle={canAll ? d.subtitleAll : d.subtitleOwn}
        action={
          canManage && (
            <Button onClick={() => setModal({ editing: null })}>
              + {d.addLead}
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Spinner /> ...
        </div>
      ) : leads.length === 0 ? (
        <EmptyState>{d.empty}</EmptyState>
      ) : (
        <div className="flex gap-3.5 overflow-x-auto pb-3">
          {PIPELINE_STAGES.map((stage) => {
            const items = leads.filter((l) => l.stage === stage);
            return (
              <div key={stage} className="w-[264px] shrink-0">
                <div className="mb-2.5 flex items-center justify-between px-1">
                  <StatusBadge tone={PIPELINE_STAGE_TONE[stage]}>
                    {L.pipelineStage[stage]}
                  </StatusBadge>
                  <span className="rounded-full bg-muted px-2 text-[11px] font-semibold text-muted-foreground">
                    {items.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {items.map((lead) => {
                    const idx = POSITIVE_PIPELINE_FLOW.indexOf(
                      lead.stage as PipelineStage,
                    );
                    const nextStage =
                      idx >= 0 && idx < POSITIVE_PIPELINE_FLOW.length - 1
                        ? POSITIVE_PIPELINE_FLOW[idx + 1]
                        : null;
                    const canReject =
                      lead.stage !== "REJECTED" && lead.stage !== "SIGNED";
                    return (
                      <div
                        key={lead.id}
                        className="surface-raised rounded-xl border border-border transition-shadow hover:shadow-md"
                      >
                        <button
                          type="button"
                          onClick={() => setModal({ editing: lead })}
                          className="w-full px-3.5 pb-2.5 pt-3 text-start"
                        >
                          <div className="mb-1 text-[13.5px] font-bold text-foreground">
                            {lead.company}
                          </div>
                          {lead.contact && (
                            <div className="mb-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                              <User className="size-3" /> {lead.contact}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="mb-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                              <Phone className="size-3" /> {lead.phone}
                            </div>
                          )}
                          {lead.nextAction && (
                            <div className="text-[11.5px] text-muted-foreground">
                              ← {lead.nextAction}
                            </div>
                          )}
                        </button>

                        <div className="flex items-center justify-between border-t border-dashed border-border px-3.5 py-2">
                          <span className="grid size-5 place-items-center rounded-full bg-primary/12 text-[10px] font-bold text-primary">
                            {(lead.employeeName || lead.company || "؟").slice(0, 1)}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {lead.nextDate || "—"}
                          </span>
                        </div>

                        {canManage && (nextStage || canReject) && (
                          <div className="flex gap-1.5 px-3 pb-3">
                            {nextStage && (
                              <Button
                                variant="success"
                                size="sm"
                                className="flex-1"
                                disabled={save.isPending}
                                onClick={() => move(lead, nextStage)}
                              >
                                {d.advanceTo.replace(
                                  "{stage}",
                                  L.pipelineStage[nextStage],
                                )}
                              </Button>
                            )}
                            {canReject && (
                              <Button
                                variant="danger"
                                size="sm"
                                disabled={save.isPending}
                                onClick={() => move(lead, "REJECTED")}
                              >
                                {d.reject}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-[11.5px] text-muted-foreground">
                      {d.emptyCol}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <PipelineModal editing={modal.editing} onClose={() => setModal(null)} />
      )}
    </>
  );
}
