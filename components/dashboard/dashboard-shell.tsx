"use client";

import { MotionConfig } from "motion/react";
import { dashboardFontVariables } from "@/lib/dashboard/appearance";
import "./dashboard.css";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import useDashboardTheme from "@/stores/dashboardTheme";
import { useSidebar } from "@/stores/sidebar";
import { useCommandPalette } from "@/stores/commandPalette";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "./command-palette";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const theme = useDashboardTheme((s) => s.theme);
  const mobileOpen = useSidebar((s) => s.mobileOpen);
  const closeMobile = useSidebar((s) => s.closeMobile);
  const togglePalette = useCommandPalette((s) => s.toggle);
  const pathname = usePathname();

  // ⌘K / Ctrl+K toggles the command palette.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        closeMobile();
        togglePalette();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePalette, closeMobile]);

  // Close the mobile drawer on navigation.
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-theme={theme}
        className={cn(dashboardFontVariables, "dashboard-shell relative flex h-dvh overflow-hidden bg-canvas text-foreground")}
      >
        <Sidebar />

        {/* Mobile scrim */}
        <div
          onClick={closeMobile}
          aria-hidden
          className={cn(
            "fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 lg:hidden",
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />

        <div inert={mobileOpen} className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <main
            key={pathname}
            className="animate-page-in scrollbar-thin relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-6 sm:px-6 lg:px-8 lg:pb-8"
          >
            {children}
          </main>
        </div>

        <CommandPalette />
      </div>
    </MotionConfig>
  );
}
