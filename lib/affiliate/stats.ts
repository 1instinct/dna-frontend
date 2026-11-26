/** Pure helpers for the affiliate dashboard. */

export type Amount = number | string | null | undefined;

export interface StatsPoint {
  date: string;
  clicks: number;
  orders: number;
  commission: Amount;
}

export interface SeriesSummary {
  clicks: number;
  orders: number;
  commission: number;
  /** orders / clicks, 0..1 (0 with no clicks). */
  conversion: number;
}

/** Decimal strings (as Rails sends them) and numbers to a number; else 0. */
export function toNumber(v: Amount): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
}

const isoDate = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/** The last `days` days including `today`, as local ISO dates. */
export function lastDaysRange(
  days: number,
  today: Date = new Date()
): { from: string; to: string } {
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - (days - 1)
  );
  return { from: isoDate(start), to: isoDate(today) };
}

/** The backend's stats limit (spec: at most 366 days). */
export const MAX_RANGE_DAYS = 366;

const parseIso = (iso: string): number | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(t);
  return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? t : null;
};

/** from <= to, both real dates, spanning at most MAX_RANGE_DAYS days. */
export function isValidRange(range: { from: string; to: string }): boolean {
  const from = parseIso(range.from);
  const to = parseIso(range.to);
  if (from === null || to === null || from > to) return false;
  return (to - from) / 86400000 + 1 <= MAX_RANGE_DAYS;
}

export function summarizeSeries(series: StatsPoint[]): SeriesSummary {
  let clicks = 0;
  let orders = 0;
  let commission = 0;
  for (const p of series) {
    clicks += toNumber(p.clicks);
    orders += toNumber(p.orders);
    commission += toNumber(p.commission);
  }
  commission = Math.round(commission * 100) / 100;
  const conversion = clicks > 0 ? orders / clicks : 0;
  return { clicks, orders, commission, conversion };
}

export function formatMoney(v: Amount, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency
    }).format(toNumber(v));
  } catch {
    return `${toNumber(v).toFixed(2)} ${currency}`;
  }
}

/** 1000 → "10%", 1250 → "12.5%". */
export function formatBps(bps: number): string {
  return `${Math.round(bps) / 100}%`;
}
