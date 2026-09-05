import { Geist, Geist_Mono } from "next/font/google";

/**
 * The public marketing site's type stack.
 *
 * Exported as VARIABLES ONLY, and deliberately never applied via `.className`.
 * The two variables are attached to the `(client)` layout's root element rather
 * than to `<html>`, which is what keeps this change invisible to the internal
 * dashboard: `app/[locale]/globals.css` maps `--font-sans` / `--font-mono` onto
 * `--font-geist-sans` / `--font-geist-mono`, so defining those at the document
 * root would have re-pointed Tailwind's `font-sans` — and Preflight's default
 * document family — for the dashboard and the login page too. Scoped to the
 * public subtree, everything outside it resolves exactly as it did before.
 *
 * The Arabic face is NOT loaded here: it is `IBM Plex Sans Arabic`, declared as
 * `@font-face` in `globals.css` and selected by the `[dir="rtl"]` rule in the
 * same block, so it follows the document direction rather than a class.
 */
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
