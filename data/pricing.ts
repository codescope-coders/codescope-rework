/**
 * Tourscope commercial terms — the single source of truth for every AMOUNT the
 * public pricing page prints.
 *
 * ── Why the prose lives here and not in `i18n/locales/*.json` ───────────────
 * A package's feature list, its ICP line and an add-on's name are attributes of
 * the OFFER, not page framing: they only ever appear beside the number they
 * describe, and they change on the same day the number does. Splitting them
 * into the messages files would mean a price edit and its copy edit landing in
 * two places, which is how a card ends up advertising five team seats at the
 * fifteen-seat price. Page framing (headings, CTA labels, table column labels)
 * DOES live in the messages files, under the `Pricing` namespace.
 *
 * Each translatable field therefore ships as an AR value plus an `*En` sibling.
 * The page picks by locale; the amounts are shared by both and are never
 * retyped anywhere else.
 *
 * ── What is deliberately NOT here ──────────────────────────────────────────
 * This file began life as the data behind a printed PROPOSAL — it carried an
 * issue date, a validity window, a signature-and-stamp block and a "decision"
 * table restating the same three prices a fourth time. All of it was removed by
 * founder decision when the page became a public pricing page: a marketing page
 * that asks to be signed is a PDF wearing a website. The package cards already
 * carry every number the decision table repeated.
 *
 * ⚠️ AMOUNT FORMAT: prices are stored WITHOUT a period suffix (`"$150"`, not
 * `"$150/month"`). The suffix is a localized label the page appends — baked in,
 * it made the Arabic string the only place a per-month price could be read, so
 * the English column silently printed Arabic.
 */

// ─── Packages ─────────────────────────────────────────────────────────────

export type BillingPeriod = {
  /** Arabic term label, e.g. "ربع سنوي". */
  term: string;
  /** English term label, e.g. "Quarterly". */
  termEn: string;
  /** Equivalent monthly cost under this term. No suffix — see the file note. */
  perMonth: string;
  /** What is actually billed each cycle. */
  total: string;
};

export type Package = {
  id: string;
  name: string;
  nameEn: string;
  /** Who the package is for — one sentence, no hedging. */
  icp: string;
  icpEn: string;
  /**
   * The seller. Exactly one package carries it, and it gets the loudest
   * treatment on the page (gradient ground, purple hairline, drop shadow,
   * filled badge, lifted out of the row).
   */
  featured?: boolean;
  /**
   * The value argument, and deliberately a SEPARATE flag from `featured` rather
   * than a second value of one "highlight" enum: the two cards are highlighted
   * for different reasons and must not look like two attempts at the same rung.
   * This one gets a teal hairline and an OUTLINE badge — one property changed
   * against the plain card, where `featured` changes four. Its badge and its
   * one value line come from the `Pricing` namespace, not from `badge` below,
   * because the value line interpolates a figure derived from `ADDONS`.
   */
  bestValue?: boolean;
  badge?: string;
  badgeEn?: string;
  annual: { price: string; perMonth: string };
  alts: BillingPeriod[];
  setup: string;
  features: string[];
  featuresEn: string[];
  footnote: string;
  footnoteEn: string;
};

