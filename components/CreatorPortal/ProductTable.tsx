import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@components/ui";
import { cn } from "@lib/utils";
import { Skeleton } from "@components/ui";
import { useCreatorProducts } from "@hooks/useCreator";
import type { ReviewState } from "../../lib/creator/types";
import { kindLabel } from "../../lib/digitalKinds";
import {
  ErrorNote,
  formatDate,
  formatMoney,
  numCls,
  PageTitle,
  REVIEW,
  ReviewChip
} from "./kit";

const FILTERS: { id: "all" | ReviewState; label: string }[] = [
  { id: "all", label: "All" },
  { id: "approved", label: REVIEW.approved.label },
  { id: "submitted", label: REVIEW.submitted.label },
  { id: "changes_requested", label: "Changes" },
  { id: "draft", label: REVIEW.draft.label },
  { id: "rejected", label: REVIEW.rejected.label }
];

export const ProductTable: React.FC = () => {
  const { data, isLoading, isError, error } = useCreatorProducts();
  const [filter, setFilter] = useState<"all" | ReviewState>("all");
  const rows = useMemo(
    () =>
      (data || [])
        .filter((p) => filter === "all" || p.review_state === filter)
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    [data, filter]
  );

  return (
    <>
      <PageTitle
        actions={
          <Button asChild>
            <Link href="/creator/products/new" className="no-underline">
              <Plus aria-hidden /> New product
            </Link>
          </Button>
        }
      >
        Products
      </PageTitle>

      <div
        className="mb-3 flex gap-1 overflow-x-auto "
        role="group"
        aria-label="Filter by review state"
      >
        {FILTERS.map((f) => {
          const n =
            f.id === "all"
              ? data?.length
              : data?.filter((p) => p.review_state === f.id).length;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "whitespace-nowrap rounded-md border px-2.5 py-1 font-body text-xs transition-colors",
                filter === f.id
                  ? "border-brand/50 bg-brand/10 text-brand"
                  : "border-border/30 text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
              {n !== undefined && (
                <span className={`${numCls} ml-1.5 text-muted-foreground`}>
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : isError ? (
        <ErrorNote error={error} />
      ) : !data?.length ? (
        <div className="rounded-xl border border-border/30 bg-card px-5 py-10 text-center">
          <p className="font-body text-sm text-muted-foreground">
            You haven&apos;t made a product yet.
          </p>
          <Button asChild className="mt-4">
            <Link href="/creator/products/new" className="no-underline">
              Make your first product
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border/30 bg-card overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead className="hidden border-b border-border/30 sm:table-header-group">
              <tr className="font-body text-xs text-muted-foreground">
                <th className="px-3 py-2 font-normal">Product</th>
                <th className="px-3 py-2 font-normal">State</th>
                <th className="px-3 py-2 text-right font-normal">Price</th>
                <th className="px-3 py-2 text-right font-normal">Version</th>
                <th className="px-3 py-2 text-right font-normal">Sales</th>
                <th className="px-3 py-2 text-right font-normal">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {rows.map((p) => (
                <tr
                  key={p.id}
                  className="grid grid-cols-[1fr_auto] gap-x-3 px-3 py-2 hover:bg-muted/50 sm:table-row sm:p-0"
                >
                  <td className="min-w-0 sm:px-3 sm:py-2">
                    <Link
                      href={`/creator/products/${p.id}`}
                      className="block truncate font-body text-sm text-foreground no-underline hover:text-brand"
                    >
                      {p.name || "Untitled"}
                    </Link>
                    <span className="font-body text-xs text-muted-foreground">
                      {p.kind ? kindLabel(p.kind) : ""}
                    </span>
                  </td>
                  <td className="text-right sm:px-3 sm:py-2 sm:text-left">
                    <ReviewChip state={p.review_state} />
                  </td>
                  <td
                    className={`${numCls} text-xs text-muted-foreground sm:px-3 sm:py-2 sm:text-right sm:text-sm`}
                  >
                    {Number(p.price) === 0
                      ? "Free"
                      : formatMoney(p.price, p.currency)}
                  </td>
                  <td
                    className={`${numCls} hidden text-right text-sm text-muted-foreground sm:table-cell sm:px-3 sm:py-2`}
                  >
                    {p.live_asset_version ? `v${p.live_asset_version}` : "—"}
                    {p.asset &&
                      p.asset.status === "draft" &&
                      p.live_asset_version && (
                        <span className="ml-1 text-amber-700">
                          +v{p.asset.version}
                        </span>
                      )}
                  </td>
                  <td
                    className={`${numCls} text-right text-xs text-muted-foreground sm:px-3 sm:py-2 sm:text-sm`}
                  >
                    {p.sales_count}
                    <span className="font-body text-muted-foreground sm:hidden">
                      {" "}
                      sold
                    </span>
                  </td>
                  <td
                    className={`${numCls} hidden text-right text-sm text-muted-foreground sm:table-cell sm:px-3 sm:py-2`}
                  >
                    {formatDate(p.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="px-3 py-6 text-center font-body text-sm text-muted-foreground">
              No products in this state.
            </p>
          )}
        </div>
      )}
    </>
  );
};
