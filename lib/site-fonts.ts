import { Geist, Geist_Mono } from "next/font/google";

/**
 * Shared Codescope fonts, applied as scoped variables on marketing and dashboard
 * surfaces (including dashboard portals). Authentication keeps its existing font.
 * Arabic faces are declared locally in globals.css as IBM Plex Sans Arabic.
 */
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