export const PACKAGES: Package[] = [
  {
    id: "charter",
    name: "تشارتر",
    nameEn: "Charter",
    icp: "لمشغّلي الرحلات المُستأجَرة إلى إيران.",
    icpEn: "For charter operators flying Iraq–Iran routes.",
    annual: { price: "1,500", perMonth: "$125" },
    alts: [
      { term: "ربع سنوي", termEn: "Quarterly", perMonth: "$150", total: "$450" },
      { term: "سنتان", termEn: "Two years", perMonth: "$113", total: "$2,700" },
    ],
    setup: "$500",
    features: [
      "رحلات العراق - إيران والطيران الداخلي",
      "5 مقاعد للفريق",
      "لوحة تحكّم بعلامتك التجارية",
      "عملات متعدّدة",
      "دعم عبر البريد الإلكتروني",
    ],
    featuresEn: [
      "Iraq–Iran routes and domestic flights",
      "5 team seats",
      "A console under your own brand",
      "Multi-currency",
      "Email support",
    ],
    footnote: "يشمل الاستضافة · الخوادم · التحديثات · الدعم",
    footnoteEn: "Includes hosting · servers · updates · support",
  },
  {
    id: "standard",
    name: "القياسية",
    nameEn: "Standard",
    icp: "لوكالات السفر متكاملة الخدمات في الأسواق الإقليمية والعالمية.",
    icpEn: "For full-service travel agencies in regional and global markets.",
    featured: true,
    // One language per locale. This read "موصى بها · Most Popular" — a single
    // badge in two languages at once, so every visitor read half of it as noise.
    badge: "الأكثر طلباً",
    badgeEn: "Most popular",
    annual: { price: "4,500", perMonth: "$375" },
    alts: [
      { term: "ربع سنوي", termEn: "Quarterly", perMonth: "$450", total: "$1,350" },
      { term: "سنتان", termEn: "Two years", perMonth: "$338", total: "$8,100" },
    ],
    setup: "$2,000",
    features: [
      "طيران · فنادق · جولات · تأشيرات",
      "خطوط عالمية + رحلات إيران",
      "15 مقعداً للفريق",
      "علامة بيضاء كاملة",
      "دعم ذو أولوية",
    ],
    featuresEn: [
      "Flights · hotels · tours · visas",
      "Global routes plus Iran flights",
      "15 team seats",
      "Full white-label",
      "Priority support",
    ],
    footnote: "يشمل الاستضافة · الخوادم · التحديثات · الدعم",
    footnoteEn: "Includes hosting · servers · updates · support",
  },
  {
    id: "advanced",
    name: "المتقدّمة",
    nameEn: "Advanced",
    icp: "للمشغّلين متعدّدي الأسواق وأصحاب شبكات الوكالات.",
    icpEn: "For multi-market operators and agency networks.",
    bestValue: true,
    annual: { price: "9,000", perMonth: "$750" },
    alts: [
      { term: "ربع سنوي", termEn: "Quarterly", perMonth: "$900", total: "$2,700" },
      { term: "سنتان", termEn: "Two years", perMonth: "$675", total: "$16,200" },
    ],
    setup: "$3,250",
    features: [
      "كلّ خدمات الباقة القياسية",
      "تطبيقا iOS و Android (مُضمَّنان)",
      "التأمين السياحي مُدمج",
      "الشرائح الإلكترونية (eSIM)",
      "50 مقعداً للفريق + نطاق مخصّص",
      "دعم ذو أولوية قصوى",
    ],
    featuresEn: [
      "Everything in Standard",
      "iOS and Android apps, included",
      "Travel insurance built in",
      "eSIMs built in",
      "50 team seats + dedicated domain",
      "Top-priority support",
    ],
    footnote: "يشمل الاستضافة · الخوادم · التحديثات · الدعم",
    footnoteEn: "Includes hosting · servers · updates · support",
  },
];

/**
 * The two terms a buyer would otherwise discover at signing.
 *
 * They stay on the page deliberately: the first is generous and the second is a
 * limitation, and a pricing page that prints only the generous half is the kind
 * of page that produces an argument in week three.
 */
export const PRICING_NOTES = [
  {
    title: "أسبوعا تأهيل إضافيّان",
    titleEn: "Two onboarding weeks, on us",
    body: "يُسدَّد الاشتراك ورسوم الإعداد عند التوقيع، لكنّ احتساب فترة الاشتراك لا يبدأ إلا بعد أسبوعين مخصّصَين للتدريب وتجهيز البيانات.",
    bodyEn:
      "Your subscription and setup are paid at signing, but the clock doesn't start until two weeks of training and data preparation are done.",
  },
  {
    title: "الحدّ الأدنى ثلاثة أشهر",
    titleEn: "Three-month minimum",
    body: "لا تتوفّر فوترة شهرية مفردة. السنوية هي الافتراضية، والسنتان تُمثّل أقصى توفير على المدى البعيد.",
    bodyEn:
      "There's no single-month billing. Annual is the default; two years is the deepest saving.",
  },
];

// ─── Add-ons ──────────────────────────────────────────────────────────────

export type Addon = {
  /**
   * Stable handle, set only on the rows another module has to find by name.
   * The display names are copy and will be edited; a lookup keyed on one would
   * go silently wrong the day someone tightened the wording.
   */
  id?: string;
  name: string;
  nameEn: string;
  /** Disambiguator under the name — a category, not a sales line. */
  sub?: string;
  subEn?: string;
  setup: string;
  quarterly: string;
  annual: string;
  biannual: string;
};

