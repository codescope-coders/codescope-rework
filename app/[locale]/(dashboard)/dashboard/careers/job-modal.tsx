"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
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
import { queryClient } from "@/lib/queryClientProvider";
import { jobStatusEnum, jobTypeEnum } from "@/lib/db/schema";
import { useCreateJob, useEditJob } from "@/hooks/useJobs";
import type { JobDto, JobStatus, JobTypes } from "@/services/jobs";
import { careersDict } from "./careers.i18n";

/** Theme-aware tag/list editor (requirements, responsibilities). */
function ListField({
  label,
  placeholder,
  items,
  onChange,
}: {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (next: string[]) => void;
}) {
  const [value, setValue] = useState("");
  const add = () => {
    const v = value.trim();
    if (!v) return;
    onChange([v, ...items]);
    setValue("");
  };
  return (
    <Field label={label}>
      <div className="relative">
        <Input
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          className="pe-10"
        />
        <button
          type="button"
          onClick={add}
          disabled={!value.trim()}
          className="absolute end-1 top-1 grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-40"
        >
          <Plus className="size-4" />
        </button>
      </div>
      {items.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-[13px] text-foreground"
            >
              <span className="min-w-0 flex-1 truncate">{item}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive-500/10 hover:text-destructive-600"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Field>
  );
}

export function JobModal({
  editing,
  onClose,
}: {
  editing: JobDto | null;
  onClose: () => void;
}) {
  const d = useDict(careersDict);
  const isEdit = Boolean(editing);

  const [position, setPosition] = useState(editing?.position ?? "");
  const [type, setType] = useState<JobTypes>(editing?.type ?? "FULL_TIME");
  const [status, setStatus] = useState<JobStatus>(editing?.status ?? "AVAILABLE");
  const [location, setLocation] = useState(editing?.location ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [requirements, setRequirements] = useState<string[]>(editing?.requirements ?? []);
  const [responsibilities, setResponsibilities] = useState<string[]>(
    editing?.responsibilities ?? [],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["jobs"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  };
  const create = useCreateJob((m) => {
    toast.success(m);
    invalidate();
    onClose();
  });
  const edit = useEditJob(editing?.id ?? 0, (m) => {
    toast.success(m);
    invalidate();
    onClose();
  });
  const busy = create.isPending || edit.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position.trim()) return toast.error(d.posReq);
    if (requirements.length === 0) return toast.error(d.reqReq);
    const payload = {
      position: position.trim(),
      type,
      status,
      location: location.trim(),
      description: description.trim(),
      requirements,
      responsibilities,
    };
    if (isEdit) edit.mutate(payload);
    else create.mutate(payload);
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={isEdit ? d.editJobTitle : d.newJobTitle}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            {d.cancel}
          </Button>
          <Button form="job-form" type="submit" disabled={busy}>
            {busy ? (isEdit ? d.saving : d.creating) : isEdit ? d.save : d.create}
          </Button>
        </>
      }
    >
      <form id="job-form" onSubmit={submit} className="flex flex-col gap-4">
        <Field label={d.fPosition}>
          <Input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder={d.phPosition}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={d.fType}>
            <NativeSelect
              value={type}
              onChange={(e) => setType(e.target.value as JobTypes)}
            >
              {jobTypeEnum.enumValues.map((v) => (
                <option key={v} value={v}>
                  {d.jobType[v]}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label={d.fStatus}>
            <NativeSelect
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
            >
              {jobStatusEnum.enumValues.map((v) => (
                <option key={v} value={v}>
                  {d.jobStatus[v]}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>

        <Field label={d.fLocation}>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={d.phLocation}
          />
        </Field>

        <Field label={d.fDescription}>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={d.phDescription}
            className="min-h-[84px]"
          />
        </Field>

        <ListField
          label={d.fRequirements}
          placeholder={d.addRequirement}
          items={requirements}
          onChange={setRequirements}
        />
        <ListField
          label={d.fResponsibilities}
          placeholder={d.addResponsibility}
          items={responsibilities}
          onChange={setResponsibilities}
        />
      </form>
    </Modal>
  );
}
