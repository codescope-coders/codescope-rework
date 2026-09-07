/**
 * The carriers the flights section shows, and the contracted commission ledger
 * it leads with.
 *
 * ── Why the names are not messages ──────────────────────────────────────────
 * "Turkish Airlines" is a proper noun, not copy. It is the same string on both
 * locales — a carrier's legal name does not translate, and an Arabic
 * transliteration beside its own English wordmark reads as a different airline.
 * So these live here as DATA, and the locale files carry only the words around
 * them ("commission", "Iranian carriers", …).
 *
 * ── Why two groups ──────────────────────────────────────────────────────────
 * Founder-directed: the Iranian carriers are the differentiator (charter seats
 * few competitors can sell online) and the global list is the table stakes, so
 * they are shown as two labeled walls rather than one undifferentiated grid.
 *
 * ── `placeholder` ───────────────────────────────────────────────────────────
 * `true` means `public/airlines/<slug>.svg` is an INTERIM monogram tile drawn
 * by us, not the carrier's own mark — the asset set ships no usable square logo
 * for that carrier. Dropping the real file at the same path replaces it with
 * zero code change; the flag exists to document that swap point (and to let a
 * consumer render it more quietly if it ever wants to).
 *
 * Six carriers reach this file ONLY through the commission ledger and are
 * deliberately absent from the two walls below: the walls are shown as evidence
 * — a set of marks a reader recognises — and a monogram we drew ourselves is
 * not evidence of anything. The ledger is a written statement of rates, where a
 * tile is an identifier rather than a proof, so a placeholder earns its place
 * there and nowhere else.
 */

export type AirlineGroup = "global" | "iranian";

/**
 * A carrier on one of the two walls. No `placeholder` flag here on purpose —
 * every wall tile is a real mark by definition (see the note above), so the
 * flag lives only on the ledger row type that can actually carry one.
 */
export interface Airline {
  /** Matches `public/airlines/<slug>.svg` exactly. */
  slug: string;
  /** The carrier's own name. Data, not copy — identical in every locale. */
  name: string;
  group: AirlineGroup;
}

/** Global & regional carriers. A sample, not the catalogue. */
export const GLOBAL_AIRLINES: readonly Airline[] = [
  { slug: "turkish-airlines", name: "Turkish Airlines", group: "global" },
  { slug: "iraqi-airways", name: "Iraqi Airways", group: "global" },
  { slug: "emirates", name: "Emirates", group: "global" },
  { slug: "royal-jordanian", name: "Royal Jordanian", group: "global" },
  { slug: "middle-east-airlines", name: "Middle East Airlines", group: "global" },
  { slug: "pegasus", name: "Pegasus Airlines", group: "global" },
  { slug: "air-arabia", name: "Air Arabia", group: "global" },
  { slug: "oman-air", name: "Oman Air", group: "global" },
  { slug: "united", name: "United Airlines", group: "global" },
  { slug: "ajet", name: "AJet", group: "global" },
  { slug: "sunexpress", name: "SunExpress", group: "global" },
  { slug: "saudia", name: "Saudia", group: "global" },
  { slug: "salamair", name: "SalamAir", group: "global" },
  { slug: "indigo", name: "IndiGo", group: "global" },
  { slug: "akasa-air", name: "Akasa Air", group: "global" },
  { slug: "jordan-aviation", name: "Jordan Aviation", group: "global" },
  { slug: "basra-airlines", name: "Basra Airlines", group: "global" },
  { slug: "ur-airlines", name: "UR Airlines", group: "global" },
  { slug: "fly-cham", name: "Fly Cham", group: "global" },
  { slug: "hongkong-airlines", name: "Hong Kong Airlines", group: "global" },
  { slug: "sun-phuquoc", name: "Sun PhuQuoc Airways", group: "global" },
  { slug: "atlas", name: "Atlas Air", group: "global" },
];

