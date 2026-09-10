"use client";

import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Moon, Sun, ArrowUpRight } from "lucide-react";
import { MotionConfig } from "motion/react";
import { Link } from "@/i18n/routing";
import useDashboardTheme from "@/stores/dashboardTheme";
import { geistSans, geistMono } from "@/lib/site-fonts";
import { Brand } from "./Brand";
import "./login.css";

export function LoginShell({ children }: { children: ReactNode }) {
  const t = useTranslations("auth");
  const theme = useDashboardTheme((s) => s.theme);
  const toggle = useDashboardTheme((s) => s.toggle);
  return (
    <MotionConfig reducedMotion="user">
      <div data-auth data-theme={theme} className={`${geistSans.variable} ${geistMono.variable} auth-shell`}>
        <header className="auth-header">
          <Link href="/" className="auth-brand" aria-label="Codescope"><Brand /></Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="auth-back-link">{t("back_site")}<ArrowUpRight className="size-4 rtl:-scale-x-100" /></Link>
            <button type="button" className="auth-theme-toggle" onClick={toggle} aria-label={t(theme === "dark" ? "theme_light" : "theme_dark")} title={t(theme === "dark" ? "theme_light" : "theme_dark")}>
              {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </button>
          </div>
        </header>
        {children}
      </div>
    </MotionConfig>
  );
}
