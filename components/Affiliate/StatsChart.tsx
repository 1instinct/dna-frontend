import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@lib/utils";
import { formatMoney, toNumber, type StatsPoint } from "@lib/affiliate/stats";
import { num } from "./ui";

/**
 * Clicks, orders and commission as three lanes on one shared time axis.
 * Each lane has its own scale (no dual axis);
 * one playhead reads all three for a day. Arrow keys move it.
 */

type LaneKey = "clicks" | "orders" | "commission";
const LANES: {
  key: LaneKey;
  label: string;
  color: string;
  kind: "area" | "bars" | "line";
}[] = [
  {
    key: "clicks",
    label: "Clicks",
    color: "hsl(var(--primary))",
    kind: "area"
  },
  {
    key: "orders",
    label: "Orders",
    color: "hsl(var(--muted-foreground))",
    kind: "bars"
  },
  {
    key: "commission",
    label: "Commission",
    color: "hsl(var(--foreground))",
    kind: "line"
  }
];

const LANE_H = 64;
const LANE_GAP = 8;
const LABEL_H = 20;
const AXIS_H = 22;
const PAD_X = 6;

const parseDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const shortDay = (iso: string) =>
  parseDay(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const longDay = (iso: string) =>
  parseDay(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });

const useWidth = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width))
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
};

