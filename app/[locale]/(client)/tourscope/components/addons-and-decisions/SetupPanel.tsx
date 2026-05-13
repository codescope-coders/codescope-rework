import { Badge } from "@/components/ui/badge";
import { Globe, GraduationCap, Server, TargetIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export function SetupPanel() {
  const t = useTranslations("tourscope.addons-and-decision");
  const tc = useTranslations("common");

  return (
    <div className="px-10 py-9 bg-white rounded-2xl border border-border shadow-xs mt-4">
      <div className="sm:flex items-center justify-between gap-3">
        <h2 className="font-bold text-lg">{t("setup.title")}</h2>
        <span className="uppercase tracking-widest text-subtitle-color text-xs font-semibold">
          {t("setup.tag")}
        </span>
      </div>

      <hr className="border-border mt-4 mb-7" />

      <div
        className="grid lg:grid-cols-2"
        style={{ columnGap: 40, rowGap: 20 }}
      >
        <SetupItem icon={<TargetIcon size={14} />} optional tc={tc}>
          {t("setup.items.branding")}
        </SetupItem>
        <SetupItem icon={<Globe size={14} />} tc={tc}>
          {t("setup.items.domain")}
        </SetupItem>
        <SetupItem icon={<Server size={14} />} tc={tc}>
          {t("setup.items.gds")}
        </SetupItem>
        <SetupItem icon={<GraduationCap size={14} />} tc={tc}>
          {t("setup.items.training")}
        </SetupItem>
      </div>

      <hr className="border-border mt-5 mb-4" />

      <p className="text-sm text-[#86868b] leading-[1.7]">
        {t.rich("setup.footnote", {
          strong: (chunks) => <strong className="text-accent">{chunks}</strong>,
        })}
      </p>
    </div>
  );
}

// ─── SetupItem ────────────────────────────────────────────────────────────────

function SetupItem({
  icon,
  children,
  optional,
  tc,
}: {
  icon: ReactNode;
  children: ReactNode;
  optional?: boolean;
  tc: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex items-start gap-4 text-sm text-[#6e6e73] leading-[1.7]">
      <div className="size-8 min-w-8 flex items-center justify-center rounded-md text-accent bg-[#f5f5f7] border-border border">
        {icon}
      </div>
      <div className="flex items-start gap-1">
        <p>{children}</p>
        {optional && (
          <Badge className="text-[11px] py-px px-2 bg-[#6f00ff12] text-accent border-[#6f00ff12] font-semibold rounded-full">
            {tc("optional")}
          </Badge>
        )}
      </div>
    </div>
  );
}
