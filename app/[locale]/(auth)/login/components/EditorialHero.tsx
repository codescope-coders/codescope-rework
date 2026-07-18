"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { Brand } from "./Brand";

// Rotating value phrases reuse dedicated auth keys, so every locale works with
// no extra copy. Auto-rotation is off under prefers-reduced-motion.
const PHRASE_KEYS = [
  "value_prop_apps",
  "value_prop_web",
  "value_prop_delivery",
] as const;
const ROTATE_MS = 3200;

export function EditorialHero() {
  const t = useTranslations("auth");
  const reduce = useReducedMotion();
  const [phrase, setPhrase] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(
      () => setPhrase((p) => (p + 1) % PHRASE_KEYS.length),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, [reduce]);

  const container: Variants = {
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.04 } },
  };
  const rise: Variants = {
    hidden: reduce ? {} : { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={container}
      className="flex flex-col gap-7"
    >
      <motion.div variants={rise}>
        <Brand />
      </motion.div>

      <motion.p
        variants={rise}
        className="text-balance text-[2rem] font-bold leading-[1.06] tracking-tight text-foreground sm:text-[2.75rem] lg:text-5xl"
      >
        {t("panel_tagline")}
      </motion.p>

      {/* Rotating value phrase — blur-fades between a few readable phrases. */}
      <motion.div
        variants={rise}
        className="relative min-h-[2.25rem]"
        aria-live="off"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={phrase}
            initial={{ opacity: 0, filter: "blur(8px)", y: 6 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(8px)", y: -6 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg font-medium text-subtitle-color sm:text-xl"
          >
            {t(PHRASE_KEYS[phrase])}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
