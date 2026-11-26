import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@lib/utils";
import { formatMoney } from "@lib/affiliate/stats";
import { useAffiliateCommissions } from "@hooks/useAffiliate";
import { Panel, StateChip, formatDate, ghostBtn, num } from "./ui";

export const CommissionsTable: React.FC<{ currency: string }> = ({
  currency
}) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching, refetch } =
    useAffiliateCommissions(page);
  const rows = data?.rows || [];
  const pages = Math.max(1, data?.pages || 1);

  return (
    <Panel
      title="Commissions"
      id="aff-commissions"
      aside={
        pages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={cn(ghostBtn, "px-2")}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className={cn("text-xs text-muted-foreground", num)}>
              {page} / {pages}
            </span>
            <button
              type="button"
              className={cn(ghostBtn, "px-2")}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages || isFetching}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )
      }
    >
      {isLoading ? (
        <div className="space-y-2" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted/50" />
          ))}
        </div>
      ) : isError ? (
        <p className="m-0 font-body text-sm text-muted-foreground">
          Commissions didn&apos;t load.{" "}
          <button
            type="button"
            onClick={() => refetch()}
            className="cursor-pointer border-0 bg-transparent p-0 text-brand underline underline-offset-4"
          >
            Try again
          </button>
        </p>
      ) : rows.length === 0 ? (
        <p className="m-0 font-body text-sm leading-6 text-muted-foreground">
          No commissions yet. Each order placed through your link shows up here
          with its amount and status.
        </p>
      ) : (
        <div className={cn("transition-opacity", isFetching && "opacity-60")}>
          <table className="hidden w-full border-collapse text-sm sm:table">
            <thead>
              <tr className="border-b border-border/30 text-left font-body text-xs text-foreground/55">
                <th className="pb-2 pr-3 font-normal">Order</th>
                <th className="pb-2 pr-3 font-normal">Placed</th>
                <th className="pb-2 pr-3 text-right font-normal">
                  Order value
                </th>
                <th className="pb-2 pr-3 text-right font-normal">Commission</th>
                <th className="pb-2 pr-3 font-normal">Status</th>
                <th className="pb-2 font-normal">Approves</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={`${r.order_masked}-${r.created_at}-${i}`}
                  className="border-b border-border/30 last:border-b-0"
                >
                  <td className={cn("py-2.5 pr-3 text-foreground", num)}>
                    {r.order_masked}
                  </td>
                  <td className="py-2.5 pr-3 font-body text-muted-foreground">
                    {formatDate(r.created_at)}
                  </td>
                  <td
                    className={cn(
                      "py-2.5 pr-3 text-right text-muted-foreground",
                      num
                    )}
                  >
                    {formatMoney(r.base_amount, currency)}
                  </td>
                  <td
                    className={cn(
                      "py-2.5 pr-3 text-right",
                      num,
                      r.state === "void"
                        ? "text-foreground/55 line-through"
                        : "text-foreground"
                    )}
                  >
                    {formatMoney(r.amount, currency)}
                  </td>
                  <td className="py-2.5 pr-3">
                    <StateChip state={r.state} />
                  </td>
                  <td className="py-2.5 font-body text-muted-foreground">
                    {r.state === "pending" && r.approvable_at
                      ? formatDate(r.approvable_at)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="m-0 list-none p-0 sm:hidden" aria-label="Commissions">
            {rows.map((r, i) => (
              <li
                key={`${r.order_masked}-${r.created_at}-${i}`}
                className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 border-b border-border/30 py-2.5 last:border-b-0"
              >
                <span className={cn("text-sm text-foreground", num)}>
                  <span className="sr-only">Order ending </span>
                  {r.order_masked}
                </span>
                <span
                  className={cn(
                    "text-right text-sm",
                    num,
                    r.state === "void"
                      ? "text-foreground/55 line-through"
                      : "text-foreground"
                  )}
                >
                  {formatMoney(r.amount, currency)}
                </span>
                <span className="font-body text-xs leading-5 text-foreground/55">
                  {formatDate(r.created_at)}, order{" "}
                  <span className={num}>
                    {formatMoney(r.base_amount, currency)}
                  </span>
                  {r.state === "pending" && r.approvable_at && (
                    <>
                      <br />
                      Approves {formatDate(r.approvable_at)}
                    </>
                  )}
                </span>
                <span className="text-right">
                  <StateChip state={r.state} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
};

export default CommissionsTable;
