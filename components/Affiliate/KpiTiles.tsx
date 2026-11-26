import React from "react";
import { cn } from "@lib/utils";
import { formatMoney, type SeriesSummary } from "@lib/affiliate/stats";
import type { AffiliateTotals } from "@lib/affiliate/types";
import { num } from "./ui";

const Tile: React.FC<{
  label: string;
  value: string;
  accent?: string;
  dim?: boolean;
  /** Below 414 px, lay the tile out as a row (label left, value right). */
  compact?: boolean;
}> = ({ label, value, accent, dim, compact }) => (
  <div
    className={cn(
      "relative min-w-0 overflow-hidden rounded-lg border border-border/30 bg-muted/50 px-3 pb-2.5 pt-3",
      compact &&
        "max-xs:flex max-xs:items-baseline max-xs:justify-between max-xs:gap-3 max-xs:py-2.5"
    )}
  >
    {accent && (
      <span
        className={cn("absolute inset-x-0 top-0 h-[2px]", accent)}
        aria-hidden
      />
    )}
    <dt className="truncate font-body text-xs leading-4 text-foreground/55">
      {label}
    </dt>
    <dd
      className={cn(
        "m-0 mt-1 truncate text-[15px] leading-6 xs:text-lg",
        compact && "max-xs:mt-0",
        num,
        dim ? "text-muted-foreground" : "text-foreground"
      )}
      title={value}
    >
      {value}
    </dd>
  </div>
);

const Group: React.FC<{
  caption: string;
  /** Grid columns for the tiles. */
  cols: string;
  loading?: boolean;
  children: React.ReactNode;
}> = ({ caption, cols, loading, children }) => (
  <div
    className={cn("min-w-0 transition-opacity", loading && "opacity-60")}
    aria-busy={loading || undefined}
  >
    <p className="m-0 mb-2 font-body text-xs text-foreground/55">{caption}</p>
    <dl className={cn("m-0 grid gap-2", cols)}>{children}</dl>
  </div>
);

export const KpiTiles: React.FC<{
  summary: SeriesSummary | null;
  totals: AffiliateTotals;
  loading?: boolean;
}> = ({ summary, totals, loading }) => {
  const cur = totals.currency || "USD";
  const dash = "—";
  return (
    <div className="grid gap-4">
      {/* Only the range-driven tiles wait on the stats query. */}
      <Group
        caption="In this range"
        cols="grid-cols-2 sm:grid-cols-4"
        loading={loading}
      >
        <Tile
          label="Clicks"
          value={summary ? summary.clicks.toLocaleString("en-US") : dash}
          accent="bg-brand"
        />
        <Tile
          label="Orders"
          value={summary ? summary.orders.toLocaleString("en-US") : dash}
          accent="bg-foreground/60"
        />
        <Tile
          label="Conversion"
          value={
            summary
              ? `${(summary.conversion * 100).toFixed(
                  summary.conversion > 0 && summary.conversion < 0.1 ? 2 : 1
                )}%`
              : dash
          }
        />
        <Tile
          label="Commission"
          value={summary ? formatMoney(summary.commission, cur) : dash}
          accent="bg-emerald-500"
        />
      </Group>
      <Group
        caption="Commission balance, all time"
        cols="grid-cols-3 max-xs:grid-cols-1"
      >
        <Tile
          label="Pending"
          compact
          value={formatMoney(totals.pending, cur)}
          accent="bg-amber-500"
        />
        <Tile
          label="Approved"
          compact
          value={formatMoney(totals.approved, cur)}
          accent="bg-brand"
        />
        <Tile
          label="Paid"
          compact
          value={formatMoney(totals.paid, cur)}
          accent="bg-emerald-500"
        />
      </Group>
    </div>
  );
};

export default KpiTiles;
