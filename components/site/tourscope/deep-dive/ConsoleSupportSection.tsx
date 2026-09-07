import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/site/FadeIn";
import { ProductFrame } from "@/components/site/tourscope/ProductFrame";
import { SupportInboxSlice } from "@/components/site/tourscope/deep-dive/SupportInboxSlice";

/**
 * The deep dive's tenth section, and the fourth of the console group: support.
 *
 * Three movements, in the order a reader needs them — the claim, the product
 * making it, and the facts the product cannot draw. Deliberately the SAME
 * anatomy as the nine sections above it: by this point the repetition is the
 * argument. A reader who has scrolled from flights through to financials has
 * learned the shape (claim → framed exhibit → ledger), and a section that broke
 * it here would read as a different KIND of thing rather than as the reference
 * continuing.
 *
 * ── Why this section follows financials ─────────────────────────────────────
 * The console group has run forward through the life of a sale: bookings is
 * what came in, inventory is what they were buying, financials is what was
 * left. Support is what happens AFTERWARDS, and putting it fourth is what lets
 * its exhibit be a conversation rather than an explanation. The ticket on the
 * frame is about `FL-8C21F4` — the same booking the bookings feed opened this
 * group with — so "the desk knows the booking" is something the reader
 * recognises rather than something they are told.
 *
 * It also puts the section's most surprising claim last, where it lands hardest:
 * the payable card in the thread. A reader who has just been shown a P&L
 * understands immediately what it means that a change fee can be collected
 * inside a support conversation — it is a line on the page they were looking at
 * one section ago.
 *
 * ── Why the exhibit is the INBOX and not one ticket ─────────────────────────
 * The section's claim has two halves — that a ticket is born beside its booking,
 * and that an agent answers it with the money and the clock in reach — and a
 * single-ticket view can only carry the second. The inbox carries both: the
 * list pane is three tickets each stamped with the reference of the booking
 * that produced it, which IS the first half, drawn rather than asserted. And it
 * is the shape of the real screen — the product is a messenger, and a
 * miniature that showed one thread would be a drawing of a detail page.
 *
 * The one pane the real screen has that this does not is the CONTEXT pane, and
 * it is the only one the product itself drops (see the slice's own note): it
 * appears at `xl` and becomes a drawer below that, so at this frame's width the
 * product shows exactly the two panes drawn here.
 *
 * ── Why a ledger and not cards ──────────────────────────────────────────────
 * Same reason the nine sections before it give. The section already spends its
 * visual budget on a dense framed exhibit, and a 2×2 of bordered cards under it
 * would compete with that frame for the same attention while saying less. And
 * what these four facts are FOR is the part of the desk the frame cannot show:
 * a still picture can draw a thread, but not that a cancellation posts itself
 * back into it, not that an agent is graded from the moment they CLAIM a ticket
 * rather than from when it sat unclaimed, not that a card in the thread settles
 * to a wallet, and not that a supplier can be handed the case without ever
 * being handed the customer. Those are claims about behaviour over time.
 *
 * ── Why the row ordinals are muted and not purple ───────────────────────────
 * The SECTION's own ordinal is already a purple two-digit index a few hundred
 * pixels above, and a second purple `10` inside the same section reads as the
 * same kind of thing — a section marker — rather than as a list ordinal. The
 * accent stays with the section; the rows take the muted register.
 */

export async function ConsoleSupportSection({ num }: { num: string }) {
  const t = await getTranslations("TourScope.deepDive.support");

  const facts = [
    { num: "01", title: t("f1Title"), body: t("f1Body") },
    { num: "02", title: t("f2Title"), body: t("f2Body") },
    { num: "03", title: t("f3Title"), body: t("f3Body") },
    { num: "04", title: t("f4Title"), body: t("f4Body") },
  ];

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* ── 1. The claim ───────────────────────────────────────────────── */}
      <FadeIn>
        <span
          aria-hidden
          className="mb-4 block text-[11px] font-semibold tabular-nums tracking-widest text-ts-purple-text"
        >
          {num}
        </span>
        <h3 className="mb-4 text-2xl font-bold leading-snug tracking-tight text-white text-balance sm:text-3xl">
          {t("headline")}
        </h3>
        <p className="max-w-[52ch] text-[17px] leading-relaxed text-zinc-300">{t("body")}</p>
      </FadeIn>

      {/* ── 2. The product doing it ────────────────────────────────────── */}
      <FadeIn delay={0.05}>
        <ProductFrame caption={t("sliceCaption")}>
          <SupportInboxSlice />
        </ProductFrame>
      </FadeIn>

      {/* ── 3. What support ships ──────────────────────────────────────── */}
      <FadeIn delay={0.05}>
        <h4 className="mb-2 text-sm font-semibold text-white">{t("factsTitle")}</h4>
        {/* The rule sits on each row's block START, so the list needs no
            dividers of its own and the closing `border-b` finishes it — the
            same ledger mechanism the page's own lists use. */}
        <ul className="border-b border-white/[0.07]">
          {facts.map((fact) => (
            <li key={fact.num} className="border-t border-white/[0.07] py-5 sm:py-6">
              <div className="flex gap-4 sm:gap-5">
                <span
                  aria-hidden
                  className="shrink-0 pt-[3px] text-[11px] font-semibold tabular-nums tracking-widest text-zinc-600"
                >
                  {fact.num}
                </span>
                <div className="min-w-0">
                  <h5 className="mb-1.5 text-[15px] font-semibold leading-snug text-white">
                    {fact.title}
                  </h5>
                  <p className="max-w-[60ch] text-sm leading-relaxed text-zinc-400">{fact.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </FadeIn>
    </div>
  );
}
