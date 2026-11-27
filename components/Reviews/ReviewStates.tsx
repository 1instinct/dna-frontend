import React from "react";
import { Button, Skeleton } from "@components/ui";

/** Shared loading / error / empty states for review and question lists. */

export const CardSkeleton = () => (
  <div
    className="grid gap-3 border-t border-border/60 py-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6"
    aria-hidden="true"
  >
    <div className="grid content-start gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-20" />
    </div>
    <div className="grid gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  </div>
);

export const ErrorState = ({
  message,
  onRetry
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div
    role="alert"
    className="grid justify-items-center gap-3 rounded-xl border border-dashed border-border p-7 text-center font-body text-sm text-muted-foreground"
  >
    <p className="m-0">{message}</p>
    <Button variant="outline" size="sm" onClick={onRetry}>
      Try again
    </Button>
  </div>
);

export const EmptyBox = ({ children }: { children: React.ReactNode }) => (
  <div className="grid justify-items-center gap-3 rounded-xl border border-dashed border-border p-7 text-center font-body text-sm text-muted-foreground">
    {children}
  </div>
);

/** "Show more …" under a list. */
export const ShowMoreButton = ({
  onClick,
  loading,
  children
}: {
  onClick: () => void;
  loading: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex justify-center">
    <Button
      variant="outline"
      onClick={onClick}
      disabled={loading}
      className="min-h-[44px] rounded-full px-6 font-title text-xs uppercase tracking-[0.12em]"
    >
      {loading ? "Loading…" : children}
    </Button>
  </div>
);
