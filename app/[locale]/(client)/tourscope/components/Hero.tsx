"use client";
import Container from "@/components/Container";
import { ScrollArrowIcon } from "@/lib/Icons";
import { animate, motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: EASE, delay },
});

export const HeroSection = () => {
  const t = useTranslations("tourscope.hero");
  const tc = useTranslations("common");

  return (
    <section className="relative">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_65%_55%_at_78%_15%,rgba(111,0,255,0.07),transparent_60%),radial-gradient(ellipse_45%_35%_at_15%_85%,rgba(111,0,255,0.04),transparent_60%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.025)_1px,transparent_1px)] bg-size-[72px_72px] mask-[radial-gradient(ellipse_80%_80%_at_50%_40%,black_10%,transparent_100%)]" />

      <Container className="flex flex-col min-h-hero-height pt-20 max-w-6xl">
        <motion.div
          {...fade(0)}
          className="flex items-center gap-2 w-fit font-semibold text-muted-foreground text-xs mb-4 uppercase tracking-widest"
        >
          <span className="h-0.5 w-7 bg-accent" />
          <h2>{t("tagline")}</h2>
        </motion.div>

        <motion.h1
          {...fade(0.08)}
          className="text-[clamp(52px,7.5vw,104px)] font-bold leading-[120%] mb-5"
        >
          {t.rich("title", { br: () => <br /> })}
        </motion.h1>

        <motion.p
          {...fade(0.16)}
          className="text-[clamp(15px,2vw,18px)] text-gray-500 leading-[150%] mb-10"
        >
          {t("caption")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.24 }}
          className="flex rounded-2xl overflow-hidden shadow-xs border border-border max-w-2xl mb-9 max-sm:flex-col"
        >
          <StatsCard label={t("qualificationDays")} value={14} index={0} />
          <StatsCard label={t("extraUnits")} value={8} index={1} />
          <StatsCard label={t("platformCapabilities")} value={9} index={2} />
          <StatsCard label={t("basicPackages")} value={3} index={3} />
        </motion.div>

        <motion.dl {...fade(0.32)} className="flex gap-8 flex-1">
          <DataItem title={t("issueDate")} value="7 مايو 2026" />
          <DataItem title={t("validity")} value={`30 ${tc("days")}`} />
        </motion.dl>

        <motion.div
          {...fade(0.5)}
          className="flex justify-center my-5 text-xs text-muted-foreground uppercase"
        >
          <div className="animate-bounce text-center flex items-center justify-center flex-col gap-1">
            <ScrollArrowIcon />
            Scroll
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

// ── Rising number hook ──────────────────────────────────────────
function useCountUp(target: number, delay = 0) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });

  useEffect(() => {
    if (!inView) return;
    const el = ref.current;
    if (!el) return;

    const timeout = setTimeout(() => {
      const controls = animate(0, target, {
        duration: 1,
        ease: "easeOut",
        onUpdate: (v) => {
          el.textContent = String(Math.round(v));
        },
      });
      return () => controls.stop();
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [inView, target, delay]);

  return ref;
}

// ── StatsCard ───────────────────────────────────────────────────
const StatsCard = ({
  label,
  value,
  index,
}: {
  label: string;
  value: number;
  index: number;
}) => {
  const countRef = useCountUp(value, 0.3 + index * 0.07);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 + index * 0.07 }}
      className="p-6 flex flex-col gap-1.5 sm:not-last:border-e max-sm:border-b border-e-border border-b-border bg-white w-full flex-1"
    >
      <span ref={countRef} className="text-3xl font-bold leading-none">
        0
      </span>
      <h2 className="text-xs text-muted-foreground leading-normal">{label}</h2>
    </motion.div>
  );
};

// ── DataItem ────────────────────────────────────────────────────
const DataItem = ({ title, value }: { title: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <dt className="uppercase text-xs font-semibold text-[#aeaeb2]">{title}</dt>
    <dd className="text-sm text-muted-foreground">{value}</dd>
  </div>
);
