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
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useMe } from "@/hooks/useMe";
import { useUsers } from "@/hooks/useUsers";
import {
  useCreateReport,
  useSaveReport,
  useDeleteReport,
} from "@/hooks/useReports";
import type { ReportDto } from "@/services/reports";
import { reportsDict } from "./reports.i18n";

type FormState = {
  date: string;
  employeeId: string; // "" = unassigned
  done: string;
  ongoing: string;
  blockers: string;
  plan: string;
};

function fromReport(report: ReportDto | null): FormState {
  return {
    date: report?.date ?? todayStr(),
    employeeId: report?.employeeId != null ? String(report.employeeId) : "",
    done: report?.done ?? "",
    ongoing: report?.ongoing ?? "",
    blockers: report?.blockers ?? "",
    plan: report?.plan ?? "",
  };
}

export function ReportModal({
  editing,
  onClose,
}: {
  editing: ReportDto | null;
  onClose: () => void;
}) {
  const d = useDict(reportsDict);
  const L = useLabels();
  const can = useCan();
  const canAll = can(PERMISSIONS.VIEW_REPORTS_ALL);
  const { data: me } = useMe();
  const { data: usersData } = useUsers(canAll);
  const users = usersData?.payload ?? [];

  const [f, setF] = useState<FormState>(fromReport(editing));
  const set = (k: keyof FormState, v: string) =>
    setF((prev) => ({ ...prev, [k]: toEnDigits(v) }));

  const done = (msg: string) => {
    toast.success(msg);
    onClose();
  };
  const create = useCreateReport(done);
  const save = useSaveReport(done);
  const remove = useDeleteReport(done);
  const busy = create.isPending || save.isPending || remove.isPending;

  const submit = () => {
    const payload = {
      date: f.date,
      employeeId: f.employeeId ? Number(f.employeeId) : null,
      done: f.done || null,
      ongoing: f.ongoing || null,
      blockers: f.blockers || null,
      plan: f.plan || null,
    };
    if (editing) save.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? d.editReport : d.newReport}
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
          <Button size="sm" disabled={busy || !f.date} onClick={submit}>
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
              autoFocus
            />
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
        <Field label={d.fDone}>
          <Textarea value={f.done} onChange={(e) => set("done", e.target.value)} />
        </Field>
        <Field label={d.fOngoing}>
          <Textarea
            value={f.ongoing}
            onChange={(e) => set("ongoing", e.target.value)}
          />
        </Field>
        <Field label={d.fBlockers}>
          <Textarea
            value={f.blockers}
            onChange={(e) => set("blockers", e.target.value)}
          />
        </Field>
        <Field label={d.fPlan}>
          <Textarea value={f.plan} onChange={(e) => set("plan", e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
