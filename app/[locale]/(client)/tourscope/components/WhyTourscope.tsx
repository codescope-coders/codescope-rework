"use client";
import Container from "@/components/Container";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import React, { useRef } from "react";

// ── Animation config ───────────────────────────────────────────────────────

const EASE = [0.25, 0.1, 0.25, 1] as const;

function useFadeUp(delay = 0) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const props = {
    ref,
    initial: { opacity: 0, y: 20 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.5, ease: EASE, delay },
  };
  return props;
}

// ── Main section ───────────────────────────────────────────────────────────

export const WhyTourscope = () => {
  const t = useTranslations("tourscope.whyTourscope");

  // header ref — fires immediately on mount (above the fold)
  const headerRef = useRef<HTMLElement>(null);
  const headerInView = useInView(headerRef, { once: true });

  return (
    <section className="bg-white py-20 border-y border-y-black/8">
      <Container className="min-h-screen max-w-6xl">
        {/* Header */}
        <motion.header
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-14"
        >
          <h2 className="text-xs mb-3 font-semibold uppercase text-accent tracking-widest">
            {t("tagline")}
          </h2>
          <h2 className="font-bold mb-4 text-[clamp(28px,4vw,44px)]">
            {t("title")}
          </h2>
          <p className="text-base text-muted-foreground max-w-xl leading-[1.8]">
            {t("caption")}
          </p>
        </motion.header>

        {/* Bento grid — direct children are motion.article so grid placement is preserved */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-9">
          <BentoCard
            num="01"
            title={t("cards.01.title")}
            body={t("cards.01.body")}
            insight
            className="md:col-[1/3] md:row-[1/3]"
            delay={0}
          >
            <BrandWindow />
          </BentoCard>

          <BentoCard
            num="02"
            title={t("cards.02.title")}
            body={t("cards.02.body")}
            delay={0.08}
          />
          <BentoCard
            num="03"
            title={t("cards.03.title")}
            body={t("cards.03.body")}
            delay={0.16}
          />
          <BentoCard
            num="04"
            title={t("cards.04.title")}
            body={t("cards.04.body")}
            delay={0.04}
          />

          <BentoCard
            num="05"
            title={t("cards.05.title")}
            delay={0.1}
            bullets={[
              t("cards.05.bullets.0"),
              t("cards.05.bullets.1"),
              t("cards.05.bullets.2"),
            ]}
          />
          <BentoCard
            num="06"
            title={t("cards.06.title")}
            delay={0.16}
            bullets={[
              t("cards.06.bullets.0"),
              t("cards.06.bullets.1"),
              t("cards.06.bullets.2"),
            ]}
          />

          <BentoCard
            num="07"
            title={t("cards.07.title")}
            body={t("cards.07.body")}
            className="md:col-[1/3]"
            delay={0.04}
          >
            <FlowDiagram t={t} />
          </BentoCard>

          <BentoCard
            num="08"
            title={t("cards.08.title")}
            body={t("cards.08.body")}
            delay={0.1}
          />

          {/* Card 09 — full-width, inline since it has a unique layout */}
          <Card09 t={t} />
        </div>

        {/* Blockquote */}
        <QuoteBlock t={t} />
      </Container>
    </section>
  );
};

// ── BentoCard — now a motion.article so grid placement classes work ─────────

interface BentoCardProps {
  num: string;
  title: string;
  body?: string;
  bullets?: string[];
  insight?: boolean;
  className?: string;
  delay?: number;
  children?: React.ReactNode;
}

function BentoCard({
  num,
  title,
  body,
  bullets,
  insight = false,
  className = "",
  delay = 0,
  children,
}: BentoCardProps) {
  const anim = useFadeUp(delay);

  return (
    <motion.article
      {...anim}
      className={[
        "border rounded-2xl flex flex-col gap-3.5 relative overflow-hidden",
        "p-[28px_26px] shadow-[0_1px_4px_rgba(0,0,0,0.04)]",
        "transition-[border-color,transform,box-shadow] duration-250",
        "hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)]",
        !insight && "bg-white border-black/8 hover:border-black/13",
        insight && "border-[rgba(111,0,255,0.22)] hover:border-[#6f00ff]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        insight
          ? {
              background:
                "linear-gradient(135deg, rgba(111,0,255,.06) 0%, #fff 55%)",
            }
          : undefined
      }
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] font-bold tracking-[0.12em] uppercase ${insight ? "text-[#5500cc]" : "text-[#aeaeb2]"}`}
        >
          {num}
        </span>
        <span
          className="bg-[#6f00ff] h-[1.5px]"
          style={{ width: insight ? 30 : 20, opacity: insight ? 1 : 0.35 }}
        />
      </div>

      <h3 className="text-[15px] font-semibold leading-[1.45] tracking-[-0.01em] text-[#1d1d1f]">
        {title}
      </h3>

      {body && (
        <p className="text-[13.5px] text-[#6e6e73] leading-[1.8]">{body}</p>
      )}

      {bullets && (
        <ul className="flex flex-col gap-2">
          {bullets.map((b) => (
            <li key={b} className="text-[13.5px] text-[#6e6e73] leading-[1.8]">
              {b}
            </li>
          ))}
        </ul>
      )}

      {children}
    </motion.article>
  );
}

// ── Card 09 — extracted so it can also use useFadeUp ──────────────────────

function Card09({ t }: { t: ReturnType<typeof useTranslations> }) {
  const anim = useFadeUp(0.08);
  return (
    <motion.article
      {...anim}
      className={[
        "bg-white border border-black/8 rounded-2xl p-[28px_26px]",
        "flex flex-col gap-6 md:flex-row md:items-center md:gap-10",
        "relative overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]",
        "transition-[border-color,transform,box-shadow] duration-250",
        "hover:border-black/13 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)]",
        "md:col-[1/4]",
      ].join(" ")}
    >
      <div className="flex-1 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#aeaeb2]">
            09
          </span>
          <span className="bg-[#6f00ff] h-[1.5px] w-5 opacity-35" />
        </div>
        <h3 className="text-[15px] font-semibold leading-[1.45] tracking-[-0.01em] text-[#1d1d1f]">
          {t("cards.09.title")}
        </h3>
        <ul className="flex flex-col gap-2">
          {(["0", "1", "2", "3"] as const).map((i) => (
            <li key={i} className="text-[13.5px] text-[#6e6e73] leading-[1.8]">
              {t(`cards.09.bullets.${i}`)}
            </li>
          ))}
        </ul>
      </div>
      <MetricsPanel t={t} />
    </motion.article>
  );
}

// ── Blockquote ─────────────────────────────────────────────────────────────

function QuoteBlock({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <blockquote
      className="why-q bg-[#1d1d1f] text-white rounded-[22px] py-10 px-6 md:px-12 flex flex-col gap-4 md:grid md:items-center md:gap-7 shadow-[0_16px_48px_rgba(0,0,0,0.18)]"
      style={{ gridTemplateColumns: "auto 1fr" }}
    >
      <span
        className="text-[#6f00ff] font-bold self-start opacity-80 hidden md:block"
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 68,
          lineHeight: 0.65,
          marginTop: 14,
        }}
        aria-hidden
      >
        "
      </span>
      <div>
        <p className="text-[18px] leading-[1.72] text-white/88 tracking-[-0.005em]">
          {t.rich("quote.body", {
            strong: (chunks) => (
              <strong className="text-[#6f00ff] font-semibold">{chunks}</strong>
            ),
          })}
        </p>
        <p className="mt-3.5 text-[10px] text-white/35 tracking-[0.12em] uppercase font-semibold">
          {t("quote.attribution")}
        </p>
      </div>
    </blockquote>
  );
}

// ── Visuals (unchanged) ────────────────────────────────────────────────────

function BrandWindow() {
  return (
    <div className="mt-auto pt-5 flex justify-center items-center">
      <div
        className="w-full max-w-82.5 bg-white border border-border rounded-[10px] overflow-hidden"
        style={{
          boxShadow: "0 10px 32px rgba(0,0,0,.09), 0 2px 6px rgba(0,0,0,.04)",
        }}
      >
        <div className="bg-[#f5f5f7] border-b border-black/8 px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1.25 shrink-0">
            <i className="w-2 h-2 rounded-full bg-[#ff5f57] block not-italic" />
            <i className="w-2 h-2 rounded-full bg-[#febc2e] block not-italic" />
            <i className="w-2 h-2 rounded-full bg-[#28c840] block not-italic" />
          </div>
          <div className="flex-1 bg-[#e8e8ed] border border-black/8 rounded-lg px-2.5 py-0.75 text-[10px] text-[#86868b] text-center">
            youragency.com
          </div>
        </div>
        <div className="p-[10px_12px] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-[3px] bg-[#6f00ff]" />
              <span className="text-[11px] font-bold text-[#1d1d1f]">
                YourBrand
              </span>
            </div>
            <div className="flex gap-1">
              <span className="text-[9px] px-2 py-0.75 rounded-lg border bg-[rgba(111,0,255,0.07)] border-[rgba(111,0,255,0.22)] text-[#5500cc] font-semibold">
                رحلات
              </span>
              <span className="text-[9px] px-2 py-0.75 rounded-lg border bg-[#f5f5f7] border-black/8 text-[#86868b]">
                فنادق
              </span>
              <span className="text-[9px] px-2 py-0.75 rounded-lg border bg-[#f5f5f7] border-black/8 text-[#86868b]">
                تأشيرات
              </span>
            </div>
          </div>
          <div
            className="border border-black/8 rounded-[7px] p-3.5 flex items-center justify-between"
            style={{
              background:
                "linear-gradient(135deg, rgba(111,0,255,.07), #f5f5f7)",
            }}
          >
            <div className="flex flex-col gap-1.25">
              <div className="w-22.5 h-1.5 bg-[rgba(111,0,255,0.45)] rounded-[3px]" />
              <div className="w-15 h-1 bg-[#e8e8ed] rounded-[3px]" />
            </div>
            <div className="bg-[#6f00ff] text-white text-[9px] font-bold px-3 py-1.5 rounded-[5px] whitespace-nowrap">
              احجز الآن
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricsPanel({ t }: { t: ReturnType<typeof useTranslations> }) {
  const metrics = [
    {
      label: t("metrics.monthlyRevenue"),
      value: "+$12,480",
      cls: "text-[#16a34a]",
    },
    {
      label: t("metrics.walletBalance"),
      value: "$8,720",
      cls: "text-[#5500cc]",
    },
    { label: t("metrics.commissions"), value: "$3,190", cls: "text-[#1d1d1f]" },
  ];
  return (
    <div
      className="flex flex-row md:flex-col max-sm:flex-col gap-2 md:gap-1.75 md:shrink-0"
      style={{ flex: "0 0 auto" }}
    >
      {metrics.map((m) => (
        <div
          key={m.label}
          className="flex-1 bg-[#f5f5f7] border border-border rounded-[9px] px-3.5 py-2.5 flex flex-col gap-0.75"
        >
          <span className="text-[11px] text-[#aeaeb2]">{m.label}</span>
          <span
            className={`text-[17px] font-bold tracking-[-0.02em] ${m.cls}`}
            dir="ltr"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {m.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function FlowDiagram({ t }: { t: ReturnType<typeof useTranslations> }) {
  const steps: { label: string; icon: React.ReactNode }[] = [
    {
      label: t("flow.book"),
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="2" y="2" width="10" height="10" rx="2" />
          <path d="M5 7h4M7 5v4" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: t("flow.pay"),
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="2" y="3" width="10" height="8" rx="1.5" />
          <path d="M2 6.5h10" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: t("flow.confirm"),
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="7" cy="7" r="5" />
          <path
            d="M4.5 7l2 2 3-3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: t("flow.doc"),
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M2.5 4h9M2.5 7h6M2.5 10h4" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: t("flow.follow"),
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="7" cy="7" r="5" />
          <path
            d="M7 4.5v2.5l1.5 1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="mt-auto pt-5 flex w-full items-center">
      <div className="bg-[#f5f5f7] border border-border rounded-[10px] px-4.5 py-3.5 w-full">
        <div className="flex flex-col sm:hidden">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-8 h-8 rounded-full bg-[rgba(111,0,255,0.07)] border-[1.5px] border-[rgba(111,0,255,0.22)] flex items-center justify-center text-[#5500cc]">
                  {step.icon}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 min-h-5 my-1 bg-linear-to-b from-[rgba(111,0,255,0.22)] to-[rgba(0,0,0,0.08)]" />
                )}
              </div>
              <span className="text-[11px] text-[#86868b] font-medium pb-5 last:pb-0">
                {step.label}
              </span>
            </div>
          ))}
        </div>
        <div className="hidden sm:flex items-center justify-between">
          {steps.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-1.75">
                <div className="w-8 h-8 rounded-full bg-[rgba(111,0,255,0.07)] border-[1.5px] border-[rgba(111,0,255,0.22)] flex items-center justify-center text-[#5500cc] shrink-0">
                  {step.icon}
                </div>
                <span className="text-[11px] text-[#86868b] font-medium whitespace-nowrap">
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px mx-1.5 mb-5 bg-linear-to-l from-[rgba(111,0,255,0.22)] to-[rgba(0,0,0,0.08)]" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
