export type PricedRow = {
  nameKey: string;
  subKey?: string;
  badgeKey?: string; // e.g. "Flight API" label shown alongside the name
  setup: string | "FREE";
  quarterly: string;
  annual: string;
  biannual: string;
};

export type SectionGroup = {
  titleKey?: string;
  tagKey?: string;
  rows: PricedRow[];
};

// ─── Optional Modules ─────────────────────────────────────────────────────────

export const MODULES: PricedRow[] = [
  {
    nameKey: "ios_app",
    setup: "$1,500",
    quarterly: "$360",
    annual: "$1,200",
    biannual: "$2,160",
  },
  {
    nameKey: "android_app",
    setup: "$1,500",
    quarterly: "$360",
    annual: "$1,200",
    biannual: "$2,160",
  },
  {
    nameKey: "ios_android_bundle",
    setup: "$2,500",
    quarterly: "$600",
    annual: "$2,000",
    biannual: "$3,600",
  },
  {
    nameKey: "starter_module",
    subKey: "starter_module_subtext",
    setup: "$750",
    quarterly: "$270",
    annual: "$900",
    biannual: "$1,620",
  },
  {
    nameKey: "travel_insurance",
    setup: "$300",
    quarterly: "$180",
    annual: "$600",
    biannual: "$1,080",
  },
  {
    nameKey: "esim",
    setup: "$300",
    quarterly: "$180",
    annual: "$600",
    biannual: "$1,080",
  },
  {
    nameKey: "extra_users",
    setup: "FREE",
    quarterly: "$150",
    annual: "$500",
    biannual: "$900",
  },
];

// ─── Outbound APIs ────────────────────────────────────────────────────────────

export const APIS: PricedRow[] = [
  {
    nameKey: "flight_api",
    badgeKey: "Flight API",
    setup: "$2,000",
    quarterly: "$300",
    annual: "$1,000",
    biannual: "$1,800",
  },
  {
    nameKey: "hotels_api",
    badgeKey: "Hotels API",
    setup: "$1,000",
    quarterly: "$150",
    annual: "$500",
    biannual: "$900",
  },
  {
    nameKey: "visas_api",
    badgeKey: "Visas API",
    setup: "$500",
    quarterly: "$75",
    annual: "$250",
    biannual: "$450",
  },
  {
    nameKey: "insurance_api",
    badgeKey: "Insurance API",
    setup: "$300",
    quarterly: "$75",
    annual: "$250",
    biannual: "$450",
  },
  {
    nameKey: "group_tours_api",
    badgeKey: "Group Tours API",
    setup: "$500",
    quarterly: "$75",
    annual: "$250",
    biannual: "$450",
  },
  {
    nameKey: "esim_api",
    badgeKey: "eSIM API",
    setup: "$300",
    quarterly: "$75",
    annual: "$250",
    biannual: "$450",
  },
  {
    nameKey: "charter_api",
    badgeKey: "Charter API",
    setup: "$1,000",
    quarterly: "$150",
    annual: "$500",
    biannual: "$900",
  },
];

// ─── Payment Gateways ─────────────────────────────────────────────────────────

export const GATEWAY_GROUPS: SectionGroup[] = [
  {
    titleKey: "direct_integration",
    tagKey: "direct_integration_sub",
    rows: [
      {
        nameKey: "qicard_gateway",
        setup: "FREE",
        quarterly: "$60",
        annual: "$200",
        biannual: "$360",
      },
      {
        nameKey: "zaincash_gateway",
        setup: "FREE",
        quarterly: "$60",
        annual: "$200",
        biannual: "$360",
      },
      {
        nameKey: "fastpay_gateway",
        setup: "FREE",
        quarterly: "$60",
        annual: "$200",
        biannual: "$360",
      },
      {
        nameKey: "fib_gateway",
        setup: "FREE",
        quarterly: "$60",
        annual: "$200",
        biannual: "$360",
      },
      {
        nameKey: "switch_gateway",
        setup: "FREE",
        quarterly: "$60",
        annual: "$200",
        biannual: "$360",
      },
      {
        nameKey: "amwal_gateway",
        setup: "FREE",
        quarterly: "$60",
        annual: "$200",
        biannual: "$360",
      },
    ],
  },
  {
    titleKey: "tourpay",
    tagKey: "tourpay_sub",
    rows: [
      {
        nameKey: "tourqi",
        setup: "FREE",
        quarterly: "$60",
        annual: "$200",
        biannual: "$360",
      },
      {
        nameKey: "tourzaincash",
        setup: "FREE",
        quarterly: "$60",
        annual: "$200",
        biannual: "$360",
      },
      {
        nameKey: "tourfastpay",
        setup: "FREE",
        quarterly: "$60",
        annual: "$200",
        biannual: "$360",
      },
      {
        nameKey: "tourfib",
        setup: "FREE",
        quarterly: "$60",
        annual: "$200",
        biannual: "$360",
      },
      {
        nameKey: "tourswitch",
        setup: "FREE",
        quarterly: "$60",
        annual: "$200",
        biannual: "$360",
      },
      {
        nameKey: "touramwal",
        setup: "FREE",
        quarterly: "$60",
        annual: "$200",
        biannual: "$360",
      },
    ],
  },
];
