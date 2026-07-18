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
import {
  PIPELINE_STAGES,
  PACKAGE_TIERS,
  BILLING_CYCLES,
} from "@/lib/dashboard/constants";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useMe } from "@/hooks/useMe";
import { useUsers } from "@/hooks/useUsers";
import {
  useCreateLead,
  useSaveLead,
  useDeleteLead,
} from "@/hooks/usePipeline";
import type { LeadDto } from "@/services/pipeline";
import { pipelineDict } from "./pipeline.i18n";

type FormState = {
  company: string;
  contact: string;
  phone: string;
  address: string;
  stage: string;
  package: string;
  cycle: string;
  employeeId: string; // "" = unassigned
  nextAction: string;
  nextDate: string;
  notes: string;
};

function fromLead(lead: LeadDto | null): FormState {
  return {
    company: lead?.company ?? "",
    contact: lead?.contact ?? "",
    phone: lead?.phone ?? "",
    address: lead?.address ?? "",
    stage: lead?.stage ?? "INITIAL_CONTACT",
    package: lead?.package ?? "STANDARD",
    cycle: lead?.cycle ?? "MONTHLY",
    employeeId: lead?.employeeId != null ? String(lead.employeeId) : "",
    nextAction: lead?.nextAction ?? "",
    nextDate: lead?.nextDate ?? "",
    notes: lead?.notes ?? "",
  };
}

export function PipelineModal({
  editing,
  onClose,
}: {
  editing: LeadDto | null;
  onClose: () => void;
}) {
  const d = useDict(pipelineDict);
  const L = useLabels();
  const can = useCan();
  const canAll = can(PERMISSIONS.VIEW_PIPELINE_ALL);
  const { data: me } = useMe();
  const { data: usersData } = useUsers(canAll);
  const users = usersData?.payload ?? [];

  const [f, setF] = useState<FormState>(fromLead(editing));
  const set = (k: keyof FormState, v: string) =>
    setF((prev) => ({ ...prev, [k]: toEnDigits(v) }));

  const done = (msg: string) => {
    toast.success(msg);
    onClose();
  };
  const create = useCreateLead(done);
  const save = useSaveLead(done);
  const remove = useDeleteLead(done);
  const busy = create.isPending || save.isPending || remove.isPending;

  const submit = () => {
    const payload = {
      company: f.company.trim(),
      contact: f.contact || null,
      phone: f.phone || null,
      address: f.address || null,
      stage: f.stage as LeadDto["stage"],
      package: f.package as LeadDto["package"],
      cycle: f.cycle as LeadDto["cycle"],
      employeeId: f.employeeId ? Number(f.employeeId) : null,
      nextAction: f.nextAction || null,
      nextDate: f.nextDate || null,
      notes: f.notes || null,
    };
    if (editing) save.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? d.editLead : d.newLead}
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
            disabled={busy || !f.company.trim()}
            onClick={submit}
          >
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
          <Field label={d.fContact}>
            <Input value={f.contact} onChange={(e) => set("contact", e.target.value)} />
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
          <Field label={d.fStage}>
            <NativeSelect value={f.stage} onChange={(e) => set("stage", e.target.value)}>
              {PIPELINE_STAGES.map((s) => (
                <option key={s} value={s}>
                  {L.pipelineStage[s]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={d.fEmployee}>
            {canAll ? (
              <NativeSelect
                value={f.employeeId}
                onChange={(e) => set("employeeId", e.target.value)}
              >
                <option value="">{d.unassigned}</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email}
                  </option>
                ))}
              </NativeSelect>
            ) : (
              <Input value={me?.payload?.name || d.you} disabled />
            )}
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fPackage}>
            <NativeSelect value={f.package} onChange={(e) => set("package", e.target.value)}>
              {PACKAGE_TIERS.map((p) => (
                <option key={p} value={p}>
                  {L.packageTier[p]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={d.fCycle}>
            <NativeSelect value={f.cycle} onChange={(e) => set("cycle", e.target.value)}>
              {BILLING_CYCLES.map((c) => (
                <option key={c} value={c}>
                  {L.billingCycle[c]}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        <p className="rounded-lg bg-primary/8 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          {d.autoSub}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fNextAction}>
            <Input
              value={f.nextAction}
              onChange={(e) => set("nextAction", e.target.value)}
            />
          </Field>
          <Field label={d.fNextDate}>
            <Input
              type="date"
              value={f.nextDate}
              onChange={(e) => set("nextDate", e.target.value)}
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
