"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  PageHeader,
  Spinner,
} from "@/components/dashboard/ui";
import { BrandMark } from "@/components/dashboard/brand-mark";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useBranding } from "@/hooks/useBranding";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import type { SettingsDto } from "@/services/settings";
import { settingsDict } from "./settings.i18n";
import { BrandingModal } from "./branding-modal";
import { EditableList } from "./editable-list";

export default function SettingsPage() {
  const t = useTranslations("dash");
  const d = useDict(settingsDict);
  const L = useLabels();
  const can = useCan();
  const canManage = can(PERMISSIONS.MANAGE_SETTINGS);

  const { data: brandingData, isLoading: brandingLoading } = useBranding();
  const { data: settingsData, isLoading: settingsLoading } = useSettings();
  const branding = brandingData?.payload;
  const settings = settingsData?.payload;

  const update = useUpdateSettings((m) => toast.success(m));
  const setList = (key: keyof SettingsDto, next: string[]) =>
    update.mutate({ [key]: next } as Partial<SettingsDto>);

  const [brandOpen, setBrandOpen] = useState(false);

  const loading = brandingLoading || settingsLoading;

  return (
    <>
      <PageHeader title={t("nav.settings")} subtitle={d.subtitle} />

      {!canManage ? (
        <EmptyState>{d.noAccess}</EmptyState>
      ) : loading || !branding || !settings ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Spinner /> ...
        </div>
      ) : (
        <div className="flex max-w-3xl flex-col gap-5">
          {/* 1) Company branding */}
          <Card>
            <CardHeader>
              <CardTitle>{d.brandingTitle}</CardTitle>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setBrandOpen(true)}
              >
                {L.actions.edit}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3.5">
                <BrandMark size={46} />
                <div className="min-w-0">
                  <div className="text-[15px] font-extrabold text-foreground">
                    {branding.name}
                  </div>
                  <div className="text-[13px] text-muted-foreground">
                    {branding.tagline || d.noTagline}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                {d.brandingDesc}
              </p>
            </CardContent>
          </Card>

          {/* 2) Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>{d.appearanceTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="rounded-lg bg-primary/8 px-3.5 py-3 text-[12.5px] leading-relaxed text-muted-foreground">
                {d.appearanceNote}
              </p>
            </CardContent>
          </Card>

          {/* 3) Finance category lists */}
          <Card>
            <CardHeader>
              <CardTitle>{d.financeTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                {d.financeDesc}
              </p>
              <EditableList
                title={d.incomeTitle}
                items={settings.incomeCategories}
                placeholder={d.addPh}
                addLabel={L.actions.add}
                emptyLabel={d.emptyList}
                removeLabel={L.actions.delete}
                disabled={update.isPending}
                onChange={(next) => setList("incomeCategories", next)}
              />
              <EditableList
                title={d.expenseTitle}
                items={settings.expenseCategories}
                placeholder={d.addPh}
                addLabel={L.actions.add}
                emptyLabel={d.emptyList}
                removeLabel={L.actions.delete}
                disabled={update.isPending}
                onChange={(next) => setList("expenseCategories", next)}
              />
              <EditableList
                title={d.deductionTitle}
                items={settings.deductionReasons}
                placeholder={d.addPh}
                addLabel={L.actions.add}
                emptyLabel={d.emptyList}
                removeLabel={L.actions.delete}
                disabled={update.isPending}
                onChange={(next) => setList("deductionReasons", next)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {brandOpen && branding && (
        <BrandingModal branding={branding} onClose={() => setBrandOpen(false)} />
      )}
    </>
  );
}
