import Container from "@/components/Container";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { CheckIcon, Clock, CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { ComponentProps, ReactNode } from "react";

export const PricingPlans = () => {
  const t = useTranslations("tourscope.pricingPlans");

  return (
    <section className="py-20">
      <Container className="min-h-screen max-w-6xl">
        <header className="text-center">
          <h2 className="mb-3 text-accent uppercase text-xs font-semibold tracking-widest">
            {t("tagline")}
          </h2>
          <h2 className="mb-4 leading-[1.13] font-bold text-[clamp(28px,4vw,44px)]">
            {t("title")}
          </h2>
          <p className="max-w-xl text-muted-foreground leading-[1.8] mx-auto">
            {t("caption")}
          </p>
        </header>

        <div className="grid lg:grid-cols-3 sm:grid-cols-2 sm:gap-4 gap-8 mt-14">
          <PricingPlan
            t={t}
            title={t("plans.charter.title")}
            type={t("plans.charter.type")}
            details={t("plans.charter.details")}
            features={["0", "1", "2", "3", "4"].map((i) =>
              t(`plans.charter.features.${i}`),
            )}
            price={{
              yearly: "900$",
              monthly: "75$",
              quarterly: { total: "270$", perMonth: "90$" },
              twoYears: { total: "1,620$", perMonth: "67.5$" },
            }}
            preparationFees="500$"
          />
          <PricingPlan
            t={t}
            mostPopular
            title={t("plans.standard.title")}
            type={t("plans.standard.type")}
            details={t("plans.standard.details")}
            features={["0", "1", "2", "3", "4"].map((i) =>
              t(`plans.standard.features.${i}`),
            )}
            price={{
              yearly: "4,500$",
              monthly: "375$",
              quarterly: { total: "1,350$", perMonth: "450$" },
              twoYears: { total: "8,100$", perMonth: "338$" },
            }}
            preparationFees="2,000$"
          />
          <PricingPlan
            t={t}
            title={t("plans.advanced.title")}
            type={t("plans.advanced.type")}
            details={t("plans.advanced.details")}
            features={["0", "1", "2", "3", "4", "5"].map((i) =>
              t(`plans.advanced.features.${i}`),
            )}
            price={{
              yearly: "9,000$",
              monthly: "750$",
              quarterly: { total: "2,700$", perMonth: "900$" },
              twoYears: { total: "16,200$", perMonth: "675$" },
            }}
            preparationFees="3,250$"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-7">
          <Note
            icon={<Clock size={14} />}
            title={t("notes.qualification.title")}
            description={t("notes.qualification.description")}
          />
          <Note
            icon={<CreditCard size={14} />}
            title={t("notes.minimum.title")}
            description={t("notes.minimum.description")}
          />
        </div>
      </Container>
    </section>
  );
};

// ─── Types ────────────────────────────────────────────────────────────────

type TFunc = ReturnType<typeof useTranslations>;

type Price = {
  yearly: string;
  monthly: string;
  quarterly: { perMonth: string; total: string };
  twoYears: { perMonth: string; total: string };
};

// ─── PricingPlan ──────────────────────────────────────────────────────────

const PricingPlan = ({
  t,
  mostPopular,
  title,
  type,
  details,
  features,
  price,
  preparationFees,
}: {
  t: TFunc;
  mostPopular?: boolean;
  title: string;
  type: string;
  details: string;
  features: string[];
  price: Price;
  preparationFees: string;
}) => {
  return (
    <div
      className={clsx(
        "px-7 py-8 max-sm:px-4 shadow-md border border-border rounded-2xl bg-white w-full relative hover:-translate-y-3 duration-300",
        {
          "bg-[#1d1d1f]! text-white -translate-y-2 [&_hr]:border-border/20":
            mostPopular,
        },
      )}
    >
      {mostPopular && (
        <div className="absolute whitespace-nowrap -top-3.25 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-xs rounded-full font-bold uppercase">
          {t("mostPopular")}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl font-bold leading-normal">{title}</h3>
        <span
          className={clsx("text-xs font-medium text-muted-foreground", {
            "text-accent!": mostPopular,
          })}
        >
          {type}
        </span>
      </div>

      <Divider />
      <p className="text-sm text-[#6e6e73]">{details}</p>
      <Divider />

      <div
        className={clsx("border border-border rounded-xl overflow-hidden", {
          "border-[#ffffff14]!": mostPopular,
        })}
      >
        {/* Annual price */}
        <div
          className={clsx("py-5 px-4 bg-[#f5f5f7] border-b border-b-border", {
            "bg-[#ffffff0b]! border-[#ffffff14]!": mostPopular,
          })}
        >
          <div className="font-bold leading-normal text-5xl whitespace-nowrap">
            {price.yearly}{" "}
            <span className="text-sm font-normal -translate-y-1 inline-block text-subtitle-color">
              / {t("yearly")}
            </span>
          </div>
          <div className="text-sm text-subtitle-color">
            <span className="font-semibold text-[#6f00ff]">
              {price.monthly}
            </span>{" "}
            {t("monthly")}{" "}
            <Badge
              className={clsx(
                "text-[10px] px-2 py-0.5 rounded-full text-[#1a7f35] bg-[#34c7591f] border-[#34c75947] ms-1",
                {
                  "text-[#6effa0] bg-[#34c7592e] border-[#34c7594d]":
                    mostPopular,
                },
              )}
            >
              وفّر 17%
            </Badge>
          </div>
        </div>

        {/* Alt billing */}
        <dl className="py-2 px-4 flex flex-col gap-2.5">
          {[
            {
              label: t("quarterly"),
              perMonth: price.quarterly.perMonth,
              total: price.quarterly.total,
            },
            {
              label: t("twoYears"),
              perMonth: price.twoYears.perMonth,
              total: price.twoYears.total,
              hasDiscout: true,
              discount: 25,
            },
          ].map(({ label, perMonth, total, discount, hasDiscout }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3"
            >
              <dt className="text-subtitle-color text-[12.5px]">
                {label}{" "}
                {hasDiscout && (
                  <Badge
                    className={clsx(
                      "text-[10px] px-2 py-0.5 rounded-full text-[#1a7f35] bg-[#34c7591f] border-[#34c75947] ms-1",
                      {
                        "text-[#6effa0] bg-[#34c7592e] border-[#34c7594d]":
                          mostPopular,
                      },
                    )}
                  >
                    وفّر %{discount}
                  </Badge>
                )}
              </dt>
              <dd className="flex items-center gap-4">
                <span className="text-[#aeaeb2] text-xs font-medium">
                  {perMonth}
                  {t("perMonth")}
                </span>
                <span
                  className={clsx("text-[#6e6e73] text-[13px] font-semibold", {
                    "text-[#ffffff9e]!": mostPopular,
                  })}
                >
                  {total}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        {/* Setup fee */}
        <hr className="border-dashed border-border" />
        <div className="px-4 py-2.5 flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 text-xs text-subtitle-color">
            {t("setupFees")}
            <Badge
              variant="gray"
              className={clsx(
                "bg-[#e8e8ed] text-[10px] font-semibold text-subtitle-color px-1.75 py-0.5 rounded-full border border-black/12",
                { "bg-[#ffffff0f]! border-[#ffffff1a]!": mostPopular },
              )}
            >
              {t("setupFeesBadge")}
            </Badge>
          </div>
          <div className="font-bold">{preparationFees}</div>
        </div>
      </div>

      <Divider />

      {/* Features */}
      <ul className="flex flex-col gap-2.5">
        {features.map((feature, i) => (
          <li
            key={i}
            className={clsx(
              "flex items-center gap-2 text-sm leading-[1.6] text-[#6e6e73]",
              { "text-[#ffffffb8]!": mostPopular },
            )}
          >
            <CheckIcon className="text-accent" size={18} />
            {feature}
          </li>
        ))}
      </ul>

      <Divider className="border-dashed" />
      <p className="text-center text-[#aeaeb2] text-xs">{t("footnote")}</p>
    </div>
  );
};

// ─── Shared ───────────────────────────────────────────────────────────────

const Divider = ({ className }: ComponentProps<"hr">) => (
  <hr className={cn("my-5 border-border", className)} />
);

const Note = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => (
  <div className="p-5 border border-border bg-white flex gap-4 rounded-2xl items-start shadow-xs">
    <div className="size-8 min-w-8 flex items-center justify-center rounded-md text-accent bg-[#e8e8ed]">
      {icon}
    </div>
    <div className="flex flex-col gap-1">
      <h2 className="font-semibold text-sm">{title}</h2>
      <p className="text-subtitle-color text-[13px] leading-[1.65]">
        {description}
      </p>
    </div>
  </div>
);