export const ADDONS: Addon[] = [
  {
    name: "تطبيق iOS",
    nameEn: "iOS app",
    setup: "$1,500",
    quarterly: "$360",
    annual: "$1,200",
    biannual: "$2,160",
  },
  {
    name: "تطبيق Android",
    nameEn: "Android app",
    setup: "$1,500",
    quarterly: "$360",
    annual: "$1,200",
    biannual: "$2,160",
  },
  {
    id: "app-bundle",
    name: "حزمة iOS + Android",
    nameEn: "iOS + Android bundle",
    setup: "$2,500",
    quarterly: "$600",
    annual: "$2,000",
    biannual: "$3,600",
  },
  {
    name: "وحدة تشارتر",
    nameEn: "Charter module",
    sub: "للباقات غير المتخصّصة",
    subEn: "for non-charter packages",
    setup: "$1,000",
    quarterly: "$450",
    annual: "$1,500",
    biannual: "$2,700",
  },
  {
    id: "travel-insurance",
    name: "التأمين السياحي",
    nameEn: "Travel insurance",
    setup: "$500",
    quarterly: "$240",
    annual: "$800",
    biannual: "$1,440",
  },
  {
    id: "esim",
    name: "الشرائح الإلكترونية (eSIM)",
    nameEn: "eSIMs",
    setup: "$300",
    quarterly: "$180",
    annual: "$600",
    biannual: "$1,080",
  },
  {
    name: "QiCard",
    nameEn: "QiCard",
    sub: "بوابة دفع",
    subEn: "payment gateway",
    setup: "—",
    quarterly: "$100",
    annual: "$333",
    biannual: "$600",
  },
  {
    name: "ZainCash",
    nameEn: "ZainCash",
    sub: "بوابة دفع",
    subEn: "payment gateway",
    setup: "—",
    quarterly: "$100",
    annual: "$333",
    biannual: "$600",
  },
  {
    name: "FastPay",
    nameEn: "FastPay",
    sub: "بوابة دفع",
    subEn: "payment gateway",
    setup: "—",
    quarterly: "$100",
    annual: "$333",
    biannual: "$600",
  },
  {
    name: "واجهة برمجية صادرة (API)",
    nameEn: "Outbound API",
    setup: "$1,500",
    quarterly: "$600",
    annual: "$2,000",
    biannual: "$3,600",
  },
  {
    name: "+10 مقاعد مستخدمين",
    nameEn: "+10 user seats",
    setup: "—",
    quarterly: "$150",
    annual: "$500",
    biannual: "$900",
  },
];

/**
 * The three add-ons the Advanced package bundles and Standard does not: the
 * mobile apps (the two-app BUNDLE price, because Advanced ships both — pricing
 * them as separate iOS and Android rows would overstate the saving), travel
 * insurance, and eSIMs.
 */
const ADVANCED_BUNDLED_ADDON_IDS = ["app-bundle", "travel-insurance", "esim"];

/** `"$2,000"` → `2000`. Throws rather than coercing junk to NaN. */
function parseUsd(amount: string, forId: string): number {
  const n = Number(amount.replace(/[$,]/g, ""));
  if (!Number.isFinite(n)) {
    throw new Error(
      `data/pricing.ts: add-on "${forId}" has an unparseable annual price ${JSON.stringify(amount)}.`
    );
  }
  return n;
}

/**
 * What Advanced's bundled add-ons would cost a year if bought separately —
 * `"$3,400"` today.
 *
 * The pricing page states this as a CLAIM next to the Advanced card ("the apps,
 * travel insurance and eSIMs are $3,400/year as add-ons — here they're
 * included"), so it is derived from the table above rather than typed beside
 * the sentence. A hand-copied figure keeps making the claim after someone edits
 * a price, and nothing anywhere would report it.
 *
 * A missing id is a BUILD failure, deliberately. The data is static, so this
 * either always resolves or never does — it cannot start failing in production.
 * The alternative to failing loudly is shipping a quietly wrong price claim,
 * which is the exact thing deriving it was meant to prevent.
 */
export const ADVANCED_BUNDLED_ADDONS_ANNUAL: string = (() => {
  const total = ADVANCED_BUNDLED_ADDON_IDS.reduce((sum, id) => {
    const addon = ADDONS.find((a) => a.id === id);
    if (!addon) {
      throw new Error(
        `data/pricing.ts: no add-on with id "${id}". The Advanced card's ` +
          `"included add-ons" figure is derived from these ids — restore it, ` +
          `or update ADVANCED_BUNDLED_ADDON_IDS if the offer genuinely changed.`
      );
    }
    return sum + parseUsd(addon.annual, id);
  }, 0);
  return `$${total.toLocaleString("en-US")}`;
})();

/**
 * What the one-off setup fee actually buys.
 *
 * ⚠️ Item 3 used to read "…وأنظمة التوزيع (GDS)" — a claim of direct GDS
 * distribution. The public site may not make it (remake-brief §1: no "GDS", no
 * publicly named suppliers), and it was never the accurate description of the
 * work either: setup configures the operator's OWN supplier credentials across
 * their booking channels. Reworded in both locales together, because a line
 * corrected in one language and left standing in the other is still published.
 */
export const SETUP_INCLUDES = [
  {
    ar: "تصميم الهوية البصرية للعلامة (Branding) ودمجها في كامل المنصّة",
    en: "Your brand designed and applied across the whole platform",
  },
  {
    ar: "نشر النطاق المخصّص وربط الشهادات الأمنية",
    en: "Your domain deployed with security certificates",
  },
  {
    ar: "تهيئة بيانات الاعتماد لدى المورّدين عبر قنوات الحجز لديك",
    en: "Supplier credentials configured across your booking channels",
  },
  {
    ar: "التدريب الأوّلي للفريق وتجهيز قاعدة البيانات",
    en: "Initial team training and database preparation",
  },
];
