export const HERO_STATS = [
  { count: 3, label: "باقات أساسية" },
  { count: 9, label: "قدرات للمنصّة" },
  { count: 8, label: "وحدات إضافية" },
  { count: 14, label: "يوم تأهيل إضافي" },
] as const;

export const HERO_META = [
  { label: "Issue Date", value: "7 مايو 2026" },
  { label: "Validity", value: "30 يوماً" },
] as const;

export const NAV_LINKS = [
  { href: "#why", label: "لماذا Tourscope" },
  { href: "#pricing", label: "الأسعار" },
  { href: "#addons", label: "الإضافات" },
  { href: "#decision", label: "القرار" },
] as const;

// ─── Why Tourscope cards ───────────────────────────────────────────────────

export type WhyCard = {
  num: string;
  title: string;
  body?: string;
  bullets?: string[];
  variant?: "insight" | "default";
  span?: "2col" | "wide";
  visual?: "brand" | "flow" | "metrics";
};

export const WHY_CARDS: WhyCard[] = [
  {
    num: "01",
    title: "ملكية كاملة للعلامة التجارية",
    body: "تُسلَّم المنصّة تحت علامتك: نطاقك، هويّتك، وواجهتك. يرى عملاؤك منصّةً رقميةً متكاملة تحمل اسمك — لا أداةً من طرف ثالث.",
    variant: "insight",
    span: "2col",
    visual: "brand",
  },
  {
    num: "02",
    title: "نظام حجوزات مركزي",
    body: "دورة حياة كاملة من الصفر إلى التأكيد: بحث ← تسعير ← دفع ← تأكيد ← متابعة. نهاية للتشظّي والمعالجة اليدوية.",
  },
  {
    num: "03",
    title: "تحكّم متقدّم بالتسعير",
    body: "تُحدِّد منطق التسعير وفق الموسم، الطلب، نوع الخدمة، أو شريحة العميل. مخزون لحظي وهوامش ربح ديناميكية.",
  },
  {
    num: "04",
    title: "خدمات سفر متكاملة",
    body: "الطيران، الفنادق، التأشيرات، الجولات، التأمين، والشرائح الإلكترونية — في تجربة واحدة بسير عمل متّسق.",
  },
  {
    num: "05",
    title: "بنية تحكّم متعدّدة المستويات",
    bullets: [
      "لوحة تحكّم بالعلامة البيضاء",
      "إدارة الوكالات الفرعية",
      "صلاحيات وأدوار للموظّفين",
    ],
  },
  {
    num: "06",
    title: "تجربة مُهيّأة للتحويل",
    bullets: [
      "بحث لحظي بنتائج حيّة",
      "تدفّقات حجز منظّمة",
      "محسّن للجوّال وسطح المكتب",
    ],
  },
  {
    num: "07",
    title: "سير عمل آلي بالكامل",
    body: "من تأكيد الحجز إلى متابعة التأشيرات والتنسيق مع المورّدين — الإشعارات التلقائية تُقلّل العبء التشغيلي.",
    span: "2col",
    visual: "flow",
  },
  {
    num: "08",
    title: "بنية أعمال قابلة للتوسّع",
    body: "أضف خدمات، وكالات فرعية، أو مورّدين جدد — وضاعِف حجم الحجوزات دون إعادة بناء النظام.",
  },
  {
    num: "09",
    title: "طبقة التحكّم المالي",
    bullets: [
      "محفظة مدمجة للعملاء",
      "مرونة في بوابات الدفع",
      "تتبّع الأرباح والعمولات",
      "إدارة أرصدة المورّدين",
    ],
    span: "wide",
    visual: "metrics",
  },
];

// ─── Packages ─────────────────────────────────────────────────────────────

export type BillingPeriod = {
  term: string;
  perMonth: string;
  total: string;
};

export type Package = {
  id: string;
  name: string;
  nameEn: string;
  icp: string;
  featured?: boolean;
  badge?: string;
  annual: { price: string; perMonth: string };
  alts: BillingPeriod[];
  setup: string;
  features: string[];
  footnote: string;
};

