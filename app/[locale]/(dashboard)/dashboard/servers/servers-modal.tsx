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
import { SERVER_STATUSES } from "@/lib/dashboard/constants";
import {
  useCreateServer,
  useSaveServer,
  useDeleteServer,
} from "@/hooks/useServers";
import type { ServerDto } from "@/services/servers";
import { serversDict } from "./servers.i18n";

type FormState = {
  name: string;
  provider: string;
  ip: string;
  specs: string;
  sysAdmin: string;
  status: string;
  notes: string;
};

function fromServer(server: ServerDto | null): FormState {
  return {
    name: server?.name ?? "",
    provider: server?.provider ?? "",
    ip: server?.ip ?? "",
    specs: server?.specs ?? "",
    sysAdmin: server?.sysAdmin ?? "",
    status: server?.status ?? "ACTIVE",
    notes: server?.notes ?? "",
  };
}

export function ServersModal({
  editing,
  onClose,
}: {
  editing: ServerDto | null;
  onClose: () => void;
}) {
  const d = useDict(serversDict);
  const L = useLabels();

  const [f, setF] = useState<FormState>(fromServer(editing));
  const set = (k: keyof FormState, v: string) =>
    setF((prev) => ({ ...prev, [k]: toEnDigits(v) }));

  const done = (msg: string) => {
    toast.success(msg);
    onClose();
  };
  const create = useCreateServer(done);
  const save = useSaveServer(done);
  const remove = useDeleteServer(done);
  const busy = create.isPending || save.isPending || remove.isPending;

  const submit = () => {
    const payload = {
      name: f.name.trim(),
      provider: f.provider || null,
      ip: f.ip || null,
      specs: f.specs || null,
      sysAdmin: f.sysAdmin || null,
      status: f.status as ServerDto["status"],
      notes: f.notes || null,
    };
    if (editing) save.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? d.editServer : d.newServer}
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
          <Field label={d.fProvider}>
            <Input
              value={f.provider}
              onChange={(e) => set("provider", e.target.value)}
              placeholder={d.providerPh}
            />
          </Field>
          <Field label={d.fIp}>
            <Input
              value={f.ip}
              onChange={(e) => set("ip", e.target.value)}
              dir="ltr"
              className="text-start"
              placeholder="0.0.0.0"
            />
          </Field>
        </div>
        <Field label={d.fSpecs}>
          <Input
            value={f.specs}
            onChange={(e) => set("specs", e.target.value)}
            placeholder={d.specsPh}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fSysAdmin}>
            <Input
              value={f.sysAdmin}
              onChange={(e) => set("sysAdmin", e.target.value)}
            />
          </Field>
          <Field label={d.fStatus}>
            <NativeSelect
              value={f.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {SERVER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {L.serverStatus[s]}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        <Field label={d.fNotes}>
          <Textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