export const StatsChart: React.FC<{
  series: StatsPoint[];
  currency: string;
  loading?: boolean;
}> = ({ series, currency, loading }) => {
  const [wrapRef, width] = useWidth();
  const [active, setActive] = useState<number | null>(null);
  const n = series.length;

  const values = useMemo(
    () => ({
      clicks: series.map((p) => toNumber(p.clicks)),
      orders: series.map((p) => toNumber(p.orders)),
      commission: series.map((p) => toNumber(p.commission))
    }),
    [series]
  );
  const totals = useMemo(
    () => ({
      clicks: values.clicks.reduce((a, b) => a + b, 0),
      orders: values.orders.reduce((a, b) => a + b, 0),
      commission: values.commission.reduce((a, b) => a + b, 0)
    }),
    [values]
  );
  const empty = n === 0 || (totals.clicks === 0 && totals.orders === 0);

  const fmt = (key: LaneKey, v: number) =>
    key === "commission"
      ? formatMoney(v, currency)
      : Math.round(v).toLocaleString("en-US");

  const laneTop = (i: number) => i * (LANE_H + LANE_GAP);
  const plotH = LANE_H - LABEL_H;
  const height = LANES.length * (LANE_H + LANE_GAP) - LANE_GAP + AXIS_H;
  const step = n > 0 ? Math.max(0, width - PAD_X * 2) / n : 0;
  const x = (i: number) => PAD_X + step * i + step / 2;

  const ticks = useMemo(() => {
    if (n === 0) return [] as number[];
    const want = width < 420 ? 3 : 5;
    if (n <= want) return series.map((_, i) => i);
    return Array.from({ length: want }, (_, k) =>
      Math.round((k * (n - 1)) / (want - 1))
    );
  }, [n, width, series]);

  const pick = (clientX: number) => {
    const el = wrapRef.current;
    if (!el || n === 0 || step === 0) return;
    const rel = clientX - el.getBoundingClientRect().left - PAD_X;
    setActive(Math.max(0, Math.min(n - 1, Math.floor(rel / step))));
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (n === 0) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const d = e.key === "ArrowLeft" ? -1 : 1;
      setActive((cur) =>
        Math.max(0, Math.min(n - 1, (cur ?? (d < 0 ? n : -1)) + d))
      );
    } else if (e.key === "Home") {
      setActive(0);
    } else if (e.key === "End") {
      setActive(n - 1);
    } else if (e.key === "Escape") {
      setActive(null);
    }
  };

  const lane = (key: LaneKey, li: number) => {
    const spec = LANES[li];
    const vals = values[key];
    const max = Math.max(...vals, key === "commission" ? 0.01 : 1);
    const top = laneTop(li) + LABEL_H;
    const y = (v: number) => top + plotH - (v / max) * (plotH - 2);
    const base = top + plotH;

    if (spec.kind === "bars") {
      const w = Math.max(1.5, Math.min(step * 0.56, 12));
      return vals.map((v, i) =>
        v > 0 ? (
          <rect
            key={i}
            x={x(i) - w / 2}
            y={y(v)}
            width={w}
            height={Math.max(1.5, base - y(v))}
            rx={Math.min(2, w / 2)}
            fill={spec.color}
            opacity={active === null || active === i ? 0.9 : 0.45}
          />
        ) : null
      );
    }

    if (n === 1) {
      return <circle cx={x(0)} cy={y(vals[0])} r={3} fill={spec.color} />;
    }
    const line = vals
      .map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
      .join("");
    return (
      <g>
        {spec.kind === "area" && (
          <path
            d={`${line}L${x(n - 1).toFixed(1)} ${base}L${x(0).toFixed(
              1
            )} ${base}Z`}
            fill={`url(#aff-fill-${key})`}
          />
        )}
        <path
          d={line}
          fill="none"
          stroke={spec.color}
          strokeWidth={1.75}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {active !== null && (
          <circle
            cx={x(active)}
            cy={y(vals[active])}
            r={3.5}
            fill={spec.color}
            stroke="hsl(var(--background))"
            strokeWidth={2}
          />
        )}
      </g>
    );
  };

  const tipLeft =
    active === null || width === 0
      ? 0
      : Math.max(4, Math.min(width - 172, x(active) - 86));
  const summary = `${n} days: ${fmt("clicks", totals.clicks)} clicks, ${fmt(
    "orders",
    totals.orders
  )} orders, ${fmt("commission", totals.commission)} commission.`;

  return (
    <div>
      <div
        ref={wrapRef}
        className={cn(
          "relative select-none outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-brand/30",
          loading && "opacity-60"
        )}
        style={{ height, touchAction: "pan-y" }}
        tabIndex={n > 0 ? 0 : -1}
        role="group"
        aria-label={`Daily clicks, orders and commission. ${summary} Use the arrow keys to read a day.`}
        onKeyDown={onKey}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
        onBlur={() => setActive(null)}
      >
        {width > 0 && (
          <svg
            width={width}
            height={height}
            className="absolute inset-0 block"
            aria-hidden
          >
            <defs>
              {LANES.map((l) => (
                <linearGradient
                  key={l.key}
                  id={`aff-fill-${l.key}`}
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={l.color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={l.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>

            {LANES.map((l, li) => {
              const top = laneTop(li);
              return (
                <g key={l.key}>
                  <rect
                    x={0}
                    y={top}
                    width={width}
                    height={LANE_H}
                    rx={6}
                    fill="hsl(var(--foreground) / 0.025)"
                    stroke="hsl(var(--foreground) / 0.07)"
                  />
                  <line
                    x1={PAD_X}
                    x2={width - PAD_X}
                    y1={top + LABEL_H + plotH / 2}
                    y2={top + LABEL_H + plotH / 2}
                    stroke="hsl(var(--foreground) / 0.05)"
                    strokeDasharray="2 4"
                  />
                  <line
                    x1={PAD_X}
                    x2={width - PAD_X}
                    y1={top + LANE_H - 0.5}
                    y2={top + LANE_H - 0.5}
                    stroke="hsl(var(--foreground) / 0.12)"
                  />
                  {lane(l.key, li)}
                </g>
              );
            })}

            {active !== null && (
              <line
                x1={x(active)}
                x2={x(active)}
                y1={0}
                y2={height - AXIS_H}
                stroke="hsl(var(--foreground) / 0.55)"
                strokeWidth={1}
              />
            )}

            {ticks.map((i) => (
              <text
                key={i}
                x={x(i)}
                y={height - 6}
                textAnchor={
                  i === 0 && ticks.length > 1
                    ? "start"
                    : i === n - 1 && ticks.length > 1
                    ? "end"
                    : "middle"
                }
                fill="hsl(var(--foreground) / 0.6)"
                fontSize={11}
                fontFamily="ibmplexmono_body_mono_semibold, monospace"
              >
                {shortDay(series[i].date)}
              </text>
            ))}
          </svg>
        )}

        {/* Lane headers: name and the range total. */}
        {LANES.map((l, li) => (
          <div
            key={l.key}
            className="pointer-events-none absolute left-2.5 right-2.5 flex items-center justify-between gap-2"
            style={{ top: laneTop(li) + 4, height: LABEL_H - 4 }}
          >
            <span className="flex items-center gap-1.5 font-body text-[11px] leading-none text-muted-foreground">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: l.color }}
              />
              {l.label}
            </span>
            <span
              className={cn("text-[11px] leading-none text-foreground", num)}
            >
              {fmt(l.key, totals[l.key])}
            </span>
          </div>
        ))}

        {active !== null && series[active] && (
          <div
            className="pointer-events-none absolute z-10 w-[168px] rounded-md border border-border/30 bg-popover/95 px-3 py-2 shadow-lg backdrop-blur"
            style={{ left: tipLeft, top: LANE_H + LANE_GAP + 4 }}
          >
            <p className="m-0 mb-1.5 font-body text-[11px] text-muted-foreground">
              {longDay(series[active].date)}
            </p>
            {LANES.map((l) => (
              <p
                key={l.key}
                className="m-0 flex items-center justify-between gap-2 text-xs leading-5"
              >
                <span className="flex items-center gap-1.5 font-body text-muted-foreground">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: l.color }}
                  />
                  {l.label}
                </span>
                <span className={cn("text-foreground", num)}>
                  {fmt(l.key, values[l.key][active])}
                </span>
              </p>
            ))}
          </div>
        )}

        {empty && !loading && (
          <p className="pointer-events-none absolute inset-x-0 top-[38%] m-0 px-6 text-center font-body text-sm text-foreground/55">
            No clicks in this range yet. Share your link to get started.
          </p>
        )}
      </div>

      {/* Screen readers hear the day the playhead (arrow keys) is on. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {active !== null && series[active]
          ? `${longDay(series[active].date)}: ${fmt(
              "clicks",
              values.clicks[active]
            )} clicks, ${fmt("orders", values.orders[active])} orders, ${fmt(
              "commission",
              values.commission[active]
            )} commission.`
          : ""}
      </p>

      {n > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer font-body text-xs text-foreground/55 hover:text-foreground">
            Daily numbers
          </summary>
          <div className="mt-2 max-h-64 overflow-auto rounded-md border border-border/30">
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 bg-card">
                <tr className="text-left font-body text-foreground/55">
                  <th className="px-3 py-2 font-normal">Day</th>
                  <th className="px-3 py-2 text-right font-normal">Clicks</th>
                  <th className="px-3 py-2 text-right font-normal">Orders</th>
                  <th className="px-3 py-2 text-right font-normal">
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody className={cn("text-foreground/85", num)}>
                {series
                  .map((p, i) => ({ p, i }))
                  .reverse()
                  .map(({ p, i }) => (
                    <tr key={p.date} className="border-t border-border/30">
                      <td className="px-3 py-1.5">{shortDay(p.date)}</td>
                      <td className="px-3 py-1.5 text-right">
                        {fmt("clicks", values.clicks[i])}
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        {fmt("orders", values.orders[i])}
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        {fmt("commission", values.commission[i])}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
};

export default StatsChart;
