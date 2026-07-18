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
import { leaveDays, toEnDigits } from "@/lib/dashboard/format";
import { LEAVE_TYPES } from "@/lib/dashboard/constants";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useMe } from "@/hooks/useMe";
import { useUsers } from "@/hooks/useUsers";
import { useCreateLeave } from "@/hooks/useLeaves";
import type { CreateLeaveDto, LeaveType } from "@/services/leaves";
import { leavesDict } from "./leaves.i18n";

type FormState = {
  employeeId: string; // "" = current user (server forces self for non-all)
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
};

const emptyForm: FormState = {
  employeeId: "",
  type: "REGULAR",
  startDate: "",
  endDate: "",
  reason: "",
};

export function LeavesModal({ onClose }: { onClose: () => void }) {
  const d = useDict(leavesDict);
  const L = useLabels();
  const can = useCan();
  const canAll = can(PERMISSIONS.VIEW_LEAVES_ALL);
  const { data: me } = useMe();
  const { data: usersData } = useUsers(canAll);
  const users = usersData?.payload ?? [];

  const [f, setF] = useState<FormState>(emptyForm);
  const set = (k: keyof FormState, v: string) =>
    setF((prev) => ({ ...prev, [k]: toEnDigits(v) }));

  const done = (msg: string) => {
    toast.success(msg);
    onClose();
  };
  const create = useCreateLeave(done);
  const busy = create.isPending;

  const days =
    f.startDate && f.endDate ? leaveDays(f.startDate, f.endDate) : 0;

  const submit = () => {
    const payload: CreateLeaveDto = {
      employeeId: f.employeeId ? Number(f.employeeId) : null,
      type: f.type as LeaveType,
      startDate: f.startDate,
      endDate: f.endDate,
      reason: f.reason || null,
    };
    create.mutate(payload);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={d.requestTitle}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            {L.actions.cancel}
          </Button>
          <Button
            size="sm"
            disabled={busy || !f.startDate || !f.endDate}
            onClick={submit}
          >
            {L.actions.save}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label={d.fEmployee}>
          {canAll ? (
            <NativeSelect
              value={f.employeeId}
              onChange={(e) => set("employeeId", e.target.value)}
            >
              <option value="">{d.pickEmployee}</option>
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

        <Field label={d.fType}>
          <NativeSelect
            value={f.type}
            onChange={(e) => set("type", e.target.value)}
          >
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>
                {L.leaveType[t]}
              </option>
            ))}
          </NativeSelect>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={d.fStart}>
            <Input
              type="date"
              value={f.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </Field>
          <Field label={d.fEnd}>
            <Input
              type="date"
              value={f.endDate}
              onChange={(e) => set("endDate", e.target.value)}
            />
          </Field>
        </div>

        {days > 0 && (
          <p className="rounded-lg bg-primary/8 px-3 py-2 text-[11px] text-muted-foreground">
            {d.durationLabel}{" "}
            <span className="font-bold text-foreground">{days}</span>{" "}
            {d.daysUnit}
          </p>
        )}

        <Field label={d.fReason}>
          <Textarea
            value={f.reason}
            onChange={(e) => set("reason", e.target.value)}
            placeholder={d.reasonPh}
          />
        </Field>
      </div>
    </Modal>
  );
}
