"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Button,
  Field,
  Input,
  Modal,
  NativeSelect,
} from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { toEnDigits } from "@/lib/dashboard/format";
import { ROLES, type Role } from "@/lib/rbac/permissions";
import { useCreateUser, useSaveUser } from "@/hooks/useUsers";
import type { UserDto } from "@/services/users";
import { usersDict } from "./users.i18n";

type FormState = {
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

function fromUser(user: UserDto | null): FormState {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "EMPLOYEE",
    active: user?.active ?? true,
  };
}

export function UsersModal({
  editing,
  onClose,
}: {
  editing: UserDto | null;
  onClose: () => void;
}) {
  const d = useDict(usersDict);
  const L = useLabels();

  const [f, setF] = useState<FormState>(fromUser(editing));
  const set = (k: "name" | "email", v: string) =>
    setF((prev) => ({ ...prev, [k]: toEnDigits(v) }));

  const done = (msg: string) => {
    toast.success(msg);
    onClose();
  };
  const create = useCreateUser(done);
  const save = useSaveUser(done);
  const busy = create.isPending || save.isPending;

  const submit = () => {
    const payload = {
      name: f.name.trim(),
      email: f.email.trim(),
      role: f.role,
      active: f.active,
    };
    if (editing) save.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? d.editUser : d.newUser}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            {L.actions.cancel}
          </Button>
          <Button
            size="sm"
            disabled={busy || !f.name.trim() || !f.email.trim()}
            onClick={submit}
          >
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
        <Field label={d.fEmail} hint={d.emailHint}>
          <Input
            type="email"
            value={f.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder={d.emailPh}
          />
        </Field>
        <Field label={d.fRole}>
          <NativeSelect
            value={f.role}
            onChange={(e) =>
              setF((prev) => ({ ...prev, role: e.target.value as Role }))
            }
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {L.role[r]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label={d.fActive} hint={d.activeHint}>
          <button
            type="button"
            role="switch"
            aria-checked={f.active}
            onClick={() => setF((prev) => ({ ...prev, active: !prev.active }))}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              f.active ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-overlay shadow transition-all ${
                f.active ? "end-0.5" : "start-0.5"
              }`}
            />
          </button>
        </Field>
      </div>
    </Modal>
  );
}
