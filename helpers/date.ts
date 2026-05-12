const TRANSLATIONS = {
  en: {
    justNow: "just now",
    ago: (n: number, unit: string) =>
      n === 1 ? `1 ${unit} ago` : `${n} ${unit}s ago`,
    units: {
      year: "year",
      month: "month",
      week: "week",
      day: "day",
      hour: "hour",
      minute: "minute",
      second: "second",
    },
  },
  ar: {
    justNow: "الآن",
    ago: (n: number, unit: string) => `منذ ${n} ${unit}`,
    units: {
      year: "سنة",
      month: "شهر",
      week: "أسبوع",
      day: "يوم",
      hour: "ساعة",
      minute: "دقيقة",
      second: "ثانية",
    },
  },
} as const;

type Locale = keyof typeof TRANSLATIONS;

export function timeAgo(isoString: string, locale: Locale = "en"): string {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: Record<string, number> = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  const t = TRANSLATIONS[locale];

  if (seconds < 5) return t.justNow;

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return t.ago(interval, t.units[unit as keyof typeof t.units]);
    }
  }

  return t.justNow;
}
