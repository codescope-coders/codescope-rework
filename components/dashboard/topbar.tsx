"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import {
  ChevronDown,
  Globe,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
} from "lucide-react";
import { Link } from "@/i18n/internal-routing";
import { useSwitchLocale } from "@/lib/useSwitchLocale";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/stores/sidebar";
import useDashboardTheme from "@/stores/dashboardTheme";
import { useCommandPalette } from "@/stores/commandPalette";
import { useMe } from "@/hooks/useMe";
import { useLogout } from "@/hooks/useLogout";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { NotificationBell } from "./notification-bell";
import { HeaderMenu } from "./header/header-menu";
import { Breadcrumb } from "./header/breadcrumb";

const subscribePlatform = () => () => {};
const getPlatform = () => /Mac|iPhone|iPad/i.test(navigator.platform);
const getServerPlatform = () => false;

const LOCALES = [
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },
] as const;

/** Shared style for the bar's icon-button triggers. */
function triggerClasses(open: boolean, extra?: string) {
  return cn(
    "flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-foreground",
    open && "bg-neutral-100 text-foreground",
    extra,
  );
}

export function Topbar() {
  const t = useTranslations("dash");
  const tf = (k: string, fb: string) => (t.has(k) ? t(k) : fb);
  const locale = useLocale();
  const openMobile = useSidebar((s) => s.openMobile);
  const mobileOpen = useSidebar((s) => s.mobileOpen);
  const theme = useDashboardTheme((s) => s.theme);
  const toggleTheme = useDashboardTheme((s) => s.toggle);
  const openPalette = useCommandPalette((s) => s.openPalette);
  const { data } = useMe();
  const user = data?.payload;
  const logout = useLogout();
  const can = useCan();

  const isMac = useSyncExternalStore(subscribePlatform, getPlatform, getServerPlatform);

  const roleLabel = user ? tf(`roles.${user.role}`, user.role) : "";
  const initials = (user?.name || user?.email || "?").slice(0, 1).toUpperCase();
  // Cookie + server refresh, not a navigation: the locale is no longer part of
  // the URL, and pushing one would bounce through `/ar/dashboard` and lose the
  // reader's place. See `useSwitchLocale`.
  const { switchLocale } = useSwitchLocale();

  return (
    <header className="dashboard-topbar relative z-30 mx-2 mt-2 shrink-0 lg:mx-4">
      <div className="flex min-h-16 items-center gap-1 sm:gap-3 rounded-[20px] border border-border bg-overlay px-2 shadow-[0_8px_24px_-12px_rgba(17,17,17,0.14)] sm:px-4">
        {/* Mobile — open the nav drawer */}
        <button
          type="button"
          onClick={openMobile}
          aria-label={locale === "ar" ? "فتح القائمة" : "Open navigation"}
          aria-expanded={mobileOpen}
          className={triggerClasses(false, "-ms-1 lg:hidden")}
        >
          <Menu className="size-5" />
        </button>

        {/* Left — breadcrumb navigation context */}
        <div className="hidden min-w-0 flex-1 items-center sm:flex">
          <Breadcrumb />
        </div>

        {/* Right — search, language, notifications, theme, account */}
        <div className="ms-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={openPalette}
            aria-label={tf("common.search", "بحث")}
            className="group hidden h-9 w-52 items-center gap-2 rounded-lg border border-border bg-overlay/60 pe-2 ps-2.5 text-neutral-500 transition-colors hover:border-neutral-400 hover:bg-overlay hover:text-foreground lg:flex lg:w-60"
          >
            <Search className="size-4 shrink-0" />
            <span className="flex-1 truncate text-start text-[13px]">
              {tf("common.command_placeholder", "ابحث عن صفحة...")}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="kbd">{isMac ? "⌘" : "Ctrl"}</span>
              <span className="kbd">K</span>
            </span>
          </button>
          <button
            type="button"
            onClick={openPalette}
            aria-label={tf("common.search", "بحث")}
            className={triggerClasses(false, "lg:hidden")}
          >
            <Search className="size-4.5" />
          </button>

          <span className="mx-1.5 hidden h-6 w-px bg-border sm:block" />

          {/* Language */}
          <HeaderMenu
            width={200}
            trigger={({ open, toggle }) => (
              <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-label={locale === "ar" ? "اللغة" : "Language"}
                className={triggerClasses(open)}
              >
                <Globe className="hidden size-4.5 sm:block" />
                <span className="text-[13px] font-medium uppercase">{locale}</span>
              </button>
            )}
          >
            {(close) => (
              <div className="p-1.5">
                {LOCALES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      switchLocale(l.code);
                      close();
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-[13px] transition-colors hover:bg-neutral-100",
                      locale === l.code
                        ? "font-semibold text-foreground"
                        : "text-neutral-600",
                    )}
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-md bg-neutral-100 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                      {l.code}
                    </span>
                    <span className="flex-1 truncate">{l.name}</span>
                    {locale === l.code && (
                      <span className="size-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </HeaderMenu>

          <span className="mx-1.5 hidden h-6 w-px bg-border sm:block" />

          <NotificationBell />

          {/* Theme — animated icon swap */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={locale === "ar" ? "الوضع الداكن" : "Dark mode"}
            aria-pressed={theme === "dark"}
            title={theme === "light" ? (locale === "ar" ? "تفعيل الوضع الداكن" : "Switch to dark mode") : (locale === "ar" ? "تفعيل الوضع الفاتح" : "Switch to light mode")}
            className={triggerClasses(false)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "light" ? (
                <motion.span
                  key="moon"
                  initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="grid place-items-center"
                >
                  <Moon className="size-4.5" />
                </motion.span>
              ) : (
                <motion.span
                  key="sun"
                  initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="grid place-items-center"
                >
                  <Sun className="size-4.5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <span className="mx-1.5 hidden h-6 w-px bg-border sm:block" />

          {/* Account */}
          <HeaderMenu
            width={260}
            trigger={({ open, toggle }) => (
              <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-label={locale === "ar" ? "الحساب" : "Account"}
                className={cn(
                  "flex h-10 items-center gap-1 rounded-full pe-1.5 ps-1 transition-colors hover:bg-neutral-100",
                  open && "bg-neutral-100",
                )}
              >
                <span className="grid size-8 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-sm ring-2 ring-overlay">
                  {initials}
                </span>
                <ChevronDown
                  className={cn(
                    "hidden size-3.5 text-neutral-400 transition-transform duration-150 sm:block",
                    open && "rotate-180",
                  )}
                />
              </button>
            )}
          >
            {(close) => (
              <div>
                <div className="flex items-center gap-3 border-b border-border/70 px-3 py-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {initials}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-[13px] font-semibold text-foreground">
                      {user?.name || user?.email}
                    </span>
                    <span className="truncate text-[11px] text-neutral-500">
                      {roleLabel}
                    </span>
                  </div>
                </div>
                <div className="p-1.5">
                  {can(PERMISSIONS.MANAGE_SETTINGS) && (
                    <Link
                      href="/dashboard/settings"
                      onClick={close}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-foreground"
                    >
                      <Settings className="size-4" />
                      {tf("nav.settings", "الإعدادات")}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      logout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-[13px] font-medium text-destructive-600 transition-colors hover:bg-destructive-50"
                  >
                    <LogOut className="size-4" />
                    {tf("common.logout", "تسجيل خروج")}
                  </button>
                </div>
              </div>
            )}
          </HeaderMenu>
        </div>
      </div>
    </header>
  );
}
