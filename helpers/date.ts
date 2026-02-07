export function timeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  if (seconds < 5) return "just now";

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }

  return "just now";
}

export const getTimeAgoISO = () => {
  const now = new Date();

  const subtractMinutes = (minutes: number): string =>
    new Date(now.getTime() - minutes * 60 * 1000).toISOString();
  const subtractHours = (hours: number) =>
    new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
  const subtractDays = (days: number) =>
    new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  return {
    last30Minutes: subtractMinutes(30),
    last24Hours: subtractHours(24),
    last7Days: subtractDays(7),
    last30Days: subtractDays(30),
  };
};

export const formatIfDate = (value: string): string => {
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return value;
};
