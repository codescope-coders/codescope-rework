"use client";

import Container from "@/components/Container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { ReactNode, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuestionProps {
  title: string;
  children: ReactNode;
  id: string;
}

interface CategoryProps {
  category: string;
  children?: ReactNode;
  delay?: number;
}

interface DataItemProps {
  title: string;
  details: ReactNode; // ReactNode — not string — because values may contain rich markup
}

// ── Rich-text component map ───────────────────────────────────────────────────
// Pass this to every t.rich() call so <strong> and <br> are handled uniformly.

const richComponents = {
  strong: (chunks: ReactNode) => (
    <strong className="text-foreground font-semibold">{chunks}</strong>
  ),
  br: () => <br />,
};

// ── Animation wrapper ─────────────────────────────────────────────────────────

const Reveal = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -32px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

// ── Base components ───────────────────────────────────────────────────────────

const Category = ({ category, children, delay = 0 }: CategoryProps) => (
  <Reveal delay={delay}>
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 font-bold text-xs tracking-widest uppercase text-accent">
        <h3>{category}</h3>
        <span className="w-full flex-1 bg-accent/20 h-px" />
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  </Reveal>
);

const Question = ({ title, children, id }: QuestionProps) => (
  <AccordionItem
    value={id}
    className="bg-white border border-border data-[state=open]:ring-2 ring-accent/20 data-[state=closed]:hover:bg-[#f8f8f8] data-[state=closed]:cursor-pointer duration-200 rounded-xl"
  >
    <AccordionTrigger className="px-5 py-4 text-[0.9375rem] font-semibold">
      {title}
    </AccordionTrigger>
    <AccordionContent className="px-5 pb-5 text-sm text-[#6e6e73] leading-relaxed pt-4">
      {children}
    </AccordionContent>
  </AccordionItem>
);

// details is ReactNode so callers can pass t.rich() output directly
const DataItem = ({ title, details }: DataItemProps) => (
  <li className="flex items-start gap-1 text-sm leading-normal">
    <div className="size-1 rounded-full bg-black me-1 mt-2 shrink-0" />
    <dt className="font-semibold shrink-0 text-black">{title}:</dt>
    <dd>{details}</dd>
  </li>
);

const DataList = ({ children }: { children: ReactNode }) => (
  <ul className="flex flex-col gap-1">{children}</ul>
);

const BulletList = ({ children }: { children: ReactNode }) => (
  <ul className="list-disc ps-5 flex flex-col gap-1 mt-2">{children}</ul>
);

const Strong = ({ children }: { children: ReactNode }) => (
  <strong className="text-foreground font-semibold">{children}</strong>
);

// ── Category components ───────────────────────────────────────────────────────

