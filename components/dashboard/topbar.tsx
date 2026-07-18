"use client";

import { useEffect, useState } from "react";
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
import { Link, usePathname, useRouter } from "@/i18n/routing";
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

const LOCALES = [
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },
] as const;

/** Shared style for the bar's icon-button triggers. */
function triggerClasses(open: boolean, extra?: string) {
  return cn(
    "flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-lg px-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-foreground",
    open && "bg-neutral-100 text-foreground",
    extra,
  );
}

export function Topbar() {
  const t = useTranslations("dash");
  const tf = (k: string, fb: string) => (t.has(k) ? t(k) : fb);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const openMobile = useSidebar((s) => s.openMobile);
  const theme = useDashboardTheme((s) => s.theme);
  const toggleTheme = useDashboardTheme((s) => s.toggle);
  const openPalette = useCommandPalette((s) => s.openPalette);
  const { data } = useMe();
  const user = data?.payload;
  const logout = useLogout();
  const can = useCan();

  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform));
  }, []);

  const roleLabel = user ? tf(`roles.${user.role}`, user.role) : "";
  const initials = (user?.name || user?.email || "?").slice(0, 1).toUpperCase();
  const switchLocale = (loc: string) => {
    if (loc !== locale) router.push(pathname, { locale: loc as "en" | "ar" });
  };

  return (
    <header className="relative z-30 mx-4 mt-1 sm:mx-1">
      <div className="flex h-14 items-center gap-3 rounded-[20px] border border-border bg-overlay/90 px-3 shadow-[0_8px_24px_-12px_rgba(17,17,17,0.14)] backdrop-blur sm:px-4">
        {/* Mobile — open the nav drawer */}
        <button
          type="button"
          onClick={openMobile}
          aria-label={tf("common.open_nav", "القائمة")}
          className={triggerClasses(false, "-ms-1 lg:hidden")}
        >
          <Menu className="size-5" />
        </button>

        {/* Left — breadcrumb navigation context */}
        <div className="flex min-w-0 flex-1 items-center">
          <Breadcrumb />
        </div>

        {/* Right — search, language, notifications, theme, account */}
        <div className="flex shrink-0 items-center gap-1">
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
                aria-label="language"
                className={triggerClasses(open)}
              >
                <Globe className="size-4.5" />
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
            aria-label={tf("common.theme", "المظهر")}
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

          <span className="mx-1.5 h-6 w-px bg-border" />

          {/* Account */}
          <HeaderMenu
            width={260}
            trigger={({ open, toggle }) => (
              <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-label="account"
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