/** Iranian scheduled + charter carriers. */
export const IRANIAN_AIRLINES: readonly Airline[] = [
  { slug: "mahan", name: "Mahan Air", group: "iranian" },
  { slug: "iran-airtour", name: "Iran Airtour", group: "iranian" },
  { slug: "aseman", name: "Iran Aseman Airlines", group: "iranian" },
  { slug: "meraj", name: "Meraj Airlines", group: "iranian" },
  { slug: "qeshm-air", name: "Qeshm Air", group: "iranian" },
  { slug: "sepehran", name: "Sepehran Airlines", group: "iranian" },
  { slug: "zagros", name: "Zagros Airlines", group: "iranian" },
  { slug: "ata", name: "ATA Airlines", group: "iranian" },
  { slug: "ava", name: "Ava Airlines", group: "iranian" },
  { slug: "caspian", name: "Caspian Airlines", group: "iranian" },
  { slug: "chabahar", name: "Chabahar Airlines", group: "iranian" },
  { slug: "fly-kish", name: "Fly Kish", group: "iranian" },
  { slug: "fly-persia", name: "FlyPersia", group: "iranian" },
  { slug: "kish-air", name: "Kish Air", group: "iranian" },
  { slug: "karun", name: "Karun Airlines", group: "iranian" },
  { slug: "mehr", name: "Mehr Airlines", group: "iranian" },
  { slug: "nasim", name: "Nasim Airlines", group: "iranian" },
  { slug: "pars-air", name: "Pars Air", group: "iranian" },
  { slug: "pouya-air", name: "Pouya Air", group: "iranian" },
  { slug: "saha", name: "Saha Airlines", group: "iranian" },
  { slug: "soroush", name: "Soroush", group: "iranian" },
  { slug: "taban", name: "Taban Air", group: "iranian" },
  { slug: "varesh", name: "Varesh Airlines", group: "iranian" },
  { slug: "yazd", name: "Yazd Airways", group: "iranian" },
  { slug: "rai", name: "Rai Airlines", group: "iranian" },
  { slug: "air-one", name: "Air One", group: "iranian" },
  { slug: "asa-jet", name: "Asa Jet", group: "iranian" },
  { slug: "asia-jet", name: "Asia Jet", group: "iranian" },
  { slug: "jsky", name: "JSky", group: "iranian" },
];

/**
 * What one carrier's deal actually is. A union rather than a number, because
 * the contracted terms are genuinely five different SHAPES — a percentage of
 * the fare, a flat fee in either of two currencies, "whatever the airline's own
 * system charges", and a band that varies by carrier. Squeezing them into one
 * `pct: number` would need a sentinel for the flat fees and a second string
 * field for the words, and every reader of the file would then have to know
 * which combination means what.
 *
 * ⚠️ Render logic MUST branch on `kind`. Never parse or format these into a
 * string here: two of the five shapes are words that differ per locale
 * (`official`, and the suffix on `percentRange`), and the IQD figure is written
 * differently in each language — so the strings belong in the locale files and
 * only the numbers belong here.
 */
export type CommissionRate =
  /** A share of the fare. Fractional is real: Iraqi Airways is 6.5. */
  | { kind: "percent"; value: number }
  /** A flat fee per ticket, US dollars. */
  | { kind: "flatUsd"; value: number }
  /**
   * A flat fee per ticket, Iraqi dinars.
   *
   * ⚠️ `value` is the machine-readable amount; the STRING a reader sees comes
   * from `flights.commissionIqd15k`, because Arabic writes this figure in words
   * ("15 ألف دينار") and English in digits ("IQD 15,000") — a formatter here
   * would have to pick one. So the two are coupled by hand: a second IQD rate
   * at a different amount needs its own message key and its own branch, not
   * just a new `value`.
   */
  | { kind: "flatIqd"; value: number }
  /** No commission line — the carrier's own system fare is what is sold. */
  | { kind: "official" }
  /** A band, because the rate differs by carrier inside a group row. */
  | { kind: "percentRange"; from: number; to: number };

/** A single named carrier's row. */
export interface CarrierCommissionRow {
  row: "carrier";
  /** Matches `public/airlines/<slug>.svg` (or `.png`) exactly. */
  slug: string;
  /** The carrier's own name. Data, not copy — identical in every locale. */
  name: string;
  /** Interim monogram tile, not the carrier's real mark. See above. */
  placeholder?: true;
  rate: CommissionRate;
}