const CommercialCategory = () => {
  const t = useTranslations("faq");
  const tourscopeT = useTranslations("tourscope");

  return (
    <Category category={t("categories.commercial")} delay={0}>
      {/* c1 */}
      <Question id="c1" title={t("commercial.c1.q")}>
        <BulletList>
          <li>
            <Strong>{t("commercial.c1.setup")}</Strong>{" "}
            {t("commercial.c1.setupDetails")}
          </li>
          <li>
            <Strong>{t("commercial.c1.subscription")}</Strong>{" "}
            {t("commercial.c1.subscriptionDetails")}
          </li>
        </BulletList>
        <p className="mt-2">{t("commercial.c1.note")}</p>
      </Question>

      {/* c2 — values contain <strong>, use t.rich() and pass as ReactNode */}
      <Question id="c2" title={t("commercial.c2.q")}>
        <DataList>
          <DataItem
            title={tourscopeT("pricingPlans.plans.charter.title")}
            details={t.rich("commercial.c2.charter", richComponents)}
          />
          <DataItem
            title={tourscopeT("pricingPlans.plans.standard.title")}
            details={t.rich("commercial.c2.standard", richComponents)}
          />
          <DataItem
            title={tourscopeT("pricingPlans.plans.advanced.title")}
            details={t.rich("commercial.c2.advanced", richComponents)}
          />
        </DataList>
      </Question>

      {/* c3 */}
      <Question id="c3" title={t("commercial.c3.q")}>
        {t("commercial.c3.a")}
      </Question>

      {/* c4 */}
      <Question id="c4" title={t("commercial.c4.q")}>
        {t("commercial.c4.intro")}
        <BulletList>
          <li>
            <Strong>{tourscopeT("pricingPlans.quarterly")}:</Strong>{" "}
            {t("commercial.c4.quarterly")}
          </li>
          <li>
            <Strong>{tourscopeT("pricingPlans.yearly")}:</Strong>{" "}
            {t("commercial.c4.yearly")}
          </li>
          <li>
            <Strong>{tourscopeT("pricingPlans.twoYears")}:</Strong>{" "}
            {t("commercial.c4.twoYears")}
          </li>
        </BulletList>
      </Question>

      {/* c5 — contains <strong>, replace dangerouslySetInnerHTML with t.rich() */}
      <Question id="c5" title={t("commercial.c5.q")}>
        <span>{t.rich("commercial.c5.a", richComponents)}</span>
      </Question>

      {/* c6 */}
      <Question id="c6" title={t("commercial.c6.q")}>
        {t("commercial.c6.intro")}
        <BulletList>
          {(["item1", "item2", "item3", "item4", "item5"] as const).map(
            (item) => (
              <li key={item}>{t(`commercial.c6.${item}`)}</li>
            ),
          )}
        </BulletList>
      </Question>

      {/* c7 */}
      <Question id="c7" title={t("commercial.c7.q")}>
        {t("commercial.c7.a")}
      </Question>

      {/* c8 */}
      <Question id="c8" title={t("commercial.c8.q")}>
        <p>
          <Strong>{t("commercial.c8.upgradeLabel")}:</Strong>{" "}
          {t("commercial.c8.upgrade")}
        </p>
        <p className="mt-3">
          <Strong>{t("commercial.c8.downgradeLabel")}:</Strong>{" "}
          {t("commercial.c8.downgrade")}
        </p>
      </Question>

      {/* c9 */}
      <Question id="c9" title={t("commercial.c9.q")}>
        {t("commercial.c9.a")}
      </Question>

      {/* c10 — contains <strong>, replace dangerouslySetInnerHTML with t.rich() */}
      <Question id="c10" title={t("commercial.c10.q")}>
        <span>{t.rich("commercial.c10.a", richComponents)}</span>
      </Question>

      {/* c11 */}
      <Question id="c11" title={t("commercial.c11.q")}>
        <BulletList>
          {(
            [
              ["beforeLabel", "before"],
              ["duringLabel", "during"],
              ["afterLabel", "after"],
            ] as const
          ).map(([label, value]) => (
            <li key={label}>
              <Strong>{t(`commercial.c11.${label}`)}:</Strong>{" "}
              {t(`commercial.c11.${value}`)}
            </li>
          ))}
        </BulletList>
      </Question>
    </Category>
  );
};

const TechCategory = () => {
  const t = useTranslations("faq");

  return (
    <Category category={t("categories.technical")} delay={0.08}>
      <Question id="t1" title={t("technical.t1.q")}>
        {t("technical.t1.a")}
      </Question>

      <Question id="t2" title={t("technical.t2.q")}>
        {t("technical.t2.a")}
      </Question>

      <Question id="t3" title={t("technical.t3.q")}>
        <p>
          <Strong>{t("technical.t3.languagesLabel")}:</Strong>{" "}
          {t("technical.t3.languages")}
        </p>
        <p className="mt-3">
          <Strong>{t("technical.t3.currenciesLabel")}:</Strong>{" "}
          {t("technical.t3.currencies")}
        </p>
      </Question>

      <Question id="t4" title={t("technical.t4.q")}>
        {t("technical.t4.a")}
      </Question>

      <Question id="t5" title={t("technical.t5.q")}>
        <Strong>{t("technical.t5.localLabel")}:</Strong> {t("technical.t5.a")}
      </Question>

      <Question id="t6" title={t("technical.t6.q")}>
        {t("technical.t6.a")}
      </Question>
    </Category>
  );
};

