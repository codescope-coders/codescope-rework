"use client";

import { geistSans } from "@/lib/site-fonts";
import { useVariablesStore } from "@/stores/variables";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

const splitWords = (text: string) => text.split(" ");

const container = (stagger: number): Variants => ({
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
    },
  },
});

const word: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 12,
      stiffness: 100,
      mass: 0.5,
    },
  },
};

/**
 * The full-screen confirmation shown after a careers application is accepted.
 *
 * Rendered by the ROOT layout (shared with the internal dashboard), inside the
 * `NextIntlClientProvider` — so `useTranslations` works here and the wiring is
 * unchanged. Only its two sentences moved into messages; they were hardcoded
 * ENGLISH, which meant an Arabic applicant who had just filled in an Arabic
 * form was thanked in a language they may not read. The Arabic side is the one
 * piece of copy in this phase that had to be AUTHORED rather than ported, for
 * exactly that reason.
 */
export const ApplicationSentMessage = () => {
  const t = useTranslations("Jobs");
  const { isMessageVisible, hideMessage } = useVariablesStore();

  useEffect(() => {
    if (!isMessageVisible) return;

    const timer = setTimeout(hideMessage, 3000);
    return () => clearTimeout(timer);
  }, [isMessageVisible, hideMessage]);

  useEffect(() => {
    if (isMessageVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMessageVisible]);

  const titleWords = splitWords(t("sent.title"));

  const captionWords = splitWords(t("sent.body"));

  return (
    <AnimatePresence>
      {isMessageVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 120,
          }}
          /* The site type stack, applied HERE rather than inherited.
             `showMessage` has exactly one caller — the careers application form
             — so this overlay is the last screen of a flow that is entirely in
             the public design system. But it is mounted by the ROOT layout,
             OUTSIDE the `(client)` shell, so it inherited the root `<body>`
             font and rendered that final screen in Urbanist / Dahab while every
             page leading to it was Geist / IBM Plex Sans Arabic (measured:
             `Urbanist, "Urbanist Fallback"`).

             ⚠️ Two things this deliberately does NOT do, both tried and
             rejected:

             1. It does not set `data-site="public"`. That attribute matches
                more than the font rule — it also pulls in `color: #a1a1aa`,
                which is UNLAYERED and therefore beats the layered `text-white`
                utility on this very element. Measured: the confirmation text
                went from white to zinc on the teal ground.
             2. It does not rely on the stylesheet's public family alone. That
                rule reads `var(--font-geist-sans)`, a variable declared on the
                `(client)` layout root — an element this component is a SIBLING
                of, not a descendant. An unresolvable `var()` invalidates the
                whole declaration at computed-value time, so it is dropped and
                the element falls back to the inherited font with no warning.
                `geistSans.variable` below is what makes it resolvable, and the
                same trap is documented at the `[data-site="public"]` rule.

             The Arabic face is FIRST because next/font's metric-adjusted
             `Geist Fallback` is backed by a local face that covers Arabic and
             would otherwise claim those glyphs. It is safe in front of Geist
             because that family is `unicode-range`-limited to Arabic — see the
             @font-face block in `globals.css`. One stack serves both locales:
             Arabic to Plex, Latin to Geist. */
          className={`${geistSans.variable} fixed inset-0 bg-primary text-white flex flex-col items-center justify-center z-100`}
          style={{
            fontFamily:
              '"IBM Plex Sans Arabic Fallback", var(--font-geist-sans), sans-serif',
          }}
        >
          <motion.h2
            variants={container(0.12)}
            initial="hidden"
            animate="visible"
            className="text-4xl font-bold mb-4 text-center flex flex-wrap justify-center gap-x-2"
          >
            {titleWords.map((wordText, i) => (
              <motion.span key={i} variants={word}>
                {wordText}
              </motion.span>
            ))}
          </motion.h2>

          <motion.p
            variants={container(0.02)}
            initial="hidden"
            animate="visible"
            className="text-lg md:max-w-md leading-tight mx-auto text-center flex flex-wrap justify-center gap-x-1"
          >
            {captionWords.map((wordText, i) => (
              <motion.span key={i} variants={word}>
                {wordText}
              </motion.span>
            ))}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
