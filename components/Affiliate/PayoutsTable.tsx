import React from "react";
import { cn } from "@lib/utils";
import { formatMoney } from "@lib/affiliate/stats";
import { useAffiliatePayouts } from "@hooks/useAffiliate";
import { Panel, formatDate, num } from "./ui";

export const PayoutsTable: React.FC<{ currency: string }> = ({ currency }) => {
  const { data, isLoading, isError, refetch } = useAffiliatePayouts();
  const payouts = data?.payouts || [];

  return (
    <Panel title="Payouts" id="aff-payouts">
      {isLoading ? (
        <div className="h-10 animate-pulse rounded bg-muted/50" aria-busy />
      ) : isError ? (
        <p className="m-0 font-body text-sm text-muted-foreground">
          Payouts didn&apos;t load.{" "}
          <button
            type="button"
            onClick={() => refetch()}
            className="cursor-pointer border-0 bg-transparent p-0 text-brand underline underline-offset-4"
          >
            Try again
          </button>
        </p>
      ) : payouts.length === 0 ? (
        <p className="m-0 font-body text-sm leading-6 text-muted-foreground">
          No payouts yet. We pay approved commissions to your payout email, and
          each payment appears here with its reference.
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/30 text-left font-body text-xs text-foreground/55">
              <th className="pb-2 pr-3 font-normal">Paid</th>
              <th className="pb-2 pr-3 text-right font-normal">Amount</th>
              <th className="pb-2 font-normal">Reference</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p, i) => (
              <tr
                key={p.id ?? `${p.paid_at}-${i}`}
                className="border-b border-border/30 align-top last:border-b-0"
              >
                <td className="py-2.5 pr-3 font-body text-muted-foreground">
                  {formatDate(p.paid_at) || "—"}
                </td>
                <td
                  className={cn("py-2.5 pr-3 text-right text-foreground", num)}
                >
                  {formatMoney(p.amount, p.currency || currency)}
                </td>
                <td className="break-all py-2.5 font-body text-muted-foreground">
                  {p.reference || "—"}
                  {p.note && (
                    <span className="mt-0.5 block text-xs text-foreground/55">
                      {p.note}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  );
};

export default PayoutsTable;
