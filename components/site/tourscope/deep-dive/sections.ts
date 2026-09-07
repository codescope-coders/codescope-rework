/**
 * The deep-dive region's table of contents — the ONE place a section is
 * declared.
 *
 * Both halves of the region read from this list: `DeepDiveRail` builds its nav
 * from it, and `DeepDiveRegion` renders the section bodies against it. That is
 * the point — a rail hand-written beside the sections it points at is a rail
 * that goes stale the first time somebody reorders the page, and the failure is
 * silent (an anchor that scrolls nowhere still looks like a link).
 *
 * Adding a section is: append an entry here, add its `nav.<navKey>` message to
 * both locale files, and render its body in `DeepDiveRegion`. Nothing else.
 *
 * ── Groups ──────────────────────────────────────────────────────────────────
 * `verticals` = the six things an agency SELLS; `console` = the parts of the
 * operator console it RUNS them from. A group with no sections renders no
 * header (see `groupedDeepDiveSections`), so the second group can land in a
 * later phase without this file needing a placeholder entry.
 */

export type DeepDiveGroup = "verticals" | "console";

export interface DeepDiveSection {
  /**
   * The section element's `id` AND the rail anchor's target. Prefixed `dd-` so
   * the region owns its own id namespace — the page already spends `#platform`
   * and `#explore` on section anchors.
   */
  id: string;
  /** Key under `TourScope.deepDive.nav`. The rail's label for this section. */
  navKey: string;
  group: DeepDiveGroup;
  /**
   * The ordinal drawn beside the section eyebrow. A literal, not a message:
   * it is the same two glyphs in both locales, and the product tour above
   * already renders its own numerals this way.
   */
  num: string;
}

export const DEEP_DIVE_SECTIONS: readonly DeepDiveSection[] = [
  { id: "dd-flights", navKey: "flights", group: "verticals", num: "01" },
  { id: "dd-hotels", navKey: "hotels", group: "verticals", num: "02" },
  { id: "dd-groups", navKey: "groups", group: "verticals", num: "03" },
  { id: "dd-visas", navKey: "visas", group: "verticals", num: "04" },
  { id: "dd-insurance", navKey: "insurance", group: "verticals", num: "05" },
  { id: "dd-esim", navKey: "esim", group: "verticals", num: "06" },
  { id: "dd-bookings", navKey: "bookings", group: "console", num: "07" },
  { id: "dd-inventory", navKey: "inventory", group: "console", num: "08" },
  { id: "dd-financials", navKey: "financials", group: "console", num: "09" },
  { id: "dd-support", navKey: "support", group: "console", num: "10" },
  { id: "dd-marketplace", navKey: "marketplace", group: "console", num: "11" },
];

/** Render order of the groups. Independent of the section order within them. */
const GROUP_ORDER: readonly DeepDiveGroup[] = ["verticals", "console"];

export interface DeepDiveGroupEntry {
  group: DeepDiveGroup;
  sections: DeepDiveSection[];
}

/**
 * The sections bucketed by group, in `GROUP_ORDER`, with empty groups dropped.
 * Dropping them is what lets the rail render a single unlabeled-by-accident
 * header today and grow a second one later with no code change.
 */
export function groupedDeepDiveSections(): DeepDiveGroupEntry[] {
  return GROUP_ORDER.map((group) => ({
    group,
    sections: DEEP_DIVE_SECTIONS.filter((s) => s.group === group),
  })).filter((entry) => entry.sections.length > 0);
}

/** Every section id, in document order. The observer's subject list. */
export const DEEP_DIVE_SECTION_IDS: readonly string[] = DEEP_DIVE_SECTIONS.map((s) => s.id);