/**
 * A row that stands for several carriers at once. It has no single name — its
 * label is COPY (`flights.commissionIranianGroup`), because "Iranian carriers"
 * is a category we wrote, not a company anyone registered — and no single tile,
 * so it shows a small cluster of member marks instead.
 */
export interface GroupCommissionRow {
  row: "group";
  /** Tiles for the overlapping cluster, in draw order. */
  slugs: readonly string[];
  rate: CommissionRate;
}

export type CommissionRow = CarrierCommissionRow | GroupCommissionRow;

/**
 * The founder's contracted list, in HIS order.
 *
 * The order is not sorted and must not be: it is a commercial statement he
 * wrote, and it leads with the carriers he sells most, not with the biggest
 * number. Sorting it by rate would quietly re-rank his own partners.
 *
 * Six of these carriers have no licensed square mark in the asset set and wear
 * an interim monogram (`placeholder`); see the note at the top of this file for
 * why those slugs stay out of the two walls.
 */
export const AIRLINE_COMMISSIONS: readonly CommissionRow[] = [
  { row: "carrier", slug: "turkish-airlines", name: "Turkish Airlines", rate: { kind: "percent", value: 13 } },
  { row: "carrier", slug: "middle-east-airlines", name: "Middle East Airlines", rate: { kind: "percent", value: 10 } },
  { row: "carrier", slug: "iraqi-airways", name: "Iraqi Airways", rate: { kind: "percent", value: 6.5 } },
  { row: "carrier", slug: "emirates", name: "Emirates", rate: { kind: "percent", value: 7 } },
  { row: "carrier", slug: "qatar-airways", name: "Qatar Airways", placeholder: true, rate: { kind: "percent", value: 6 } },
  { row: "carrier", slug: "egyptair", name: "EgyptAir", placeholder: true, rate: { kind: "percent", value: 10 } },
  { row: "carrier", slug: "royal-jordanian", name: "Royal Jordanian", rate: { kind: "percent", value: 13 } },
  { row: "carrier", slug: "ajet", name: "AJet", rate: { kind: "flatUsd", value: 10 } },
  { row: "carrier", slug: "ur-airlines", name: "UR Airlines", rate: { kind: "flatIqd", value: 15000 } },
  { row: "carrier", slug: "basra-airlines", name: "Basra Airlines", rate: { kind: "percent", value: 7 } },
  { row: "carrier", slug: "fly-erbil", name: "Fly Erbil", placeholder: true, rate: { kind: "flatUsd", value: 10 } },
  // Lowercase is the brand's own styling, not a typo — flydubai writes it that way.
  { row: "carrier", slug: "flydubai", name: "flydubai", placeholder: true, rate: { kind: "flatUsd", value: 10 } },
  { row: "carrier", slug: "fly-baghdad", name: "Fly Baghdad", placeholder: true, rate: { kind: "percent", value: 7 } },
  { row: "carrier", slug: "fly-cham", name: "Fly Cham", rate: { kind: "percent", value: 7 } },
  { row: "carrier", slug: "air-arabia", name: "Air Arabia", rate: { kind: "official" } },
  { row: "carrier", slug: "jazeera", name: "Jazeera Airways", placeholder: true, rate: { kind: "official" } },
  // Three of the Iranian wall's marks stand in for the whole group; the label
  // is a message, so the row reads in the visitor's own language.
  { row: "group", slugs: ["mahan", "iran-airtour", "qeshm-air"], rate: { kind: "percentRange", from: 5, to: 7 } },
];

/**
 * Two tiles are still 24×24 PNGs (soft when upscaled — SVG re-exports are
 * requested and replace these files verbatim; the founder's third batch
 * already upgraded the other seven). Keyed here rather than on each entry so
 * `airlineLogoSrc`'s signature stays a bare slug, which is what the slice
 * call sites use.
 */
const PNG_TILES = new Set(["emirates", "air-arabia"]);

/** Public path of a carrier's tile. One definition, so a rename is one edit. */
export function airlineLogoSrc(slug: string): string {
  return `/airlines/${slug}.${PNG_TILES.has(slug) ? "png" : "svg"}`;
}
