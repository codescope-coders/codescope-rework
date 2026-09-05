/**
 * Bidi isolation for left-to-right tokens that land inside Arabic prose.
 *
 * ── The problem ────────────────────────────────────────────────────────────
 * A price like `$3,400` is a left-to-right run. Dropped into an Arabic
 * sentence it is at the mercy of the Unicode Bidi Algorithm's neutral
 * resolution, and the character that suffers is the currency sign: `$` is
 * bidi class ET (European Terminator), which attaches to an adjacent number —
 * but only when the neighbourhood lets it. Change what sits on either side and
 * the same token renders `3,400$`, or splits, or drags a following `/` to the
 * wrong end. The failure is invisible in English and depends on the SENTENCE,
 * not the token, so it survives review and reappears when someone edits the
 * words around it.
 *
 * ── Why isolates and not LRM ───────────────────────────────────────────────
 * U+200E LRM is a *mark*: it nudges neutral resolution at one point, so it
 * takes one or two per token, placed by hand, and a later edit to the
 * surrounding words can undo it. U+2066 LRI … U+2069 PDI is an *isolate*: the
 * span between them is resolved as its own paragraph and then treated by the
 * outer text as a single neutral object. Nothing outside can reach in, and
 * nothing inside leaks out. That is the property worth having here — it
 * survives every neighbour, which is exactly what the hand-placed fix does
 * not.
 *
 * ── When NOT to reach for this ─────────────────────────────────────────────
 * If the token is its own ELEMENT, `dir="ltr"` on that element is better: it
 * is visible in the DOM, inspectable, and does not put invisible characters in
 * the text layer. The pricing page does exactly that for every amount it
 * renders directly. This helper is for the case where an amount is
 * interpolated as an ICU *argument* — next-intl renders arguments as text, so
 * there is no element to put `dir` on — and for message-file values where the
 * amount is embedded mid-sentence.
 */

/** U+2066 LEFT-TO-RIGHT ISOLATE — opens a self-contained LTR run. */
export const LRI = "⁦";

/** U+2069 POP DIRECTIONAL ISOLATE — closes the innermost open isolate. */
export const PDI = "⁩";

/**
 * Wrap a left-to-right token so surrounding right-to-left text cannot reorder
 * its insides, and it cannot reorder theirs.
 *
 * Idempotent: a value that is already isolated is returned unchanged, so it is
 * safe on data of unknown provenance.
 */
export function isolateLtr(token: string): string {
  if (token.startsWith(LRI) && token.endsWith(PDI)) return token;
  return `${LRI}${token}${PDI}`;
}

/**
 * Alias that reads at the call site — `usd(ADVANCED_BUNDLED_ADDONS_ANNUAL)`
 * says what the string is, not what is being done to it.
 */
export const usd = isolateLtr;
