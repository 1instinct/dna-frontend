import React, { useMemo, useState } from "react";
import { cn } from "@lib/utils";
import { Skeleton } from "@components/ui";
import {
  useCreator,
  useCreatorProducts,
  useCreatorSales
} from "@hooks/useCreator";
import { dateRange, fillDailySeries } from "../../lib/creator/range";
import {
  Chip,
  EARNING_TONE,
  ErrorNote,
  formatDate,
  formatMoney,
  numCls,
  PageTitle,
  Section,
  selectCls
} from "./kit";
import { SalesChart } from "./SalesChart";

const RANGES = [7, 30, 90, 365];

export const SalesView: React.FC = () => {
  const { data: creator } = useCreator();
  const products = useCreatorProducts();
  const [days, setDays] = useState(30);
  const [productId, setProductId] = useState<number | undefined>();
  const range = useMemo(() => dateRange(days), [days]);
  const sales = useCreatorSales({ ...range, product_id: productId });
  const currency = creator?.totals.currency || "USD";

  const points = useMemo(
    () => fillDailySeries(sales.data?.series || [], range.from, range.to),
    [sales.data, range]
  );
  const names = useMemo(
    () => new Map((products.data || []).map((p) => [p.id, p.name])),
    [products.data]
  );

  return (
    <>
      <PageTitle>Sales</PageTitle>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex gap-1" role="group" aria-label="Range">
          {RANGES.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={days === d}
              onClick={() => setDays(d)}
              className={cn(
                "rounded-md border px-2.5 py-1 font-body text-xs tabular-nums",
                days === d
                  ? "border-brand/60 bg-brand/10 text-brand"
                  : "border-border/30 text-muted-foreground hover:text-foreground"
              )}
            >
              {d === 365 ? "1y" : `${d}d`}
            </button>
          ))}
        </div>
        <select
          aria-label="Product"
          className={cn(selectCls, "w-auto min-w-0 max-w-[14rem] py-1 text-xs")}
          value={productId ?? ""}
          onChange={(e) =>
            setProductId(e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">All products</option>
          {(products.data || []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <Section>
        {sales.isLoading ? (
          <Skeleton className="h-48" />
        ) : sales.isError ? (
          <ErrorNote error={sales.error} />
        ) : (
          <SalesChart points={points} currency={currency} />
        )}
      </Section>

      <Section title="Orders" className="mt-4">
        {sales.isLoading ? (
          <Skeleton className="h-32" />
        ) : !sales.data?.rows?.length ? (
          <p className="font-body text-sm text-muted-foreground">
            No sales in this range.
          </p>
        ) : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border/30 font-body text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-normal">Date</th>
                  <th className="px-3 py-2 font-normal">Order</th>
                  <th className="px-3 py-2 font-normal">Product</th>
                  <th className="px-3 py-2 text-right font-normal">Units</th>
                  <th className="px-3 py-2 text-right font-normal">Gross</th>
                  <th className="px-3 py-2 text-right font-normal">You earn</th>
                  <th className="px-3 py-2 font-normal">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {sales.data.rows.map((r, i) => (
                  <tr key={`${r.order_masked}-${r.product_id}-${i}`}>
                    <td
                      className={`${numCls} px-3 py-1.5 text-xs text-muted-foreground`}
                    >
                      {formatDate(r.created_at)}
                    </td>
                    <td
                      className={`${numCls} px-3 py-1.5 text-xs text-foreground`}
                    >
                      {r.order_masked}
                    </td>
                    <td className="max-w-[12rem] truncate px-3 py-1.5 font-body text-sm text-foreground">
                      {names.get(r.product_id) || `#${r.product_id}`}
                    </td>
                    <td className={`${numCls} px-3 py-1.5 text-right text-sm`}>
                      {r.units}
                    </td>
                    <td
                      className={`${numCls} px-3 py-1.5 text-right text-sm text-muted-foreground`}
                    >
                      {formatMoney(r.gross, currency)}
                    </td>
                    <td
                      className={`${numCls} px-3 py-1.5 text-right text-sm text-foreground`}
                    >
                      {formatMoney(r.earned, currency)}
                    </td>
                    <td className="px-3 py-1.5">
                      <Chip tone={EARNING_TONE[r.state] || "muted"}>
                        {r.state}
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 font-body text-xs text-muted-foreground">
          Earnings stay pending for a hold period after an order completes, then
          become payable. Refunded or cancelled orders show as void.
        </p>
      </Section>
    </>
  );
};
