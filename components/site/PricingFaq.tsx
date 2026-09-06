import { getTranslations } from "next-intl/server";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { FaqDisclosure } from "@/components/site/FaqDisclosure";
import type { ReactNode } from "react";

/**
 * The pricing page's question stack.
 *
 * ── Where the copy comes from ──────────────────────────────────────────────
 * The `faq` namespace in `i18n/locales/{en,ar}.json` predates this page and was
 * ORPHANED — real sales answers, written for both locales, referenced by
 * nothing. This component is the reader for a curated slice of it: every
 * `commercial` entry (they are all pricing questions, which is where a buyer
 * actually is on this page) plus six from the other categories chosen for the
 * objections that decide a deal — hosting, who runs it, data ownership, what
 * happens to that data when you leave, cancellation, and billing disputes.
 *
 * The copy is NOT rewritten here. The one exception is the GDS wording, which
 * violated the site's truth constraints and was corrected in the message files
 * themselves — in both locales, in the same change.
 *
 * ── `<details>`, not an accordion widget ───────────────────────────────────
 * Seventeen answers is a wall if they are all open and a JS dependency if they
 * are a controlled component. `<details>` is neither: it opens with no script,
 * it is keyboard- and screen-reader-native, it survives a print, and Ctrl-F
 * finds text inside a closed one in every current browser. The only work here
 * is hiding the platform marker and drawing our own.
 *
 * ── Why `t.rich` and not `t` ───────────────────────────────────────────────
 * Several of these answers carry `<strong>` around the number that matters
 * ("$0.10 per segment", "a year and 14 days"). next-intl parses those as ICU
 * tags, so plain `t()` on one of them THROWS rather than printing the markup —
 * and `dangerouslySetInnerHTML` on translator-authored strings is a habit worth
 * not having. `t.rich` renders the tag as a real element and escapes the rest.
 */

const RICH = {
  strong: (chunks: ReactNode) => (
    <strong className="font-semibold text-zinc-100">{chunks}</strong>
  ),
};

/** One category heading plus the entry ids rendered under it, in order. */
const GROUPS = [
  {
    category: "commercial",
    ids: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11"],
  },
  { category: "technical", ids: ["t2"] },
  { category: "operational", ids: ["o1"] },
  { category: "data", ids: ["d1", "d2"] },
  { category: "afterSales", ids: ["a1", "a2"] },
] as const;

/**
 * The entries are NOT uniform `{q, a}` pairs — that is the whole reason this
 * lives in a component rather than a `.map()` over a flat list. Seven distinct
 * shapes exist in the namespace, and flattening them would mean either
 * rewriting the copy (forbidden) or printing a raw key.
 *
 * `pairs` renders a label→value ladder (a refund policy, a data-retention
 * timeline); `list` renders an intro plus bullets; anything unlisted is the
 * plain `{q, a}` shape.
 */
type Shape =
  | { kind: "prose" }
  | { kind: "list"; intro?: string; items: string[] }
  | { kind: "pairs"; pairs: [label: string, value: string][]; note?: string };

const SHAPES: Record<string, Shape> = {
  c1: {
    kind: "pairs",
    pairs: [
      ["setup", "setupDetails"],
      ["subscription", "subscriptionDetails"],
    ],
    note: "note",
  },
  c2: { kind: "list", items: ["charter", "standard", "advanced"] },
  c4: { kind: "list", intro: "intro", items: ["quarterly", "yearly", "twoYears"] },
  c6: {
    kind: "list",
    intro: "intro",
    items: ["item1", "item2", "item3", "item4", "item5"],
  },
  c8: {
    kind: "pairs",
    pairs: [
      ["upgradeLabel", "upgrade"],
      ["downgradeLabel", "downgrade"],
    ],
  },
  c11: {
    kind: "pairs",
    pairs: [
      ["beforeLabel", "before"],
      ["duringLabel", "during"],
      ["afterLabel", "after"],
    ],
  },
  d2: {
    kind: "pairs",
    pairs: [
      ["graceLabel", "grace"],
      ["freezeLabel", "freeze"],
      ["deleteLabel", "delete"],
    ],
  },
};

export async function PricingFaq() {
  const t = await getTranslations("faq");

  function body(category: string, id: string) {
    const base = `${category}.${id}`;
    const shape = SHAPES[id] ?? { kind: "prose" };

    if (shape.kind === "prose") {
      return <p>{t.rich(`${base}.a`, RICH)}</p>;
    }

    if (shape.kind === "list") {
      return (
        <>
          {shape.intro && <p>{t.rich(`${base}.${shape.intro}`, RICH)}</p>}
          <ul className="flex flex-col gap-2">
            {shape.items.map((item) => (
              <li key={item} className="flex gap-3">
                {/* Decorative: the list already announces itself as a list, and
                    a bullet character would be read out on every row. */}
                <span
                  aria-hidden
                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cs-teal/70"
                />
                <span>{t.rich(`${base}.${item}`, RICH)}</span>
              </li>
            ))}
          </ul>
        </>
      );
    }

    return (
      <>
        <dl className="flex flex-col gap-3">
          {shape.pairs.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-cs-teal">
                {t(`${base}.${label}`)}
              </dt>
              <dd>{t.rich(`${base}.${value}`, RICH)}</dd>
            </div>
          ))}
        </dl>
        {shape.note && (
          <p className="text-zinc-500">{t.rich(`${base}.${shape.note}`, RICH)}</p>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {GROUPS.map((group) => (
        <div key={group.category}>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            {t(`categories.${group.category}`)}
          </h3>
          <div className="divide-y divide-white/5">
            {group.ids.map((id) => (
              /* FaqDisclosure owns the <details>/<summary> shell and the
                 open/close height animation (founder: "smooth on open"); this
                 file stays the copy reader. The marker rotates 45° instead of
                 swapping Plus↔Minus so the icon TURNS with the motion rather
                 than blinking at the start of it. */
              <FaqDisclosure
                key={id}
                summary={
                  <>
                    <h4 className="text-[0.95rem] font-medium leading-relaxed text-zinc-300 transition-colors duration-200 group-open:text-white group-hover:text-white">
                      {t(`${group.category}.${id}.q`)}
                    </h4>
                    <span
                      aria-hidden
                      className="mt-0.5 shrink-0 text-zinc-600 transition-[color,rotate] duration-300 ease-[cubic-bezier(0.21,0.47,0.32,0.98)] group-open:rotate-45 group-open:text-cs-teal group-hover:text-zinc-400"
                    >
                      <Plus size={16} weight="bold" />
                    </span>
                  </>
                }
              >
                {body(group.category, id)}
              </FaqDisclosure>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
