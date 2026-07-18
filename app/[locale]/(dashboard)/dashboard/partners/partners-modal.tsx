"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button, Field, Input, Modal, Textarea } from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { toEnDigits } from "@/lib/dashboard/format";
import {
  useCreatePartner,
  useSavePartner,
  useDeletePartner,
} from "@/hooks/usePartners";
import type { PartnerDto } from "@/services/partners";
import { partnersDict } from "./partners.i18n";

type FormState = {
  name: string;
  percentage: string;
  phone: string;
  joinDate: string;
  notes: string;
};

function fromPartner(partner: PartnerDto | null): FormState {
  return {
    name: partner?.name ?? "",
    percentage: partner != null ? String(partner.percentage) : "",
    phone: partner?.phone ?? "",
    joinDate: partner?.joinDate ?? "",
    notes: partner?.notes ?? "",
  };
}

export function PartnerModal({
  editing,
  onClose,
}: {
  editing: PartnerDto | null;
  onClose: () => void;
}) {
  const d = useDict(partnersDict);
  const L = useLabels();

  const [f, setF] = useState<FormState>(fromPartner(editing));
  const set = (k: keyof FormState, v: string) =>
    setF((prev) => ({ ...prev, [k]: toEnDigits(v) }));

  const done = (msg: string) => {
    toast.success(msg);
    onClose();
  };
  const create = useCreatePartner(done);
  const save = useSavePartner(done);
  const remove = useDeletePartner(done);
  const busy = create.isPending || save.isPending || remove.isPending;

  const submit = () => {
    const payload = {
      name: f.name.trim(),
      percentage: f.percentage ? Number(f.percentage) : 0,
      phone: f.phone || null,
      joinDate: f.joinDate || null,
      notes: f.notes || null,
    };
    if (editing) save.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? d.editPartner : d.newPartner}
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
          <Button size="sm" disabled={busy || !f.name.trim()} onClick={submit}>
            {L.actions.save}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label={d.fName}>
          <Input
            value={f.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={d.namePh}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fPercentage}>
            <Input
              type="number"
              value={f.percentage}
              onChange={(e) => set("percentage", e.target.value)}
              placeholder="0"
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
        <Field label={d.fJoinDate}>
          <Input
            type="date"
            value={f.joinDate}
            onChange={(e) => set("joinDate", e.target.value)}
          />
        </Field>
        <Field label={d.fNotes}>
          <Textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
