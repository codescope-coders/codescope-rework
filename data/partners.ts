/**
 * Real client brands — the agencies running on Tourscope today.
 *
 * Two exhibits are built from this list: the drifting lockup wall on the home
 * page (`TenantBrandsMarquee`) and the app-store icon grid on the Tourscope
 * page (`TenantAppGrid`). Both are founder-supplied, explicitly approved client
 * assets; nothing here is a placeholder or a stock mark.
 *
 * ── Two files per brand ────────────────────────────────────────────────────
 * `/partners/<slug>-mono.webp` is the rest state: grayscale, polarity flipped
 * where the mark is dark-leaning, levels normalized so every logo lands in one
 * brightness band. `/partners/<slug>.webp` is the hover state — the brand's own
 * colours, with a shadow lift baked in where the ink would otherwise vanish
 * against `#09090b` (`out = f·255 + (1−f)·in` per channel, f set per logo so its
 * darkest meaningful ink lands near L0.30, capped at 0.35 so bright regions
 * don't wash). 19 of 28 needed it; the other 9 ship raw. Roda 10 points at the
 * brand's OWN dark-ground file instead, because the brand's answer beats ours.
 *
 * Both passes are baked at build time rather than done in CSS: a per-image
 * `filter: invert()` / `brightness()` would need a per-slug rule anyway, and
 * browsers disagree about filter-on-transparent-image rounding.
 *
 * Nothing about the brand's artwork is lost — its colours are one hover away.
 *
 * ── Why the intrinsic size is stored beside the name ───────────────────────
 * `next/image` requires width and height, and the wall sizes every mark from
 * its ASPECT rather than a fixed box (see `TenantBrandsMarquee`). Both numbers
 * are properties of the emitted file, not metadata about the business — there
 * is deliberately no country, sector, tenure or link here, because none of that
 * is a claim the page makes and every one of them would date. Both files share
 * these dimensions; the mono pass is pixel-for-pixel.
 *
 * ── Why the files are served unoptimized ──────────────────────────────────
 * Each `.webp` is already trimmed of its transparent padding and emitted at
 * exactly 2x its render ceiling, so `/_next/image` has nothing left to win —
 * and re-encoding a transparent WebP through the optimizer is the documented
 * alpha-flattening trap the home page's device composite already works around.
 * The components pass `unoptimized`; keep it.
 *
 * ── Names ──────────────────────────────────────────────────────────────────
 * `name` is the brand as the lockup itself renders it. `nameAr` exists ONLY for
 * the six marks that carry Arabic script, and is transcribed from the artwork —
 * an Arabic name is never invented for a brand whose mark is Latin-only, since
 * alt text that renames a client is worse than alt text in the other language.
 */

export interface PartnerBrand {
  /** Kebab-case latin id. Also the asset filename: `/partners/<slug>.webp`. */
  slug: string;
  /** Brand name as the lockup renders it. Used for `alt` in both locales. */
  name: string;
  /** Arabic name, only where the mark itself carries Arabic script. */
  nameAr?: string;
  /** Intrinsic size of `/partners/<slug>.webp`. */
  w: number;
  h: number;
}

/**
 * Ordered so the two rows the wall splits this into each carry a mix of wide
 * wordmarks and compact marks, rather than clustering every 7:1 lockup in one
 * row — the rows read as one wall, so their rhythm has to match.
 *
 * `gcc` (GCC Travel) is deliberately absent from both exhibits.
 */
export const PARTNER_BRANDS: PartnerBrand[] = [
  { slug: "fly4all", name: "Fly4All", w: 560, h: 78 },
  { slug: "ibn-batuta", name: "Ibn Batuta", w: 560, h: 109 },
  { slug: "alaa-addin", name: "Alaa Addin", nameAr: "علاء الدين", w: 465, h: 112 },
  { slug: "sky260", name: "Sky 260", w: 560, h: 81 },
  { slug: "musafer", name: "Musafer", nameAr: "مسافر", w: 221, h: 112 },
  { slug: "open-fly", name: "Open Fly", w: 560, h: 101 },
  { slug: "loloua", name: "Loloua", w: 553, h: 112 },
  { slug: "fly-nusk", name: "Fly Nusk", nameAr: "فلاي نسك", w: 557, h: 112 },
  { slug: "roda10", name: "Roda 10", w: 551, h: 112 },
  { slug: "al-nidaa", name: "Al Nidaa Al Akheer", w: 560, h: 78 },
  { slug: "soltan", name: "Soltan Travel", w: 325, h: 112 },
  { slug: "papay", name: "Papay Fly", w: 504, h: 112 },
  { slug: "flyway", name: "Flyway", w: 525, h: 112 },
  { slug: "alburouj", name: "Alburouj", w: 560, h: 100 },
  { slug: "amedia", name: "Amedia Fly", w: 558, h: 112 },
  { slug: "ayen-alalam", name: "Ayen Al-Alam", nameAr: "عين العالم", w: 531, h: 112 },
  { slug: "safarna-plus", name: "Safarna Plus", w: 560, h: 79 },
  { slug: "dynar", name: "Dynar Travel", w: 551, h: 112 },
  { slug: "transit", name: "Tranzit", nameAr: "ترانزيت", w: 442, h: 112 },
  { slug: "alpha4all", name: "Alpha4All", w: 560, h: 106 },
  { slug: "rihlat", name: "Rihlat Al Omr", nameAr: "رحلة العُمر", w: 360, h: 112 },
  { slug: "online-bookings", name: "Online Bookings", w: 560, h: 71 },
  { slug: "fly-110", name: "Fly 110", w: 449, h: 112 },
  { slug: "nafidah", name: "Alnafidah", w: 560, h: 97 },
  { slug: "flyur", name: "Flyur", w: 376, h: 112 },
  { slug: "daw", name: "Dawalsahat", w: 560, h: 56 },
  { slug: "fly-turk", name: "Fly Turk", w: 365, h: 112 },
  { slug: "al-qaptan", name: "Al Qaptan", w: 348, h: 112 },
];

/**
 * Agencies whose iOS / Android app we built and shipped under their own name.
 *
 * A subset of the wall, and deliberately so: this list is only the brands with
 * a real composed 1024px store icon on file. The other clients' icons exist
 * only as Icon Composer `.icon` bundles — layer artwork plus a JSON recipe,
 * with no rendered square inside — so adding them would mean compositing an
 * icon ourselves and presenting it as the shipped one. The section claims these
 * are the agencies' own store icons, so it shows only icons that are.
 *
 * Every entry is 320x320; the grid renders them at 72.
 */
export const PARTNER_APPS: string[] = [
  "fly4all",
  "ibn-batuta",
  "alaa-addin",
  "ayen-alalam",
  "alburouj",
  "papay",
  "fly-110",
];

/** Locale-aware brand name for `alt`. Falls back to the latin mark. */
export function brandName(brand: PartnerBrand, locale: string): string {
  return locale === "ar" && brand.nameAr ? brand.nameAr : brand.name;
}
