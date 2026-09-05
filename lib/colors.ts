/**
 * Brand colors that JavaScript needs as literal strings.
 *
 * Anything expressible as a class name should use the Tailwind token instead
 * (`text-cs-teal-glow`, `bg-cs-teal-glow/18`, …) — the tokens live in
 * `app/globals.css` under `@theme`, which is the single source of truth for
 * the hex value. This module exists only for the cases a class cannot reach:
 * SVG paint attributes, and colors Framer Motion has to interpolate (it parses
 * `rgb()` / `rgba()`, so a `var(--…)` reference would freeze mid-animation).
 *
 * Channels rather than a hex literal, deliberately: it keeps the raw value in
 * exactly one file — `globals.css` — and it is what lets `tealGlow()` mint
 * alpha variants without a second copy of the color drifting from the first.
 */

const CS_TEAL_GLOW_RGB = [8, 186, 168] as const;
const CS_TEAL_RGB = [0, 167, 157] as const;
const TS_PURPLE_RGB = [111, 0, 255] as const;

/** The "animation teal" — brighter than `--color-cs-teal`, used for glows. */
export const CS_TEAL_GLOW = `rgb(${CS_TEAL_GLOW_RGB.join(", ")})`;

/** The same color as a hex string, for UI that displays the token itself. */
export const CS_TEAL_GLOW_HEX = `#${CS_TEAL_GLOW_RGB.map((c) =>
  c.toString(16).padStart(2, "0"),
).join("")}`;

/** The same teal at a given alpha, for shadows, gradients and masks. */
export function tealGlow(alpha: number): string {
  return `rgba(${CS_TEAL_GLOW_RGB.join(", ")}, ${alpha})`;
}

/** The brand teal (`--color-cs-teal`) as a literal, for SVG paint attributes. */
export const CS_TEAL = `rgb(${CS_TEAL_RGB.join(", ")})`;

/** The brand purple (`--color-ts-purple`) as a literal, same reason. */
export const TS_PURPLE = `rgb(${TS_PURPLE_RGB.join(", ")})`;

/** The brand purple at a given alpha. */
export function tsPurple(alpha: number): string {
  return `rgba(${TS_PURPLE_RGB.join(", ")}, ${alpha})`;
}

/**
 * `SpotlightCard` spotlight colors.
 *
 * The card takes a raw color because the gradient is composed in a CSS custom
 * property, which a Tailwind class cannot reach. Naming the two the site
 * actually uses keeps the alpha from being re-typed — and re-guessed — per
 * call site.
 */
export const SPOTLIGHT_TEAL = `rgba(${CS_TEAL_RGB.join(", ")}, 0.07)`;
export const SPOTLIGHT_PURPLE = `rgba(${TS_PURPLE_RGB.join(", ")}, 0.07)`;

/**
 * The uncoloured spotlight — a plain lift in the glass, for a card that is not
 * making an argument. The pricing page's Charter card uses it so that all three
 * cards react to the cursor while only two of them say anything by doing so.
 *
 * Slightly weaker alpha than its tinted siblings: white reads brighter than a
 * saturated colour at the same opacity over this ground.
 */
export const SPOTLIGHT_NEUTRAL = "rgba(255, 255, 255, 0.055)";
