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

/** The teal glow as bare `r, g, b` channels, for building `rgba()` in JS. */
export const CS_TEAL_GLOW_CHANNELS = CS_TEAL_GLOW_RGB.join(", ");

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

/**
 * The "animation purple" — `--color-ts-purple-hover`, brighter than
 * `--color-ts-purple`. The same reason `CS_TEAL_GLOW` exists: the base brand
 * purple is deep enough that as a glow on a near-black ground it reads as a
 * dark smudge rather than as light. Anything emissive — a rim light, a
 * starfield square, a bloom — uses this; anything that is a FILL uses the base.
 */
const TS_PURPLE_GLOW_RGB = [139, 51, 255] as const;

export const TS_PURPLE_GLOW = `rgb(${TS_PURPLE_GLOW_RGB.join(", ")})`;

/** The glow purple as bare `r, g, b` channels, for building `rgba()` in JS. */
export const TS_PURPLE_GLOW_CHANNELS = TS_PURPLE_GLOW_RGB.join(", ");

/** The glow purple at a given alpha. */
export function tsPurpleGlow(alpha: number): string {
  return `rgba(${TS_PURPLE_GLOW_RGB.join(", ")}, ${alpha})`;
}

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

/**
 * Re-alpha an `rgba(r, g, b, a)` literal from this module.
 *
 * The spotlight colours are deliberately faint (0.055–0.07) because they are a
 * WASH across a whole card. The same hue has to appear at real strength in the
 * card's accent rule and shimmer, and hard-coding a second copy per call site
 * is how a card ends up with a teal glow and a purple underline. Returns the
 * input untouched if it is not an `rgba()` triple, so a future caller passing a
 * hex or a `color-mix()` degrades to that colour rather than to nothing.
 */
export function withAlpha(color: string, alpha: number): string {
  const m = color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  return m ? `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})` : color;
}

/**
 * The public site's page ground, as an alpha-able literal.
 *
 * Same value as `--color-cs-ink` / the `body:has([data-site="public"])` rule in
 * `globals.css`. It lives here for the one case a class cannot express: a
 * multi-stop gradient ramp composed in JavaScript, where each stop needs the
 * ground at a different alpha (`HeroBackground`'s bottom fade). Re-typing
 * `#09090b` eleven times at a call site is exactly the drift this module exists
 * to prevent.
 */
const CS_INK_RGB = [9, 9, 11] as const;

/** The page ground at a given alpha. */
export function csInk(alpha: number): string {
  return `rgba(${CS_INK_RGB.join(", ")}, ${alpha})`;
}

/**
 * Brand channels normalised to 0–1 — the only form a GLSL `vec3` uniform takes.
 *
 * Derived from the same arrays as everything above rather than re-typed as
 * `vec3(0.031, 0.729, 0.659)` literals in a shader string, so a uniform can
 * never drift from the hex the CSS token renders.
 */
function unitChannels(
  rgb: readonly [number, number, number],
): [number, number, number] {
  return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
}

/** `--color-cs-teal-glow` (#08baa8) as 0–1 channels, for WebGL uniforms. */
export const CS_TEAL_GLOW_UNIT = unitChannels(CS_TEAL_GLOW_RGB);

/** `--color-ts-purple` (#6f00ff) as 0–1 channels, for WebGL uniforms. */
export const TS_PURPLE_UNIT = unitChannels(TS_PURPLE_RGB);

/**
 * `--color-ts-purple-hover` (#8b33ff) as 0–1 channels, for WebGL uniforms.
 *
 * The emissive purple, per the rule above: anything that reads as LIGHT uses
 * the glow, anything that is a FILL uses the base. The aurora band is light.
 */
export const TS_PURPLE_GLOW_UNIT = unitChannels(TS_PURPLE_GLOW_RGB);
