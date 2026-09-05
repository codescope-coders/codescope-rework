/**
 * The one nav item that is a PRODUCT.
 *
 * Every other link in the header is a section of the agency site; TourScope is
 * the thing the company sells. It reads as a hairline pill in the product's own
 * purple so a first-time visitor can see that at a glance — and it is shared
 * between the desktop navbar and the mobile menu from here so the two can never
 * drift into meaning different things per viewport.
 *
 * ── Deliberately JUNIOR to "Request a demo" ────────────────────────────────
 * The header already has a primary CTA: a solid teal button. This is a hairline
 * outline on a near-transparent ground, in a different hue, with no fill and no
 * bold weight. Two filled buttons in one header is two competing calls to
 * action and the visitor obeys neither.
 *
 * ── Contrast ───────────────────────────────────────────────────────────────
 * The label is WHITE at rest and while active. It warms to `ts-purple-text`
 * (5.4:1 on the page ground — the token exists precisely because
 * `ts-purple-hover` clears AA only for ≥24px type) on hover, but ONLY when the
 * item is not the current page: the active state raises the ground to 15%
 * purple, which drops that same tint to ~4.5:1 — right on the AA boundary. So
 * hover-while-active keeps the white label and expresses itself through the
 * border and glow alone.
 */

/** The pathname this treatment belongs to, matched against `usePathname()`. */
export const PRODUCT_NAV_HREF = "/tourscope";

/** The site's house curve, as a CSS easing. Mirrors `EASE` in `lib/motion.ts`
 *  — the transition here is CSS, not Motion, so it cannot import the tuple. */
const HOUSE_EASE = "ease-[cubic-bezier(0.21,0.47,0.32,0.98)]";

const BASE = [
  "inline-flex items-center justify-center rounded-full border",
  // Only the four properties that actually change. `transition-all` would also
  // name layout properties and make the pill animate on every re-render.
  "transition-[color,background-color,border-color,box-shadow] duration-300",
  HOUSE_EASE,
  "border-[color-mix(in_srgb,var(--color-ts-purple)_30%,transparent)]",
  "hover:border-[color-mix(in_srgb,var(--color-ts-purple)_60%,transparent)]",
  "hover:shadow-[0_0_12px_color-mix(in_srgb,var(--color-ts-purple)_25%,transparent)]",
  "text-white",
].join(" ");

/** Rest ground vs current-page ground — the only thing `isActive` changes. */
const GROUND = {
  rest: "bg-[color-mix(in_srgb,var(--color-ts-purple)_8%,transparent)]",
  active: "bg-[color-mix(in_srgb,var(--color-ts-purple)_15%,transparent)]",
};

/** Padding per surface. Both are vertically smaller than their row's own
 *  spacing, so the pill sits INSIDE the existing rhythm rather than setting a
 *  new one — the header stays 4rem tall and the mobile rows keep their pitch. */
const SIZE = {
  desktop: "px-3 py-1 text-sm",
  mobile: "px-4 py-1.5 text-xl font-medium",
};

export function productPillClass(
  isActive: boolean,
  surface: keyof typeof SIZE,
): string {
  return [
    BASE,
    SIZE[surface],
    isActive ? GROUND.active : GROUND.rest,
    // See the contrast note above: no warm-on-hover while active.
    isActive ? "" : "hover:text-ts-purple-text",
  ]
    .filter(Boolean)
    .join(" ");
}
