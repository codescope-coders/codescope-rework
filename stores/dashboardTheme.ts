"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface DashboardThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

/**
 * Light/dark for the dashboard only. The shell wrapper applies it as a
 * `data-theme` attribute on its own subtree (see globals.css), so the public
 * marketing site is never affected. Persisted per-device.
 */
export const useDashboardTheme = create<DashboardThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
      toggle: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    }),
    { name: "cs-dashboard-theme" },
  ),
);

export default useDashboardTheme;
