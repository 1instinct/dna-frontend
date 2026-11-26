import React, { useState } from "react";
import type { DailyPoint } from "../../lib/creator/range";
import { formatMoney, numCls } from "./kit";

/**
 * Earnings per day as bars, units sold as a line on the same days. Hover or
 * focus a day to read it exactly.
 */
export const SalesChart: React.FC<{
  points: DailyPoint[];
  currency: string;
}> = ({ points, currency }) => {
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = 160;
  const PAD_B = 18;
  const n = Math.max(1, points.length);
  const bw = W / n;
  const maxE = Math.max(1, ...points.map((p) => p.earned));
  const maxU = Math.max(1, ...points.map((p) => p.units));
  const y = (v: number, max: number) => H - PAD_B - (v / max) * (H - PAD_B - 6);
  const line = points
    .map(
      (p, i) => `${(i * bw + bw / 2).toFixed(1)},${y(p.units, maxU).toFixed(1)}`
    )
    .join(" ");
  const ticks = [0, Math.floor((n - 1) / 2), n - 1].filter(
    (v, i, a) => a.indexOf(v) === i && points[v]
  );
  const shown = hover !== null ? points[hover] : null;
  const totalE = points.reduce((s, p) => s + p.earned, 0);
  const totalU = points.reduce((s, p) => s + p.units, 0);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-body text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-brand" aria-hidden /> Earned
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 bg-foreground" aria-hidden /> Units
        </span>
        <span className="ml-auto text-muted-foreground">
          {shown ? (
            <>
              {shown.date}:{" "}
              <span className={numCls}>
                {formatMoney(shown.earned, currency)}
              </span>
              , <span className={numCls}>{shown.units}</span> sold
            </>
          ) : (
            <>
              <span className={numCls}>{formatMoney(totalE, currency)}</span>{" "}
              earned, <span className={numCls}>{totalU}</span> sold
            </>
          )}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-40 w-full text-foreground"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Earnings per day: ${formatMoney(
          totalE,
          currency
        )} from ${totalU} sales`}
        onMouseLeave={() => setHover(null)}
      >
        <line
          x1="0"
          x2={W}
          y1={H - PAD_B}
          y2={H - PAD_B}
          stroke="currentColor"
          strokeOpacity={0.15}
        />
        {points.map((p, i) => {
          const top = y(p.earned, maxE);
          return (
            <g key={p.date} onMouseEnter={() => setHover(i)}>
              <rect
                x={i * bw}
                y={0}
                width={bw}
                height={H - PAD_B}
                fill="transparent"
              />
              <rect
                x={i * bw + bw * 0.15}
                y={top}
                width={Math.max(1, bw * 0.7)}
                height={Math.max(0, H - PAD_B - top)}
                className="fill-brand"
                fillOpacity={hover === i ? 1 : 0.55}
              />
            </g>
          );
        })}
        {points.length > 1 && (
          <polyline
            points={line}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            pointerEvents="none"
          />
        )}
      </svg>
      <div
        className={`${numCls} relative h-4 text-[10px] text-muted-foreground`}
      >
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute -translate-x-1/2 whitespace-nowrap"
            style={{
              left: `${((t + 0.5) / n) * 100}%`,
              transform:
                t === 0 ? "none" : t === n - 1 ? "translateX(-100%)" : undefined
            }}
          >
            {points[t].date.slice(5)}
          </span>
        ))}
      </div>
    </div>
  );
};
