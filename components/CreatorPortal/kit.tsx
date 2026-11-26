// Small building blocks for the creator tools (application, portal), on the
// theme tokens so a fork's theme restyles them.

import React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@lib/utils";
import { apiErrorMessage } from "../../lib/api/v1";
import type { ReviewState } from "../../lib/creator/types";

export const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 font-body text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50";

export const labelCls =
  "mb-1 block font-title text-xs font-semibold uppercase tracking-wider text-muted-foreground";

export const numCls = "tabular-nums";

/** Where creators ask for payout details to be set or changed. */
export const supportEmail = (): string | null =>
  (process.env.NEXT_PUBLIC_COMPANY_EMAIL || "").trim() || null;

export const payoutEmailCopy = (): string => {
  const email = supportEmail();
  return email
    ? `To set or change your payout email, contact support at ${email} from your account's email address.`
    : "To set or change your payout email, contact support from your account's email address.";
};

export const Field: React.FC<{
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: string | null;
  className?: string;
  children: React.ReactNode;
}> = ({ label, htmlFor, hint, error, className, children }) => (
  <div className={className}>
    <label htmlFor={htmlFor} className={labelCls}>
      {label}
    </label>
    {children}
    {error ? (
      <p className="mt-1 font-body text-xs text-destructive">{error}</p>
    ) : hint ? (
      <p className="mt-1 font-body text-xs text-muted-foreground">{hint}</p>
    ) : null}
  </div>
);

export const Section: React.FC<{
  title?: string;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ title, aside, className, children }) => (
  <section
    className={cn(
      "rounded-xl border border-border/30 bg-card p-4 sm:p-5",
      className
    )}
  >
    {(title || aside) && (
      <header className="mb-3 flex items-center justify-between gap-3">
        {title && (
          <h2 className="font-title text-sm font-semibold text-foreground">
            {title}
          </h2>
        )}
        {aside}
      </header>
    )}
    {children}
  </section>
);

export const PageTitle: React.FC<{
  children: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ children, sub, actions }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div className="min-w-0">
      <h1 className="font-title text-xl font-bold text-foreground sm:text-2xl">
        {children}
      </h1>
      {sub && (
        <div className="mt-1 font-body text-sm text-muted-foreground">
          {sub}
        </div>
      )}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export type Tone = "info" | "success" | "warning" | "danger" | "muted";

const TONES: Record<Tone, string> = {
  info: "border-brand/40 bg-brand/10 text-brand",
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
  warning: "border-amber-500/50 bg-amber-500/10 text-amber-700",
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground"
};

export const Chip: React.FC<{
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}> = ({ tone = "muted", className, children }) => (
  <span
    className={cn(
      "inline-flex items-center whitespace-nowrap rounded border px-1.5 py-0.5 font-body text-[11px] leading-none",
      TONES[tone],
      className
    )}
  >
    {children}
  </span>
);

export const REVIEW: Record<ReviewState, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "muted" },
  submitted: { label: "In review", tone: "warning" },
  approved: { label: "Live", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  changes_requested: { label: "Changes requested", tone: "info" }
};

export const ReviewChip: React.FC<{ state: ReviewState }> = ({ state }) => (
  <Chip tone={REVIEW[state]?.tone || "muted"}>
    {REVIEW[state]?.label || state}
  </Chip>
);

export const EARNING_TONE: Record<string, Tone> = {
  pending: "warning",
  payable: "info",
  paid: "success",
  void: "muted"
};

export function formatMoney(
  amount: string | number | null | undefined,
  currency = "USD"
): string {
  const n = typeof amount === "number" ? amount : parseFloat(amount || "0");
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD"
    }).format(Number.isFinite(n) ? n : 0);
  } catch {
    return `${(Number.isFinite(n) ? n : 0).toFixed(2)} ${currency}`;
  }
}

export const formatDate = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
};

export const Stat: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: boolean;
}> = ({ label, value, sub, accent }) => (
  <div className="min-w-0 rounded-xl border border-border/30 bg-card px-3 py-2.5">
    <div className="font-body text-xs text-muted-foreground">{label}</div>
    <div
      className={cn(
        numCls,
        "mt-0.5 truncate font-title text-lg font-semibold",
        accent ? "text-brand" : "text-foreground"
      )}
    >
      {value}
    </div>
    {sub && (
      <div className="font-body text-[11px] text-muted-foreground">{sub}</div>
    )}
  </div>
);

export const ErrorNote: React.FC<{ error: unknown; fallback?: string }> = ({
  error,
  fallback
}) =>
  error ? (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 font-body text-sm text-destructive"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{apiErrorMessage(error, fallback)}</span>
    </div>
  ) : null;

/** Tiny line, no axes: a trend at a glance. Uses the current text colour. */
export const Sparkline: React.FC<{
  values: number[];
  className?: string;
  label: string;
}> = ({ values, className, label }) => {
  const w = 160;
  const h = 36;
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const pts = values
    .map(
      (v, i) =>
        `${(i * step).toFixed(1)},${(h - (v / max) * (h - 4) - 2).toFixed(1)}`
    )
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-9 w-full text-brand", className)}
      role="img"
      aria-label={label}
    >
      {values.length > 1 && (
        <>
          <polyline
            points={`0,${h} ${pts} ${w},${h}`}
            fill="currentColor"
            fillOpacity={0.08}
            stroke="none"
          />
          <polyline
            points={pts}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}
    </svg>
  );
};

export const selectCls = cn(inputCls, "cursor-pointer");
