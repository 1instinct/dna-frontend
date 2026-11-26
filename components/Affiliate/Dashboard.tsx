import React, { useMemo, useState } from "react";
import { cn } from "@lib/utils";
import {
  MAX_RANGE_DAYS,
  formatBps,
  isValidRange,
  lastDaysRange,
  summarizeSeries
} from "@lib/affiliate/stats";
import type { Affiliate } from "@lib/affiliate/types";
import { useAffiliateStats } from "@hooks/useAffiliate";
import { LinkBuilder } from "./LinkBuilder";
import { KpiTiles } from "./KpiTiles";
import { StatsChart } from "./StatsChart";
import { CommissionsTable } from "./CommissionsTable";
import { PayoutsTable } from "./PayoutsTable";
import { Terms } from "./Terms";
import { PayoutEmail } from "./PayoutEmail";
import { Panel, num } from "./ui";

type RangeChoice = 7 | 30 | 90 | "custom";
const RANGE_CHOICES: { value: RangeChoice; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
  { value: "custom", label: "Custom" }
];

const dateInput =
  "min-w-0 rounded-md border border-border/30 bg-muted/50 px-2 py-1.5 font-body text-[16px] leading-5 text-foreground [color-scheme:dark] focus:border-brand focus:outline-none sm:text-[13px]";

export const Dashboard: React.FC<{ affiliate: Affiliate }> = ({
  affiliate
}) => {
  const [choice, setChoice] = useState<RangeChoice>(30);
  const [custom, setCustom] = useState(() => lastDaysRange(30));
  const range = useMemo(
    () => (choice === "custom" ? custom : lastDaysRange(choice)),
    [choice, custom]
  );
  const validRange = isValidRange(range);
  const stats = useAffiliateStats(range, validRange);
  const series = stats.data?.series || [];
  const summary = stats.data ? summarizeSeries(series) : null;
  const currency = affiliate.totals?.currency || "USD";

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="m-0 font-title font-semibold text-base leading-6 text-foreground sm:text-lg">
          Affiliate dashboard
        </h2>
        <p className="m-0 font-body text-sm text-muted-foreground">
          <span className={cn("text-foreground", num)}>{affiliate.code}</span>
          {"  "}earns{" "}
          <span className={cn("text-foreground", num)}>
            {formatBps(affiliate.commission_bps)}
          </span>
          , {affiliate.cookie_days}-day window
        </p>
      </div>

      <PayoutEmail email={affiliate.payout_email} className="-mt-2" />

      <LinkBuilder code={affiliate.code} link={affiliate.link} />

      <Panel
        title="Performance"
        id="aff-performance"
        aside={
          <div
            role="group"
            aria-label="Date range"
            className="flex rounded-md border border-border/30 bg-black/30 p-0.5"
          >
            {RANGE_CHOICES.map((p) => {
              const on = choice === p.value;
              return (
                <button
                  key={String(p.value)}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setChoice(p.value)}
                  className={cn(
                    "rounded px-2.5 py-1.5 font-body text-xs leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
                    on
                      ? "bg-brand/15 text-brand"
                      : "bg-transparent text-foreground/55 hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        }
      >
        {choice === "custom" && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 font-body text-xs text-muted-foreground">
              From
              <input
                type="date"
                value={custom.from}
                max={custom.to}
                onChange={(e) =>
                  e.target.value &&
                  setCustom((c) => ({ ...c, from: e.target.value }))
                }
                className={dateInput}
              />
            </label>
            <label className="flex items-center gap-2 font-body text-xs text-muted-foreground">
              to
              <input
                type="date"
                value={custom.to}
                min={custom.from}
                onChange={(e) =>
                  e.target.value &&
                  setCustom((c) => ({ ...c, to: e.target.value }))
                }
                className={dateInput}
              />
            </label>
            {!validRange && (
              <span role="alert" className="font-body text-xs text-amber-700">
                {custom.from > custom.to
                  ? "The start date is after the end date."
                  : `Pick a range of ${MAX_RANGE_DAYS} days or less.`}
              </span>
            )}
          </div>
        )}

        <KpiTiles
          summary={summary}
          totals={affiliate.totals}
          loading={stats.isFetching}
        />

        <div className="mt-5">
          {stats.isError && (
            <p
              role="alert"
              className="m-0 mb-3 font-body text-sm text-amber-700"
            >
              {stats.data
                ? "The latest stats didn't load, so these may be out of date. "
                : "Stats didn't load. "}
              <button
                type="button"
                onClick={() => stats.refetch()}
                className="cursor-pointer border-0 bg-transparent p-0 text-brand underline underline-offset-4"
              >
                Try again
              </button>
            </p>
          )}
          {stats.isLoading ? (
            <div className="h-[230px] animate-pulse rounded-md bg-muted/50" />
          ) : stats.data ? (
            <StatsChart
              series={series}
              currency={currency}
              loading={stats.isFetching}
            />
          ) : null}
        </div>
      </Panel>

      <CommissionsTable currency={currency} />

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <PayoutsTable currency={currency} />
        <Terms
          commissionBps={affiliate.commission_bps}
          cookieDays={affiliate.cookie_days}
          onDashboard
        />
      </div>
    </div>
  );
};

export default Dashboard;
