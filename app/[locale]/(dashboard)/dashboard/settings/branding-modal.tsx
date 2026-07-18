"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button, Field, Input, Modal } from "@/components/dashboard/ui";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { toEnDigits } from "@/lib/dashboard/format";
import { useUpdateBranding } from "@/hooks/useBranding";
import type { BrandingDto } from "@/services/branding";
import { settingsDict } from "./settings.i18n";

type FormState = {
  name: string;
  tagline: string;
  logoUrl: string;
  logoText: string;
};

function fromBranding(b: BrandingDto): FormState {
  return {
    name: b.name ?? "",
    tagline: b.tagline ?? "",
    logoUrl: b.logoUrl ?? "",
    logoText: b.logoText ?? "",
  };
}

export function BrandingModal({
  branding,
  onClose,
}: {
  branding: BrandingDto;
  onClose: () => void;
}) {
  const d = useDict(settingsDict);
  const L = useLabels();

  const [f, setF] = useState<FormState>(fromBranding(branding));
  const set = (k: keyof FormState, v: string) =>
    setF((prev) => ({ ...prev, [k]: toEnDigits(v) }));

  const update = useUpdateBranding((m) => {
    toast.success(m);
    onClose();
  });

  const submit = () =>
    update.mutate({
      name: f.name.trim(),
      tagline: f.tagline.trim() || null,
      logoUrl: f.logoUrl.trim() || null,
      logoText: f.logoText.trim().slice(0, 3) || null,
    });

  const logoUrl = f.logoUrl.trim();
  const logoText = f.logoText.trim().slice(0, 3) || "CS";

  return (
    <Modal
      open
      onClose={onClose}
      title={d.brandingModalTitle}
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={update.isPending}
          >
            {L.actions.cancel}
          </Button>
          <Button
            size="sm"
            disabled={update.isPending || !f.name.trim()}
            onClick={submit}
          >
            {L.actions.save}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div>
          <span className="mb-1.5 block text-xs font-bold text-muted-foreground">
            {d.preview}
          </span>
          <div className="flex items-center gap-3 rounded-lg bg-muted px-3.5 py-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                className="size-9 shrink-0 rounded-[26%] object-cover"
              />
            ) : (
              <span
                className="grid size-9 shrink-0 place-items-center rounded-[26%] bg-primary text-sm font-extrabold text-primary-foreground"
                aria-hidden
              >
                {logoText}
              </span>
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-foreground">
                {f.name.trim() || d.namePh}
              </div>
              <div className="truncate text-[12px] text-muted-foreground">
                {f.tagline.trim() || d.noTagline}
              </div>
            </div>
          </div>
        </div>

        <Field label={d.fName}>
          <Input
            value={f.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={d.namePh}
            autoFocus
          />
        </Field>
        <Field label={d.fTagline}>
          <Input
            value={f.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder={d.taglinePh}
          />
        </Field>
        <Field label={d.fLogoUrl} hint={d.logoUrlHint}>
          <Input
            value={f.logoUrl}
            onChange={(e) => set("logoUrl", e.target.value)}
            placeholder={d.logoUrlPh}
            inputMode="url"
          />
        </Field>
        <Field label={d.fLogoText} hint={d.logoTextHint}>
          <Input
            value={f.logoText}
            onChange={(e) => set("logoText", e.target.value)}
            placeholder={d.logoTextPh}
            maxLength={3}
          />
        </Field>
      </div>
    </Modal>
  );
}