export const PACKAGES: Package[] = [
  {
    id: "charter",
    name: "تشارتر",
    nameEn: "Charter",
    icp: "لمشغّلي الرحلات المُستأجَرة إلى إيران.",
    annual: { price: "1,500", perMonth: "$125" },
    alts: [
      { term: "ربع سنوي", perMonth: "$150/شهر", total: "$450" },
      { term: "سنتان", perMonth: "$113/شهر", total: "$2,700" },
    ],
    setup: "$500",
    features: [
      "رحلات العراق - إيران والطيران الداخلي",
      "5 مقاعد للفريق",
      "لوحة تحكّم بعلامتك التجارية",
      "عملات متعدّدة",
      "دعم عبر البريد الإلكتروني",
    ],
    footnote: "يشمل الاستضافة · الخوادم · التحديثات · الدعم",
  },
  {
    id: "standard",
    name: "القياسية",
    nameEn: "Standard",
    icp: "لوكالات السفر متكاملة الخدمات في الأسواق الإقليمية والعالمية.",
    featured: true,
    badge: "موصى بها · Most Popular",
    annual: { price: "4,500", perMonth: "$375" },
    alts: [
      { term: "ربع سنوي", perMonth: "$450/شهر", total: "$1,350" },
      { term: "سنتان", perMonth: "$338/شهر", total: "$8,100" },
    ],
    setup: "$2,000",
    features: [
      "طيران · فنادق · جولات · تأشيرات",
      "خطوط عالمية + رحلات إيران",
      "15 مقعداً للفريق",
      "علامة بيضاء كاملة",
      "دعم ذو أولوية",
    ],
    footnote: "يشمل الاستضافة · الخوادم · التحديثات · الدعم",
  },
  {
    id: "advanced",
    name: "المتقدّمة",
    nameEn: "Advanced",
    icp: "للمشغّلين متعدّدي الأسواق وأصحاب شبكات الوكالات.",
    annual: { price: "9,000", perMonth: "$750" },
    alts: [
      { term: "ربع سنوي", perMonth: "$900/شهر", total: "$2,700" },
      { term: "سنتان", perMonth: "$675/شهر", total: "$16,200" },
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
    footnote: "يشمل الاستضافة · الخوادم · التحديثات · الدعم",
  },
];

export const PRICING_NOTES = [
  {
    title: "أسبوعا تأهيل إضافيّان",
    body: "يُسدَّد الاشتراك ورسوم الإعداد عند التوقيع، لكنّ احتساب فترة الاشتراك لا يبدأ إلا بعد أسبوعين مخصّصَين للتدريب وتجهيز البيانات.",
  },
  {
    title: "الحدّ الأدنى ثلاثة أشهر",
    body: "لا تتوفّر فوترة شهرية مفردة. السنوية هي الافتراضية، والسنتان تُمثّل أقصى توفير على المدى البعيد.",
  },
];

// ─── Add-ons ──────────────────────────────────────────────────────────────

export type Addon = {
  name: string;
  sub?: string;
  setup: string;
  quarterly: string;
  annual: string;
  biannual: string;
};

export const ADDONS: Addon[] = [
  {
    name: "تطبيق iOS",
    setup: "$1,500",
    quarterly: "$360",
    annual: "$1,200",
    biannual: "$2,160",
  },
  {
    name: "تطبيق Android",
    setup: "$1,500",
    quarterly: "$360",
    annual: "$1,200",
    biannual: "$2,160",
  },
  {
    name: "حزمة iOS + Android",
    setup: "$2,500",
    quarterly: "$600",
    annual: "$2,000",
    biannual: "$3,600",
  },
  {
    name: "وحدة تشارتر",
    sub: "للباقات غير المتخصّصة",
    setup: "$1,000",
    quarterly: "$450",
    annual: "$1,500",
    biannual: "$2,700",
  },
  {
    name: "التأمين السياحي",
    setup: "$500",
    quarterly: "$240",
    annual: "$800",
    biannual: "$1,440",
  },
  {
    name: "الشرائح الإلكترونية (eSIM)",
    setup: "$300",
    quarterly: "$180",
    annual: "$600",
    biannual: "$1,080",
  },
  {
    name: "QiCard",
    sub: "بوابة دفع",
    setup: "—",
    quarterly: "$100",
    annual: "$333",
    biannual: "$600",
  },
  {
    name: "ZainCash",
    sub: "بوابة دفع",
    setup: "—",
    quarterly: "$100",
    annual: "$333",
    biannual: "$600",
  },
  {
    name: "FastPay",
    sub: "بوابة دفع",
    setup: "—",
    quarterly: "$100",
    annual: "$333",
    biannual: "$600",
  },
  {
    name: "واجهة برمجية صادرة (API)",
    setup: "$1,500",
    quarterly: "$600",
    annual: "$2,000",
    biannual: "$3,600",
  },
  {
    name: "+10 مقاعد مستخدمين",
    setup: "—",
    quarterly: "$150",
    annual: "$500",
    biannual: "$900",
  },
];

export const SETUP_INCLUDES = [
  "تصميم الهوية البصرية للعلامة (Branding) ودمجها في كامل المنصّة",
  "نشر النطاق المخصّص وربط الشهادات الأمنية",
  "تهيئة بيانات الاعتماد لدى المورّدين وأنظمة التوزيع (GDS)",
  "التدريب الأوّلي للفريق وتجهيز قاعدة البيانات",
];

// ─── Decision section packages ────────────────────────────────────────────

export const DECISION_PACKAGES = [
  {
    id: "charter",
    label: "تشارتر",
    featured: false,
    rows: [
      { term: "ربع سنوي", price: "$450", unit: "/quarter" },
      { term: "سنوي", price: "$1,500", unit: "/year" },
      { term: "إعداد", price: "$500", unit: "مرة واحدة" },
    ],
  },
  {
    id: "standard",
    label: "القياسية",
    featured: true,
    rows: [
      { term: "ربع سنوي", price: "$1,350", unit: "/quarter" },
      { term: "سنوي", price: "$4,500", unit: "/year" },
      { term: "إعداد", price: "$2,000", unit: "مرة واحدة" },
    ],
  },
  {
    id: "advanced",
    label: "المتقدّمة",
    featured: false,
    rows: [
      { term: "ربع سنوي", price: "$2,700", unit: "/quarter" },
      { term: "سنوي", price: "$9,000", unit: "/year" },
      { term: "إعداد", price: "$3,250", unit: "مرة واحدة" },
    ],
  },
];

export const DECISION_LINES = [
  { label: "الباقة المختارة" },
  { label: "مدّة الاشتراك" },
  { label: "وحدات إضافية" },
  { label: "تاريخ البدء" },
];

export const DECISION_SIGN_FIELDS = [
  { label: "Authorised Signature" },
  { label: "Date" },
  { label: "Stamp / Seal" },
];
