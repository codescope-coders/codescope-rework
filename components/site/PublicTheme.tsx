"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Sun, Moon } from "lucide-react";
import { type ReactNode, useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Separate from the dashboard preference. The provider's pre-paint script
 * restores the saved public theme before the page becomes visible. */
export function PublicTheme({ children }: { children: ReactNode }) {
  return <ThemeProvider attribute="data-public-theme" storageKey="cs-public-theme" defaultTheme="dark" enableSystem={false} enableColorScheme={false}>{children}</ThemeProvider>;
}

export function PublicThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("Nav");
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const light = mounted && resolvedTheme === "light";
  return (
    <button type="button" className="site-theme-toggle" onClick={() => setTheme(light ? "dark" : "light")} aria-label={t(light ? "themeDark" : "themeLight")} title={t(light ? "themeDark" : "themeLight")}>
      <Sun className="site-theme-sun" size={18} aria-hidden="true" />
      <Moon className="site-theme-moon" size={18} aria-hidden="true" />
    </button>
  );
}
