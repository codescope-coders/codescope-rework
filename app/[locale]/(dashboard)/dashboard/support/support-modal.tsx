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
import { toEnDigits, todayStr } from "@/lib/dashboard/format";
import { TICKET_STATUSES, TICKET_PRIORITIES } from "@/lib/dashboard/constants";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useMe } from "@/hooks/useMe";
import { useUsers } from "@/hooks/useUsers";
import {
  useCreateTicket,
  useSaveTicket,
  useDeleteTicket,
} from "@/hooks/useTickets";
import type { TicketDto } from "@/services/support";
import { supportDict } from "./support.i18n";

type FormState = {
  date: string;
  company: string;
  phone: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  assignedToId: string; // "" = unassigned
  notes: string;
};

function fromTicket(ticket: TicketDto | null): FormState {
  return {
    date: ticket?.date ?? todayStr(),
    company: ticket?.company ?? "",
    phone: ticket?.phone ?? "",
    subject: ticket?.subject ?? "",
    description: ticket?.description ?? "",
    priority: ticket?.priority ?? "MEDIUM",
    status: ticket?.status ?? "OPEN",
    assignedToId: ticket?.assignedToId != null ? String(ticket.assignedToId) : "",
    notes: ticket?.notes ?? "",
  };
}

export function SupportModal({
  editing,
  onClose,
}: {
  editing: TicketDto | null;
  onClose: () => void;
}) {
  const d = useDict(supportDict);
  const L = useLabels();
  const can = useCan();
  const canAll = can(PERMISSIONS.VIEW_SUPPORT_ALL);
  const { data: me } = useMe();
  const { data: usersData } = useUsers(canAll);
  const users = usersData?.payload ?? [];

  const [f, setF] = useState<FormState>(fromTicket(editing));
  const set = (k: keyof FormState, v: string) =>
    setF((prev) => ({ ...prev, [k]: toEnDigits(v) }));

  const done = (msg: string) => {
    toast.success(msg);
    onClose();
  };
  const create = useCreateTicket(done);
  const save = useSaveTicket(done);
  const remove = useDeleteTicket(done);
  const busy = create.isPending || save.isPending || remove.isPending;

  const submit = () => {
    const payload = {
      date: f.date || todayStr(),
      company: f.company.trim(),
      phone: f.phone || null,
      subject: f.subject.trim(),
      description: f.description || null,
      priority: f.priority as TicketDto["priority"],
      status: f.status as TicketDto["status"],
      assignedToId: f.assignedToId ? Number(f.assignedToId) : null,
      notes: f.notes || null,
    };
    if (editing) save.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? d.editTicket : d.newTicket}
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
            disabled={busy || !f.company.trim() || !f.subject.trim()}
            onClick={submit}
          >
            {L.actions.save}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fDate}>
            <Input
              type="date"
              value={f.date}
              onChange={(e) => set("date", e.target.value)}
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
        <Field label={d.fCompany}>
          <Input
            value={f.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder={d.companyPh}
            autoFocus
          />
        </Field>
        <Field label={d.fSubject}>
          <Input
            value={f.subject}
            onChange={(e) => set("subject", e.target.value)}
            placeholder={d.subjectPh}
          />
        </Field>
        <Field label={d.fDescription}>
          <Textarea
            value={f.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fPriority}>
            <NativeSelect
              value={f.priority}
              onChange={(e) => set("priority", e.target.value)}
            >
              {TICKET_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {L.ticketPriority[p]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={d.fStatus}>
            <NativeSelect
              value={f.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {TICKET_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {L.ticketStatus[s]}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        <Field label={d.fAssignee}>
          {canAll ? (
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
          ) : (
            <Input value={me?.payload?.name || d.you} disabled />
          )}
        </Field>
        <Field label={d.fNotes}>
          <Textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
