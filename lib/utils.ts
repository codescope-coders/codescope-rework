import { supportedLanguages } from "@/i18n/supportedLanguages";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDir = (locale: string) =>
  supportedLanguages.find((lang) => lang.code === locale)?.isRtl
    ? "rtl"
    : "ltr";
