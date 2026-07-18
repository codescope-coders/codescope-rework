"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Code2, Globe, Palette, Server, FileText, User } from "lucide-react";
import {
  Button,
  EmptyState,
  PageHeader,
  Spinner,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import {
  PROJECT_STAGES,
  PROJECT_STAGE_TONE,
  type ProjectStage,
} from "@/lib/dashboard/constants";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useProjects, useSaveProject } from "@/hooks/useProjects";
import type { ProjectDto } from "@/services/projects";
import { projectsDict } from "./projects.i18n";
import { ProjectsModal } from "./projects-modal";

export default function ProjectsPage() {
  const t = useTranslations("dash");
  const d = useDict(projectsDict);
  const L = useLabels();
  const can = useCan();
  const canManage = can(PERMISSIONS.MANAGE_PROJECTS);

  const { data, isLoading } = useProjects();
  const projects = data?.payload ?? [];
  const save = useSaveProject((m) => toast.success(m));

  const [modal, setModal] = useState<{ editing: ProjectDto | null } | null>(null);

  const move = (project: ProjectDto, stage: ProjectStage) =>
    save.mutate({ id: project.id, data: { stage } });

  const total = projects.length;
  const delivered = projects.filter((p) => p.stage === "DELIVERY").length;
  const inProgress = total - delivered;

  return (
    <>
      <PageHeader
        title={t("nav.projects")}
        subtitle={canManage ? d.subtitle : d.subtitleView}
        action={
          canManage && (
            <Button onClick={() => setModal({ editing: null })}>
              + {d.addProject}
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Spinner /> ...
        </div>
      ) : projects.length === 0 ? (
        <EmptyState>{d.empty}</EmptyState>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard value={total} label={d.statTotal} tone="primary" />
            <StatCard value={inProgress} label={d.statInProgress} tone="info" />
            <StatCard value={delivered} label={d.statDelivered} tone="success" />
          </div>

          <div className="flex gap-3.5 overflow-x-auto pb-3">
            {PROJECT_STAGES.map((stage) => {
              const items = projects.filter((p) => p.stage === stage);
              return (
                <div key={stage} className="w-[264px] shrink-0">
                  <div className="mb-2.5 flex items-center justify-between px-1">
                    <StatusBadge tone={PROJECT_STAGE_TONE[stage]}>
                      {L.projectStage[stage]}
                    </StatusBadge>
                    <span className="rounded-full bg-muted px-2 text-[11px] font-semibold text-muted-foreground">
                      {items.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {items.map((project) => {
                      const idx = PROJECT_STAGES.indexOf(
                        project.stage as ProjectStage,
                      );
                      const nextStage =
                        idx >= 0 && idx < PROJECT_STAGES.length - 1
                          ? PROJECT_STAGES[idx + 1]
                          : null;
                      const showDevTeam =
                        project.stage === "DEV_HANDOFF" ||
                        project.stage === "DEVELOPMENT";

                      const cardBody = (
                        <>
                          <div className="mb-1 text-[13.5px] font-bold text-foreground">
                            {project.company}
                          </div>
                          {project.systemName && (
                            <div className="mb-0.5 text-[11.5px] text-muted-foreground">
                              {project.systemName}
                            </div>
                          )}
                          {project.domain && (
                            <div className="mb-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                              <Globe className="size-3" /> {project.domain}
                            </div>
                          )}
                          {project.assignedToName && (
                            <div className="mb-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                              <User className="size-3" /> {project.assignedToName}
                            </div>
                          )}
                          {showDevTeam && project.developerName && (
                            <div className="mb-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                              <Code2 className="size-3" /> {project.developerName}
                            </div>
                          )}
                          {showDevTeam && project.designerName && (
                            <div className="mb-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                              <Palette className="size-3" /> {project.designerName}
                            </div>
                          )}
                          {project.stage === "BRAND_READY" && project.brandFile && (
                            <div className="mb-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                              <FileText className="size-3" /> {project.brandFile}
                            </div>
                          )}
                          {project.stage === "DELIVERY" && project.serverName && (
                            <div className="mb-0.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                              <Server className="size-3" /> {project.serverName}
                            </div>
                          )}
                        </>
                      );

                      return (
                        <div
                          key={project.id}
                          className="surface-raised rounded-xl border border-border transition-shadow hover:shadow-md"
                        >
                          {canManage ? (
                            <button
                              type="button"
                              onClick={() => setModal({ editing: project })}
                              className="w-full px-3.5 pb-2.5 pt-3 text-start"
                            >
                              {cardBody}
                            </button>
                          ) : (
                            <div className="w-full px-3.5 pb-2.5 pt-3 text-start">
                              {cardBody}
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-dashed border-border px-3.5 py-2">
                            <span className="grid size-5 place-items-center rounded-full bg-primary/12 text-[10px] font-bold text-primary">
                              {(project.assignedToName || project.company || "؟").slice(
                                0,
                                1,
                              )}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {project.startDate || "—"}
                            </span>
                          </div>

                          {canManage && nextStage && (
                            <div className="px-3 pb-3">
                              <Button
                                variant="success"
                                size="sm"
                                className="w-full"
                                disabled={save.isPending}
                                onClick={() => move(project, nextStage)}
                              >
                                {d.advanceTo.replace(
                                  "{stage}",
                                  L.projectStage[nextStage],
                                )}
                              </Button>
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
        </>
      )}

      {modal && (
        <ProjectsModal editing={modal.editing} onClose={() => setModal(null)} />
      )}
    </>
  );
}
