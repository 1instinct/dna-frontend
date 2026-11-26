import { Skeleton } from "@components/ui";
import React from "react";
import { useCreator, useCreatorPayouts } from "@hooks/useCreator";
import {
  ErrorNote,
  formatDate,
  formatMoney,
  numCls,
  PageTitle,
  Section,
  Stat,
  payoutEmailCopy
} from "./kit";

export const PayoutsView: React.FC = () => {
  const { data: creator } = useCreator();
  const payouts = useCreatorPayouts();
  if (!creator) return null;
  const cur = creator.totals.currency || "USD";

  return (
    <>
      <PageTitle>Payouts</PageTitle>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <Stat
          label="Payable now"
          value={formatMoney(creator.totals.payable, cur)}
          accent
        />
        <Stat label="Paid out" value={formatMoney(creator.totals.paid, cur)} />
        <Stat
          label="Payout email"
          value={
            <span className="font-body text-sm">
              {creator.account.payout_email || "Not set"}
            </span>
          }
        />
      </div>

      <Section title="History" className="mt-4">
        {payouts.isLoading ? (
          <Skeleton className="h-24" />
        ) : payouts.isError ? (
          <ErrorNote error={payouts.error} />
        ) : !payouts.data?.length ? (
          <p className="font-body text-sm text-muted-foreground">
            No payouts yet. Payable earnings are paid out from your balance.
          </p>
        ) : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[420px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border/30 font-body text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-normal">Paid</th>
                  <th className="px-3 py-2 text-right font-normal">Amount</th>
                  <th className="px-3 py-2 font-normal">Reference</th>
                  <th className="px-3 py-2 font-normal">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {payouts.data.map((p) => (
                  <tr key={p.id}>
                    <td
                      className={`${numCls} px-3 py-1.5 text-xs text-muted-foreground`}
                    >
                      {formatDate(p.paid_at)}
                    </td>
                    <td
                      className={`${numCls} px-3 py-1.5 text-right text-sm text-foreground`}
                    >
                      {formatMoney(p.amount, p.currency || cur)}
                    </td>
                    <td
                      className={`${numCls} px-3 py-1.5 text-xs text-muted-foreground`}
                    >
                      {p.reference || "—"}
                    </td>
                    <td className="px-3 py-1.5 font-body text-xs text-muted-foreground">
                      {p.note || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 font-body text-xs text-muted-foreground">
          {payoutEmailCopy()}
        </p>
      </Section>
    </>
  );
};
