// Date ranges for the sales and stats charts. Days are UTC calendar dates
// (YYYY-MM-DD), the same strings the API's series use.

const DAY = 86_400_000;
export const MAX_SERIES_DAYS = 400;

const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const parse = (d: string) => Date.parse(`${d}T00:00:00Z`);

/** The last `days` days, today included. */
export function dateRange(
  days: number,
  now: Date = new Date()
): { from: string; to: string } {
  const to = parse(iso(now.getTime()));
  return { from: iso(to - (Math.max(1, days) - 1) * DAY), to: iso(to) };
}

export interface DailyPoint {
  date: string;
  units: number;
  gross: number;
  earned: number;
}

/** One point per day from `from` to `to` (at most the last 400), zeros where the API sent none. */
export function fillDailySeries(
  series: {
    date: string;
    units: number;
    gross: string | number;
    earned: string | number;
  }[],
  from: string,
  to: string
): DailyPoint[] {
  const end = parse(to);
  const start = Math.max(parse(from), end - (MAX_SERIES_DAYS - 1) * DAY);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end)
    return [];
  const byDate = new Map(series.map((p) => [p.date.slice(0, 10), p]));
  const out: DailyPoint[] = [];
  for (let t = start; t <= end; t += DAY) {
    const d = iso(t);
    const p = byDate.get(d);
    out.push({
      date: d,
      units: Number(p?.units) || 0,
      gross: Number(p?.gross) || 0,
      earned: Number(p?.earned) || 0
    });
  }
  return out;
}
