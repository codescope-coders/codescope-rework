"use client";

import { useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { motion, AnimatePresence } from "motion/react";
import { PaperPlaneTilt, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { DURATION, EASE, EASE_OUT } from "@/lib/motion";

/**
 * The `/get-started` form — the site's real lead path.
 *
 * ── What makes it different from `ContactForm` ─────────────────────────────
 * Contact is "say anything to us". This is "start buying", so it asks for the
 * two things a sales conversation cannot begin without — a package and a phone
 * number — and it PRE-WRITES the message in the visitor's own language so the
 * hardest field on any form ("describe your requirement") starts answered.
 *
 * ── The prefill is a default, never a cage ─────────────────────────────────
 * Switching package swaps the template ONLY while the box still holds a
 * template (or nothing). The moment the visitor types their own words, the
 * package buttons stop touching the textarea — a form that erased what someone
 * just wrote because they clicked a different tier would be worse than no
 * prefill at all. An emptied box counts as untouched: refilling it destroys
 * nothing, and it is the one state where the template is most welcome back.
 */

const PACKAGES = ["charter", "standard", "advanced"] as const;
type PackageId = (typeof PACKAGES)[number];
/** The fourth option. Deliberately not a package: it is submitted as `null`. */
const NOT_SURE = "notSure" as const;
type Choice = PackageId | typeof NOT_SURE;

const CHOICES: Choice[] = [...PACKAGES, NOT_SURE];

function isPackageId(value: string | null): value is PackageId {
  return PACKAGES.includes(value as PackageId);
}

/** Same lenient shape the API enforces — see `app/api/package-requests`. A
 *  stricter client rule than the server's would reject numbers the server
 *  would happily have taken. */
const PHONE_SHAPE = /^[0-9+()\-.\s]{7,32}$/;
const MIN_PHONE_DIGITS = 7;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "sending" | "success" | "error";
type FieldKey = "name" | "email" | "phone" | "message";

export default function GetStartedForm() {
  const t = useTranslations("GetStarted");
  const locale = useLocale();
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const successRef = useRef<HTMLDivElement>(null);

  // `?package=` is both the initial selection and the shareable state of the
  // page, so it stays in the URL as the visitor changes it (replace, not push —
  // picking a tier is not a navigation the back button should have to undo).
  const [rawPackage, setRawPackage] = useQueryState("package");
  const choice: Choice = isPackageId(rawPackage) ? rawPackage : NOT_SURE;

  const templateFor = (c: Choice) => t(`messages.${c}`);

  const [form, setForm] = useState({
    name: "",
    agency: "",
    email: "",
    phone: "",
    // Read once, at mount, from whatever the query param selected.
    message: templateFor(isPackageId(rawPackage) ? rawPackage : NOT_SURE),
    // The honeypot. Named `company` because that is what a form-filling bot
    // expects to find and fill; a human never sees it.
    company: "",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState<Status>("idle");

  /** True once the textarea holds something that is neither empty nor the
   *  template for the currently-selected package. */
  const messageIsOwn =
    form.message.trim() !== "" && form.message !== templateFor(choice);

  function selectPackage(next: Choice) {
    setRawPackage(next === NOT_SURE ? null : next, { history: "replace" });
    if (!messageIsOwn) {
      setForm((prev) => ({ ...prev, message: templateFor(next) }));
      setErrors((prev) => ({ ...prev, message: undefined }));
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear a field's error the moment it is touched — leaving a red line under
    // a field someone is actively fixing is just nagging.
    if (name in errors)
      setErrors((prev) => ({ ...prev, [name as FieldKey]: undefined }));
  }

  function validate() {
    const next: Partial<Record<FieldKey, string>> = {};
    if (!form.name.trim()) next.name = t("validation.name");
    if (!EMAIL_SHAPE.test(form.email.trim())) next.email = t("validation.email");
    const phone = form.phone.trim();
    if (
      !PHONE_SHAPE.test(phone) ||
      (phone.match(/\d/g) ?? []).length < MIN_PHONE_DIGITS
    )
      next.phone = t("validation.phone");
    if (!form.message.trim()) next.message = t("validation.message");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/package-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          agency: form.agency.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
          // The server maps this to the DB enum; "notSure" becomes a null
          // package rather than a tier nobody chose.
          package: choice === NOT_SURE ? "" : choice.toUpperCase(),
          locale,
          company: form.company,
        }),
      });
      if (!res.ok) throw new Error(`get-started ${res.status}`);
      setStatus("success");
      // The form is gone, so focus has nowhere to be — move it to the
      // confirmation or a keyboard/screen-reader user is left on a detached
      // node with no idea the submission worked.
      requestAnimationFrame(() => successRef.current?.focus());
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/8 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-cs-teal/50 focus:ring-2 focus:ring-cs-teal/15 transition-all duration-200";
  const errorClass = "border-red-400/50 focus:border-red-400/60";
  const labelClass =
    "text-xs font-semibold text-zinc-400 uppercase tracking-wider";

  if (status === "success") {
    return (
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: DURATION.base, ease: EASE }}
        role="status"
        ref={successRef}
        tabIndex={-1}
        className="glass-card rounded-2xl p-10 flex flex-col items-center text-center gap-4 outline-none"
      >
        <CheckCircle size={44} weight="duotone" className="text-cs-teal" />
        <p className="text-white font-semibold text-lg">{t("success.heading")}</p>
        <p className="text-zinc-300 text-sm leading-relaxed max-w-[38ch]">
          {t("success.body")}
        </p>
      </motion.div>
    );
  }

  const fieldError = (key: FieldKey) =>
    errors[key] ? (
      <span id={`${uid}-${key}-error`} role="alert" className="text-xs text-red-400">
        {errors[key]}
      </span>
    ) : null;

  const a11y = (key: FieldKey) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${uid}-${key}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Honeypot. `aria-hidden` + `tabIndex={-1}` keep it out of the keyboard
          and screen-reader path; it is off-screen rather than `display:none`
          because some bots skip what is explicitly hidden. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${uid}-company`}>Company</label>
        <input
          id={`${uid}-company`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={handleChange}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-name`} className={labelClass}>
            {t("form.name")}
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            type="text"
            autoComplete="name"
            placeholder={t("form.namePlaceholder")}
            value={form.name}
            onChange={handleChange}
            className={`${inputClass} ${errors.name ? errorClass : ""}`}
            {...a11y("name")}
          />
          {fieldError("name")}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-agency`} className={labelClass}>
            {t("form.agency")}
          </label>
          <input
            id={`${uid}-agency`}
            name="agency"
            type="text"
            autoComplete="organization"
            placeholder={t("form.agencyPlaceholder")}
            value={form.agency}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-email`} className={labelClass}>
            {t("form.email")}
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            placeholder={t("form.emailPlaceholder")}
            value={form.email}
            onChange={handleChange}
            className={`${inputClass} text-start ${errors.email ? errorClass : ""}`}
            {...a11y("email")}
          />
          {fieldError("email")}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-phone`} className={labelClass}>
            {t("form.phone")}
          </label>
          {/* `dir="ltr"` + `text-start`: a phone number is written left to
              right in every locale, and under RTL the leading `+` otherwise
              renders at the wrong end of the number. */}
          <input
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder={t("form.phonePlaceholder")}
            value={form.phone}
            onChange={handleChange}
            className={`${inputClass} text-start ${errors.phone ? errorClass : ""}`}
            {...a11y("phone")}
          />
          {fieldError("phone")}
        </div>
      </div>

      {/* Real radios, not buttons: arrow-key navigation, a single tab stop and
          the selected-state announcement all come free and correct. */}
      <fieldset className="flex flex-col gap-2">
        <legend className={`${labelClass} mb-2`}>{t("form.package")}</legend>
        <div className="flex flex-wrap gap-2">
          {CHOICES.map((c) => {
            const active = choice === c;
            return (
              <label
                key={c}
                className={[
                  "cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors duration-200",
                  "focus-within:ring-2 focus-within:ring-cs-teal/40",
                  active
                    ? "border-cs-teal bg-cs-teal text-white"
                    : "border-white/10 bg-white/4 text-zinc-300 hover:border-cs-teal/40 hover:text-white",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="package"
                  value={c}
                  checked={active}
                  onChange={() => selectPackage(c)}
                  className="sr-only"
                />
                {t(`packages.${c}`)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${uid}-message`} className={labelClass}>
          {t("form.message")}
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={6}
          value={form.message}
          onChange={handleChange}
          className={`${inputClass} resize-none ${errors.message ? errorClass : ""}`}
          {...a11y("message")}
        />
        {fieldError("message")}
      </div>

      <AnimatePresence>
        {status === "error" && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduced ? 0 : DURATION.fast, ease: EASE_OUT }}
            role="alert"
            className="flex items-start gap-2 text-sm text-red-400"
          >
            <WarningCircle size={16} className="mt-0.5 shrink-0" />
            {t("error")}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={status === "sending"}
        whileHover={reduced ? undefined : { scale: 1.01 }}
        whileTap={reduced ? undefined : { scale: 0.98 }}
        transition={{ duration: DURATION.instant, ease: EASE_OUT }}
        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cs-teal text-white text-sm font-semibold rounded-xl hover:bg-cs-teal-hover transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "sending" ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t("form.sending")}
          </>
        ) : (
          <>
            <PaperPlaneTilt size={16} weight="bold" className="rtl:-scale-x-100" />
            {t("form.submit")}
          </>
        )}
      </motion.button>
    </form>
  );
}
