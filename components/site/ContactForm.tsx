"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { PaperPlaneTilt, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { DURATION, EASE, EASE_OUT } from "@/lib/motion";
import TurnstileWidget, { turnstileActive } from "@/components/site/TurnstileWidget";

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const t = useTranslations("Contact.form");
  const tCommon = useTranslations("common");
  // Sent with the submission so the dashboard knows which language to reply in
  // — the message itself is not always a reliable signal.
  const locale = useLocale();

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  // Null until Turnstile solves, and again whenever the token expires or the
  // server refuses it. With no site key configured the widget renders nothing
  // and this stays null — which is why every gate below is `turnstileActive &&`.
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // Bumped to force a fresh challenge: a Turnstile token is single-use, so
  // re-submitting the rejected one would fail identically forever.
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [captchaRejected, setCaptchaRejected] = useState(false);
  const reduced = useReducedMotionSafe();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setCaptchaRejected(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, locale, turnstileToken: captchaToken }),
      });
      if (!res.ok) {
        // A refused challenge is recoverable in place, so it gets its own copy
        // and a fresh widget rather than the generic "email us instead".
        const reason = await res
          .json()
          .then((body: { error?: string }) => body?.error)
          .catch(() => undefined);
        if (reason === "captcha_failed") {
          setCaptchaRejected(true);
          setCaptchaToken(null);
          setCaptchaNonce((n) => n + 1);
          setStatus("error");
          return;
        }
        throw new Error(`contact ${res.status}`);
      }
      setStatus("success");
    } catch {
      // The error copy already routes the visitor to info@codescope.dev — an
      // honest failure beats a fake checkmark on the site's only lead path.
      setStatus("error");
    }
  }

  // `zinc-500`, not `zinc-600`: the placeholder is the only guidance about
  // what a field wants, and at zinc-600 on a zinc-900 input it sat at 2.2:1 —
  // legible as a shape, not as words.
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/8 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-cs-teal/50 focus:ring-2 focus:ring-cs-teal/15 transition-all duration-200";

  if (status === "success") {
    // No `AnimatePresence` here: this card REPLACES the form rather than being
    // conditionally rendered beside it, so there is no exit for a presence
    // wrapper to animate — it only made the entrance look supervised.
    return (
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: DURATION.base, ease: EASE }}
        role="status"
        className="glass-card rounded-2xl p-10 flex flex-col items-center text-center gap-4"
      >
        <CheckCircle size={44} weight="duotone" className="text-cs-teal" />
        <p className="text-white font-semibold text-lg">{t("success")}</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="name"
          className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
        >
          {t("name")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder={t("namePlaceholder")}
          value={form.name}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
        >
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          value={form.email}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="message"
          className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
        >
          {t("message")}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder={t("messagePlaceholder")}
          value={form.message}
          onChange={handleChange}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* An error message must not arrive on a slide for someone who asked for
          no motion — under reduced motion it simply appears. */}
      <AnimatePresence>
        {status === "error" && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduced ? 0 : DURATION.fast, ease: EASE_OUT }}
            role="alert"
            className="flex items-center gap-2 text-sm text-red-400"
          >
            <WarningCircle size={16} />
            {captchaRejected ? tCommon("captchaError") : t("error")}
          </motion.div>
        )}
      </AnimatePresence>

      <TurnstileWidget onToken={setCaptchaToken} resetSignal={captchaNonce} />

      <motion.button
        type="submit"
        // Only gated when a site key is configured: with Turnstile off there is
        // no token to wait for and the button must behave exactly as before.
        disabled={
          status === "sending" || (turnstileActive && captchaToken === null)
        }
        // House curve rather than a per-file spring: `stiffness`/`damping`
        // numbers are a second motion vocabulary, and this is a discrete
        // press, not the continuous pointer-tracking a spring exists for.
        whileHover={reduced ? undefined : { scale: 1.01 }}
        whileTap={reduced ? undefined : { scale: 0.98 }}
        transition={{ duration: DURATION.instant, ease: EASE_OUT }}
        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cs-teal text-white text-sm font-semibold rounded-xl hover:bg-cs-teal-hover transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "sending" ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t("sending")}
          </>
        ) : (
          <>
            <PaperPlaneTilt size={16} weight="bold" className="rtl:-scale-x-100" />
            {t("submit")}
          </>
        )}
      </motion.button>
    </form>
  );
}
