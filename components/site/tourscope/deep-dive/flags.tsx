import type { ReactNode } from "react";

/**
 * The deep-dive region's hand-drawn country flags.
 *
 * ── Why these exist at all ──────────────────────────────────────────────────
 * The marketplace renders `<CountryFlag />` off a sprite this site does not
 * ship. An emoji flag is the only zero-asset substitute and Windows draws it as
 * a pair of letters in a box, so the four the region needs are drawn instead —
 * each simple enough geometry to be exact rather than approximate.
 *
 * ── Why a module and not four functions inside one slice ────────────────────
 * They started life inside `VisaCatalogSlice`, which was the only view that
 * needed them. The eSIM slice needs TR and AE too — the same two countries, at
 * two different sizes — and a second hand-drawn Türkiye whose crescent sat a
 * half-unit off the first one would read as two different flags of the same
 * country on one page. One definition, drawn once.
 *
 * ── The rules any flag added here must follow ───────────────────────────────
 * 1. ⚠️ A flag is a PICTURE, not text: it must NOT mirror under `dir="rtl"`.
 *    Inline SVG geometry is unaffected by `dir`, so the hoist stays on the left
 *    of the viewBox in both locales with no handling at all — which is how a
 *    real flag is drawn everywhere, including in Arabic-language media. Do NOT
 *    add an `rtl:` transform to any of these.
 * 2. One 40×40 viewBox, whatever the rendered size, so every flag shares the
 *    same geometry space and the circular clip below is the same circle for all
 *    of them.
 * 3. `aria-hidden` on each. Every consumer mounts these inside an `aria-hidden`
 *    slice, and the country name is the very next node regardless.
 * 4. `className` REPLACES the default rather than appending to it. Tailwind
 *    resolves `ring-1 ring-2` by stylesheet order, not by class-list order, so
 *    an appending prop would make a caller's `ring-2` win or lose depending on
 *    which utility Tailwind happened to emit first — a bug that only shows up
 *    once and is invisible in review.
 */

/**
 * The default frame: the real `CountryFlag`'s 40px, drawn at 36px with a
 * hairline ring. Callers that need another size pass the whole class string.
 */
const FLAG_DEFAULT = "h-9 w-9 shrink-0 rounded-full ring-1 ring-white/10";

/**
 * The shared circular frame.
 *
 * The clip is what makes a rectangular flag a round one, exactly as the real
 * `CountryFlag` crops its sprite. It lives in the SVG rather than as an
 * `overflow-hidden` wrapper so the circle holds even if an ancestor's overflow
 * is ever changed.
 *
 * ⚠️ The clip `id` is a per-FLAG constant, so a page rendering the same flag
 * twice (the eSIM slice draws Türkiye both on a card and in its coverage
 * cluster) emits that id twice. That duplicate is inert here, and deliberately
 * so: every copy is emitted by THIS function, so all copies are byte-identical
 * by construction and can never drift apart — and `url(#…)` resolving to the
 * first one therefore clips exactly as the second one would have. `clipPath`
 * defaults to `userSpaceOnUse`, which resolves in the REFERENCING element's
 * space, so the shared circle is correct at every rendered size.
 *
 * The alternative — a `useId()` suffix — buys nothing visual and spends a React
 * 19 id (`«r0»`) inside a `url()` reference, which is exactly the place React's
 * own documentation warns against putting one.
 */
function FlagFrame({
  id,
  className,
  children,
}: {
  id: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <clipPath id={id}>
        <circle cx="20" cy="20" r="20" />
      </clipPath>
      <g clipPath={`url(#${id})`}>{children}</g>
    </svg>
  );
}

/** UAE: a red hoist band, then green / white / black in equal horizontal thirds. */
export function FlagAE({ className = FLAG_DEFAULT }: { className?: string }) {
  return (
    <FlagFrame id="ts-flag-ae" className={className}>
      <rect x="0" y="0" width="12" height="40" fill="#EF3340" />
      <rect x="12" y="0" width="28" height="13.3333" fill="#00843D" />
      <rect x="12" y="13.3333" width="28" height="13.3334" fill="#FFFFFF" />
      <rect x="12" y="26.6667" width="28" height="13.3333" fill="#000000" />
    </FlagFrame>
  );
}

/**
 * Türkiye: a red field, a crescent cut as one white disc with a smaller
 * field-red disc drawn over it, and a five-point star.
 *
 * The star path is computed, not eyeballed: five outer vertices at r 4.5 from
 * (27, 20) starting at 180° — so one point aims at the crescent, as on the real
 * flag — alternating with five inner vertices at r 1.719 (the pentagram ratio
 * sin18°/sin126°). A diamond here would read as a rendering fault rather than as
 * a flag.
 */
export function FlagTR({ className = FLAG_DEFAULT }: { className?: string }) {
  return (
    <FlagFrame id="ts-flag-tr" className={className}>
      <rect x="0" y="0" width="40" height="40" fill="#E30A17" />
      <circle cx="16" cy="20" r="10" fill="#FFFFFF" />
      <circle cx="18.5" cy="20" r="8" fill="#E30A17" />
      <path
        fill="#FFFFFF"
        d="M22.5 20 L25.6094 18.9897 L25.6094 15.7202 L27.5311 18.3653 L30.6406 17.355 L28.7189 20 L30.6406 22.645 L27.5311 21.6347 L25.6094 24.2798 L25.6094 21.0103 Z"
      />
    </FlagFrame>
  );
}

/** France: three equal vertical bands, hoist blue. */
export function FlagFR({ className = FLAG_DEFAULT }: { className?: string }) {
  return (
    <FlagFrame id="ts-flag-fr" className={className}>
      <rect x="0" y="0" width="13.3333" height="40" fill="#002395" />
      <rect x="13.3333" y="0" width="13.3334" height="40" fill="#FFFFFF" />
      <rect x="26.6667" y="0" width="13.3333" height="40" fill="#ED2939" />
    </FlagFrame>
  );
}

/**
 * Jordan: black / white / green in equal horizontal thirds, a red hoist
 * triangle, and a small white seven-pointed star centred in it.
 *
 * The triangle's apex reaches x=18 of the 40-wide box — a shallower wedge than
 * the real 3:2 flag's, because this box is square and a proportional apex would
 * put the point past the middle of a circle that crops the fly end away anyway.
 *
 * The star is computed on the same principle as Türkiye's: seven outer vertices
 * at r 3 from (7, 20) starting at −90°, so one point aims straight up as on the
 * real flag, alternating with seven inner vertices at r 1.5. At the 28px the
 * coverage cluster draws it, that resolves to a ~2px disc with seven spikes —
 * which is what a seven-pointed star correctly looks like at that size, and the
 * reason it is drawn as a real heptagram rather than faked with a circle.
 */
export function FlagJO({ className = FLAG_DEFAULT }: { className?: string }) {
  return (
    <FlagFrame id="ts-flag-jo" className={className}>
      <rect x="0" y="0" width="40" height="13.3333" fill="#000000" />
      <rect x="0" y="13.3333" width="40" height="13.3334" fill="#FFFFFF" />
      <rect x="0" y="26.6667" width="40" height="13.3333" fill="#007A3D" />
      <path fill="#CE1126" d="M0 0 L18 20 L0 40 Z" />
      <polygon
        fill="#FFFFFF"
        points="7,17 7.651,18.649 9.345,18.13 8.462,19.666 9.925,20.668 8.173,20.935 8.302,22.703 7,21.5 5.698,22.703 5.827,20.935 4.075,20.668 5.538,19.666 4.655,18.13 6.349,18.649"
      />
    </FlagFrame>
  );
}
