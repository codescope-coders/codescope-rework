"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSendOtp, useVerifyOtp, type OtpError } from "@/hooks/useOtp";
import { OtpInput } from "./OtpInput";

type Step = "credentials" | "otp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const rtl = locale === "ar";
  const reduce = useReducedMotion();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("credentials");
  const [cooldown, setCooldown] = useState(0);
  const [expiresIn, setExpiresIn] = useState(0);
  const [emailError, setEmailError] = useState<string | null>(null);

  const send = useSendOtp();
  const verify = useVerifyOtp();
  const isLoading = send.isPending || verify.isPending;
  const canSubmit = email.trim().length > 0;

  // Seed resend cooldown + code expiry from a successful send.
  const seedTimers = (data: { payload: { cooldown: number; expiresIn: number } }) => {
    setCooldown(data.payload.cooldown > 0 ? data.payload.cooldown : 30);
    setExpiresIn(data.payload.expiresIn > 0 ? data.payload.expiresIn : 0);
  };

  // One ticking interval while on the OTP step; both counters clamp at 0.
  useEffect(() => {
    if (step !== "otp") return;
    const id = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
      setExpiresIn((e) => (e > 0 ? e - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  // Map a known server error code to localized copy, else the server message,
  // else a generic fallback.
  function decodeError(err: unknown, fallbackKey: string): string {
    const e = err as OtpError | undefined;
    const map: Record<string, string> = {
      NO_CONSOLE_ACCESS: t("no_access"),
      OTP_RATE_LIMITED: t("rate_limited"),
      OTP_EXPIRED: t("invalid_otp"),
      OTP_TOO_MANY_ATTEMPTS: t("too_many_attempts"),
      INVALID_OTP: t("invalid_otp"),
    };
    if (e?.code && map[e.code]) return map[e.code];
    return e?.message ?? t(fallbackKey);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError(t("email_invalid"));
      return;
    }
    setEmailError(null);
    send.mutate(email.trim(), {
      onSuccess: (data) => {
        seedTimers(data);
        setOtp("");
        verify.reset();
        setStep("otp");
      },
    });
  }

  // Submit a code (guarded: only a full 6 digits, never while in flight).
  function submitCode(code: string) {
    if (code.length < 6 || isLoading) return;
    verify.mutate(
      { email: email.trim(), code },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          router.push("/dashboard");
        },
      },
    );
  }

  // Auto-submit the moment the 6th digit lands (typed or pasted).
  function handleOtpChange(value: string) {
    setOtp(value);
    if (value.length === 6) submitCode(value);
  }

  function handleResend() {
    setOtp("");
    verify.reset();
    send.mutate(email.trim(), { onSuccess: (data) => seedTimers(data) });
  }

  function handleBack() {
    setStep("credentials");
    setOtp("");
    send.reset();
    verify.reset();
  }

  const mmss = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // Step transition slides along the reading direction (negated under RTL).
  const enterX = reduce ? 0 : rtl ? -12 : 12;
  const exitX = reduce ? 0 : rtl ? 12 : -12;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {step === "credentials" ? (
        <motion.div
          key="credentials"
          initial={{ opacity: 0, x: enterX }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: exitX }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("login_title")}
            </h1>
            <p className="mt-1.5 text-sm text-subtitle-color">
              {t("login_subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t("email_label")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                dir="ltr"
                variant="background"
                autoComplete="email"
                inputMode="email"
                placeholder={t("email_placeholder")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                disabled={isLoading}
                autoFocus
                error={[emailError, send.error ? decodeError(send.error, "invalid_otp") : null]}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !canSubmit}
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {isLoading ? t("logging_in") : t("continue")}
              {!isLoading && <ArrowRight className="size-4 rtl:rotate-180" />}
            </Button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          key="otp"
          initial={{ opacity: 0, x: enterX }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: exitX }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ms-2 self-start text-subtitle-color"
              onClick={handleBack}
              disabled={isLoading}
            >
              <ChevronLeft className="size-4 rtl:rotate-180" />
              {t("back")}
            </Button>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("verify_title")}
              </h1>
              <p className="mt-1.5 text-sm text-subtitle-color">
                {t("otp_sent")}{" "}
                <span dir="ltr" className="font-semibold text-foreground">
                  {email.trim()}
                </span>
              </p>
            </div>
          </div>

          <OtpInput
            value={otp}
            onChange={handleOtpChange}
            disabled={isLoading}
            autoFocus
          />

          {(verify.error || send.error) && (
            <p role="alert" className="text-sm font-medium text-invalid-color">
              {decodeError(verify.error ?? send.error, "invalid_otp")}
            </p>
          )}

          <Button
            type="button"
            className="w-full"
            onClick={() => submitCode(otp)}
            disabled={isLoading || otp.length < 6}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isLoading ? t("logging_in") : t("verify")}
          </Button>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            {expiresIn > 0 ? (
              <span className="text-xs text-subtitle-color">
                {t("otp_expires_in")}{" "}
                <span dir="ltr" className="tabular-nums">
                  {mmss(expiresIn)}
                </span>
              </span>
            ) : (
              <span aria-hidden />
            )}

            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={handleResend}
              disabled={isLoading || cooldown > 0}
            >
              {cooldown > 0 ? (
                <>
                  {t("resend")}{" "}
                  <span dir="ltr" className="tabular-nums">
                    ({cooldown}s)
                  </span>
                </>
              ) : (
                t("resend")
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
