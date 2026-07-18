"use client";

import { useEffect, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { useTranslations } from "next-intl";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Focus the first box on mount (used when the OTP step enters). */
  autoFocus?: boolean;
}

// Controlled 6-box code widget driven by a single string. Hardcoded LTR so the
// digits stay left-to-right even under RTL locales.
export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled,
  autoFocus,
}: OtpInputProps) {
  const t = useTranslations("auth");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value
    .split("")
    .concat(Array(length).fill(""))
    .slice(0, length);

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  function handleChange(index: number, char: string) {
    if (!/^\d?$/.test(char)) return;
    const arr = digits.slice();
    arr[index] = char;
    onChange(arr.join(""));
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  }

  return (
    <div
      className="flex justify-between gap-2 sm:gap-2.5"
      dir="ltr"
      role="group"
      aria-label={t("otp_group_label")}
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={t("otp_digit_label", { index: i + 1, total: length })}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="h-12 w-full rounded-md border border-input-border bg-background text-center text-lg font-bold text-foreground outline-none transition-colors focus:border-primary focus:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
        />
      ))}
    </div>
  );
}
