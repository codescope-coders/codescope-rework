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
import { toEnDigits } from "@/lib/dashboard/format";
import { PROJECT_STAGES } from "@/lib/dashboard/constants";
import { useUsers } from "@/hooks/useUsers";
import { useServers } from "@/hooks/useServers";
import {
  useCreateProject,
  useSaveProject,
  useDeleteProject,
} from "@/hooks/useProjects";
import type { ProjectDto } from "@/services/projects";
import { projectsDict } from "./projects.i18n";

type FormState = {
  company: string;
  systemName: string;
  contact: string;
  phone: string;
  domain: string;
  stage: string;
  assignedToId: string; // "" = unassigned
  developerId: string;
  designerId: string;
  serverId: string;
  brandFile: string;
  startDate: string;
  notes: string;
};

function fromProject(project: ProjectDto | null): FormState {
  return {
    company: project?.company ?? "",
    systemName: project?.systemName ?? "",
    contact: project?.contact ?? "",
    phone: project?.phone ?? "",
    domain: project?.domain ?? "",
    stage: project?.stage ?? "DOMAIN",
    assignedToId: project?.assignedToId != null ? String(project.assignedToId) : "",
    developerId: project?.developerId != null ? String(project.developerId) : "",
    designerId: project?.designerId != null ? String(project.designerId) : "",
    serverId: project?.serverId != null ? String(project.serverId) : "",
    brandFile: project?.brandFile ?? "",
    startDate: project?.startDate ?? "",
    notes: project?.notes ?? "",
  };
}

export function ProjectsModal({
  editing,
  onClose,
}: {
  editing: ProjectDto | null;
  onClose: () => void;
}) {
  const d = useDict(projectsDict);
  const L = useLabels();
  const { data: usersData } = useUsers();
  const users = usersData?.payload ?? [];
  const { data: serversData } = useServers();
  const servers = serversData?.payload ?? [];

  // Prefer role-scoped lists for the dev/designer pickers; fall back to everyone.
  const developers = users.filter((u) => u.role === "DEVELOPER");
  const designers = users.filter((u) => u.role === "DESIGNER");
  const devOptions = developers.length ? developers : users;
  const desOptions = designers.length ? designers : users;

  const [f, setF] = useState<FormState>(fromProject(editing));
  const set = (k: keyof FormState, v: string) =>
    setF((prev) => ({ ...prev, [k]: toEnDigits(v) }));

  const done = (msg: string) => {
    toast.success(msg);
    onClose();
  };
  const create = useCreateProject(done);
  const save = useSaveProject(done);
  const remove = useDeleteProject(done);
  const busy = create.isPending || save.isPending || remove.isPending;

  const submit = () => {
    const payload = {
      company: f.company.trim(),
      systemName: f.systemName || null,
      contact: f.contact || null,
      phone: f.phone || null,
      domain: f.domain || null,
      stage: f.stage as ProjectDto["stage"],
      assignedToId: f.assignedToId ? Number(f.assignedToId) : null,
      developerId: f.developerId ? Number(f.developerId) : null,
      designerId: f.designerId ? Number(f.designerId) : null,
      serverId: f.serverId ? Number(f.serverId) : null,
      brandFile: f.brandFile || null,
      startDate: f.startDate || null,
      notes: f.notes || null,
    };
    if (editing) save.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? d.editProject : d.newProject}
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
          <Button size="sm" disabled={busy || !f.company.trim()} onClick={submit}>
            {L.actions.save}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label={d.fCompany}>
          <Input
            value={f.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder={d.companyPh}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fSystemName}>
            <Input
              value={f.systemName}
              onChange={(e) => set("systemName", e.target.value)}
              placeholder={d.systemNamePh}
            />
          </Field>
          <Field label={d.fDomain}>
            <Input
              value={f.domain}
              onChange={(e) => set("domain", e.target.value)}
              placeholder={d.domainPh}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fContact}>
            <Input
              value={f.contact}
              onChange={(e) => set("contact", e.target.value)}
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
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fStage}>
            <NativeSelect
              value={f.stage}
              onChange={(e) => set("stage", e.target.value)}
            >
              {PROJECT_STAGES.map((s) => (
                <option key={s} value={s}>
                  {L.projectStage[s]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={d.fAssignedTo}>
            <NativeSelect
              value={f.assignedToId}
              onChange={(e) => set("assignedToId", e.target.value)}
            >
              <option value="">{d.unassigned}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fDeveloper}>
            <NativeSelect
              value={f.developerId}
              onChange={(e) => set("developerId", e.target.value)}
            >
              <option value="">{d.unassigned}</option>
              {devOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={d.fDesigner}>
            <NativeSelect
              value={f.designerId}
              onChange={(e) => set("designerId", e.target.value)}
            >
              <option value="">{d.unassigned}</option>
              {desOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fServer}>
            <NativeSelect
              value={f.serverId}
              onChange={(e) => set("serverId", e.target.value)}
            >
              <option value="">{d.noServer}</option>
              {servers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={d.fStartDate}>
            <Input
              type="date"
              value={f.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </Field>
        </div>
        <Field label={d.fBrandFile}>
          <Input
            value={f.brandFile}
            onChange={(e) => set("brandFile", e.target.value)}
          />
        </Field>
        <Field label={d.fNotes}>
          <Textarea
            value={f.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}
