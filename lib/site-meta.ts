import type { Metadata } from "next";

/**
 * Per-locale `<title>` / `<meta name="description">` for a public page.
 *
 * ── Why this exists ────────────────────────────────────────────────────────
 * The About / Engineering / Contact pages shipped a `const metadata` — a
 * static object, evaluated once, with no access to the request locale. So the
 * Arabic routes served the ENGLISH title and description: the two things a
 * search result and a shared link are made of, in the wrong language, on the
 * three pages a visitor is most likely to land on from search. The `(client)`
 * layout already fixed this for the site-wide defaults; these three overrode it
 * back to English.
 *
 * ── What it is allowed to say ──────────────────────────────────────────────
 * Nothing new. The Arabic side is ASSEMBLED from strings already approved and
 * already rendered on the page itself — its nav label and its hero subheading —
 * so this file introduces no untranslated, unreviewed Arabic prose. The English
 * side is passed through exactly as each page had it, so no English metadata
 * moves.
 */

/** The brand as it is written in Arabic everywhere else on the site
 *  (`Meta.title`, `Footer.copyright`). A name, not prose. */
const AR_BRAND = "كودسكوب";

/** Google truncates a description around 155–160 characters. Clamping on a word
 *  boundary keeps a trimmed line from ending mid-word; today every source
 *  string is comfortably inside the limit, so this only guards future edits. */
const MAX_DESCRIPTION = 160;

function clamp(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_DESCRIPTION) return trimmed;
  const cut = trimmed.slice(0, MAX_DESCRIPTION - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export function localizedPageMetadata({
  locale,
  enTitle,
  enDescription,
  arTitleLabel,
  arDescription,
}: {
  locale: string;
  /** Passed through verbatim, so the layout's "%s | CodeScope" template still
   *  applies exactly as it did before this helper existed. */
  enTitle: string;
  enDescription: string;
  /** The page's own Arabic nav label — the brand and separator are added here. */
  arTitleLabel: string;
  arDescription: string;
}): Metadata {
  if (locale !== "ar") {
    return { title: enTitle, description: enDescription };
  }

  const title = `${arTitleLabel} — ${AR_BRAND}`;
  const description = clamp(arDescription);

  return {
    // `absolute`, because the layout's template would append the Latin
    // "| CodeScope" to an otherwise fully-Arabic title.
    title: { absolute: title },
    description,
    openGraph: { title, description },
  };
}
