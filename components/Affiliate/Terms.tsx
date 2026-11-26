import React from "react";
import { formatBps } from "@lib/affiliate/stats";
import {
  DEFAULT_COMMISSION_BPS,
  DEFAULT_COOKIE_DAYS,
  HOLD_DAYS
} from "@lib/affiliate/terms";
import { Panel } from "./ui";

/** The program terms; the dashboard passes the affiliate's own rate and window. */
export const Terms: React.FC<{
  commissionBps?: number | null;
  cookieDays?: number | null;
  /** On the dashboard, payments are listed on the same page. */
  onDashboard?: boolean;
  className?: string;
}> = ({ commissionBps, cookieDays, onDashboard, className }) => {
  const rate = formatBps(commissionBps || DEFAULT_COMMISSION_BPS);
  const days = cookieDays || DEFAULT_COOKIE_DAYS;
  const items = [
    `You earn ${rate} of the order's item total after discounts. Shipping and tax don't count.`,
    `An order counts if it's placed within ${days} days of someone clicking your link. If they click another affiliate's link after yours, the newer link gets the order.`,
    "Your own orders don't earn commission.",
    `Commissions stay pending for ${HOLD_DAYS} days after the order, then are approved. A cancelled or refunded order is voided, and a partial refund lowers the commission.`,
    onDashboard
      ? "We pay approved commissions by hand to your payout email and list each payment here."
      : "We pay approved commissions by hand to your payout email.",
    "You see the last four characters of each order number and its amounts, never the buyer's name or email."
  ];
  return (
    <Panel title="Program terms" id="aff-terms" className={className}>
      <ul className="m-0 list-none space-y-2.5 p-0">
        {items.map((t) => (
          <li
            key={t}
            className="relative pl-4 font-body text-sm leading-6 text-muted-foreground before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-brand/70"
          >
            {t}
          </li>
        ))}
      </ul>
    </Panel>
  );
};

export default Terms;
