import { geistSans, geistMono } from "@/lib/site-fonts";

/** Shared with portaled dashboard surfaces, which cannot inherit shell fonts. */
export const dashboardFontVariables = `${geistSans.variable} ${geistMono.variable}`;
