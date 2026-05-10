import Container from "@/components/Container";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Globe, GraduationCap, Server, TargetIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

type Addon = {
  nameKey: string;
  subKey?: string;
  setup: string;
  quarterly: string;
  annual: string;
  biannual: string;
};

const ADDONS: Addon[] = [
  {
    nameKey: "ios_app",
    setup: "$1,500",
    quarterly: "$360",
    annual: "$1,200",
    biannual: "$2,160",
  },
  {
    nameKey: "android_app",
    setup: "$1,500",
    quarterly: "$360",
    annual: "$1,200",
    biannual: "$2,160",
  },
  {
    nameKey: "ios_android_bundle",
    setup: "$2,500",
    quarterly: "$600",
    annual: "$2,000",
    biannual: "$3,600",
  },
  {
    nameKey: "starter_module",
    subKey: "starter_module_subtext",
    setup: "$1,000",
    quarterly: "$450",
    annual: "$1,500",
    biannual: "$2,700",
  },
  {
    nameKey: "travel_insurance",
    setup: "$500",
    quarterly: "$240",
    annual: "$800",
    biannual: "$1,440",
  },
  {
    nameKey: "esim",
    setup: "$300",
    quarterly: "$180",
    annual: "$600",
    biannual: "$1,080",
  },
  {
    nameKey: "qicard_gateway",
    setup: "—",
    quarterly: "$100",
    annual: "$333",
    biannual: "$600",
  },
  {
    nameKey: "zaincash_gateway",
    setup: "—",
    quarterly: "$100",
    annual: "$333",
    biannual: "$600",
  },
  {
    nameKey: "fastpay_gateway",
    setup: "—",
    quarterly: "$100",
    annual: "$333",
    biannual: "$600",
  },
  {
    nameKey: "outbound_api",
    setup: "$1,500",
    quarterly: "$600",
    annual: "$2,000",
    biannual: "$3,600",
  },
  {
    nameKey: "extra_users",
    setup: "—",
    quarterly: "$150",
    annual: "$500",
    biannual: "$900",
  },
];

export const AddonsAndDecisions = () => {
  const t = useTranslations("tourscope.addons-and-decision");
  const tt = useTranslations("table.columns");

  return (
    <section className="bg-white">
      <Container className="min-h-screen py-20 max-w-6xl">
        <header className="mb-14">
          <h2 className="mb-3 font-bold text-xs uppercase text-accent tracking-widest">
            {t("tagline")}
          </h2>
          <h2 className="mb-4 text-[clamp(28px,4vw,44px)] tracking-tight leading-[1.13] font-bold">
            {t("title")}
          </h2>
        </header>

        <div className="mb-8">
          <header className="flex items-center justify-between gap-4">
            <h3 className="font-bold text-lg tracking-normal">
              {t("subtitle")}
            </h3>
            <span className="uppercase tracking-widest text-xs text-subtitle-color font-semibold">
              {t("tag")}
            </span>
          </header>
          <hr className="mt-4 mb-6 border-border" />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">{tt("addition")}</TableHead>
                <TableHead className="w-45 text-end">{tt("setup")}</TableHead>
                <TableHead className="w-45 text-end">
                  {tt("quarterly")}
                </TableHead>
                <TableHead className="bg-[#6f00ff12] text-accent font-semibold w-45 text-end">
                  {tt("annually")}
                </TableHead>
                <TableHead className="w-45 text-end">
                  {tt("two_years")}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {ADDONS.map((addon) => (
                <TableRow key={addon.nameKey}>
                  <TableCell className="font-medium">
                    {t(`additions.${addon.nameKey}`)}
                    {addon.subKey && (
                      <span className="ms-2 text-xs text-muted-foreground font-normal">
                        {t(`additions.${addon.subKey}`)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {addon.setup}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {addon.quarterly}
                  </TableCell>
                  <TableCell className="bg-[#6f00ff12] text-accent font-semibold text-end tabular-nums">
                    {addon.annual}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {addon.biannual}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <SetupPanel t={t} />
      </Container>
    </section>
  );
};

// ─── Setup panel ──────────────────────────────────────────────────────────

function SetupPanel({ t }: { t: ReturnType<typeof useTranslations> }) {
  const tc = useTranslations("common");
  return (
    <div className="px-10 py-9 bg-white rounded-2xl border border-border shadow-xs">
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
        <SetupItem
          icon={<TargetIcon size={14} />}
          content={t("setup.items.branding")}
          optional
          tc={tc}
        />
        <SetupItem
          icon={<Globe size={14} />}
          content={t("setup.items.domain")}
          tc={tc}
        />
        <SetupItem
          icon={<Server size={14} />}
          content={t("setup.items.gds")}
          tc={tc}
        />
        <SetupItem
          icon={<GraduationCap size={14} />}
          content={t("setup.items.training")}
          tc={tc}
        />
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

const SetupItem = ({
  icon,
  content,
  optional,
  tc,
}: {
  icon: ReactNode;
  content: string;
  optional?: boolean;
  tc: ReturnType<typeof useTranslations>;
}) => (
  <div className="flex items-start gap-4 text-sm text-[#6e6e73] leading-[1.7]">
    <div className="size-8 min-w-8 flex items-center justify-center rounded-md text-accent bg-[#f5f5f7] border-border border">
      {icon}
    </div>
    <div className="flex items-start gap-1">
      <p>{content}</p>
      {optional && (
        <Badge className="text-[11px] py-px px-2 bg-[#6f00ff12] text-accent border-[#6f00ff12] font-semibold rounded-full">
          {tc("optional")}
        </Badge>
      )}
    </div>
  </div>
);