const OperationalCategory = () => {
  const t = useTranslations("faq");

  return (
    <Category category={t("categories.operational")} delay={0.16}>
      <Question id="o1" title={t("operational.o1.q")}>
        {t("operational.o1.a")}
      </Question>

      {/* o2 — contains <strong>, replace dangerouslySetInnerHTML with t.rich() */}
      <Question id="o2" title={t("operational.o2.q")}>
        <span>{t.rich("operational.o2.a", richComponents)}</span>
      </Question>

      <Question id="o3" title={t("operational.o3.q")}>
        {t("operational.o3.a")}
      </Question>

      <Question id="o4" title={t("operational.o4.q")}>
        {t("operational.o4.a")}
      </Question>

      <Question id="o5" title={t("operational.o5.q")}>
        {t("operational.o5.a")}
      </Question>
    </Category>
  );
};

const DataCategory = () => {
  const t = useTranslations("faq");

  return (
    <Category category={t("categories.data")} delay={0.08}>
      <Question id="d1" title={t("data.d1.q")}>
        {t("data.d1.a")}
      </Question>

      <Question id="d2" title={t("data.d2.q")}>
        <BulletList>
          {(
            [
              ["graceLabel", "grace"],
              ["freezeLabel", "freeze"],
              ["deleteLabel", "delete"],
            ] as const
          ).map(([label, value]) => (
            <li key={label}>
              <Strong>{t(`data.d2.${label}`)}:</Strong> {t(`data.d2.${value}`)}
            </li>
          ))}
        </BulletList>
      </Question>

      <Question id="d3" title={t("data.d3.q")}>
        {t("data.d3.a")}
      </Question>
    </Category>
  );
};

const HardSalesCategory = () => {
  const t = useTranslations("faq");

  return (
    <Category category={t("categories.hardSales")} delay={0.16}>
      <Question id="h1" title={t("hardSales.h1.q")}>
        {t("hardSales.h1.a")}
      </Question>

      <Question id="h2" title={t("hardSales.h2.q")}>
        {t("hardSales.h2.a")}
      </Question>
    </Category>
  );
};

const AfterSalesCategory = () => {
  const t = useTranslations("faq");

  return (
    <Category category={t("categories.afterSales")} delay={0.08}>
      <Question id="a1" title={t("afterSales.a1.q")}>
        {t("afterSales.a1.a")}
      </Question>

      <Question id="a2" title={t("afterSales.a2.q")}>
        {t("afterSales.a2.a")}
      </Question>

      <Question id="a3" title={t("afterSales.a3.q")}>
        {t("afterSales.a3.a")}
      </Question>
    </Category>
  );
};

// ── Main Section ──────────────────────────────────────────────────────────────

export const FAQSection = () => {
  const t = useTranslations("faq");

  return (
    <section>
      <Container className="min-h-screen py-20">
        <Reveal>
          <header className="text-center mb-20">
            <h2 className="font-semibold text-xs text-accent tracking-widest mb-4">
              {t("tagline")}
            </h2>
            <h2 className="leading-[1.1] tracking-wide font-bold text-[clamp(2rem,4.5vw,3.25rem)] mb-3">
              {t("title")}
            </h2>
            <p className="text-subtitle-color max-w-md mx-auto text-base">
              {t("caption")}
            </p>
          </header>
        </Reveal>

        <Accordion type="single" collapsible className="flex flex-col gap-8">
          <CommercialCategory />
          <TechCategory />
          <OperationalCategory />
          <DataCategory />
          <HardSalesCategory />
          <AfterSalesCategory />
        </Accordion>
      </Container>
    </section>
  );
};
