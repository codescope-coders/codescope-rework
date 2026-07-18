"use client";

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
        togglePalette();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePalette]);

  // Close the mobile drawer on navigation.
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  return (
    <div
      data-theme={theme}
      className="relative flex h-screen overflow-hidden bg-canvas text-foreground"
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

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main
          key={pathname}
          className="animate-page-in scrollbar-thin relative flex-1 overflow-y-auto px-4 pb-4 pt-4 sm:px-5 sm:pb-5 lg:px-6 lg:pb-6"
        >
          {children}
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
