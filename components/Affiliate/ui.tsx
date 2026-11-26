import React from "react";
import { cn } from "@lib/utils";
import type { CommissionState } from "@lib/affiliate/types";

/** A card panel with a title. */
export const Panel: React.FC<{
  title?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  id?: string;
}> = ({ title, aside, className, children, id }) => (
  <section
    className={cn(
      "rounded-xl border border-border/30 bg-card min-w-0 p-4 sm:p-5",
      className
    )}
    aria-labelledby={id && title ? `${id}-title` : undefined}
  >
    {(title || aside) && (
      <header className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {title && (
          <h2
            id={id ? `${id}-title` : undefined}
            className="m-0 font-title font-semibold text-[13px] leading-5 tracking-[0.03em] text-foreground"
          >
            {title}
          </h2>
        )}
        {aside}
      </header>
    )}
    {children}
  </section>
);

/** Numbers: tabular figures. */
export const num = "font-body tabular-nums";

export const labelClass =
  "mb-1.5 block font-body text-[13px] leading-4 text-muted-foreground";

export const fieldClass =
  "block w-full rounded-md border border-border/30 bg-muted/50 px-3 py-2.5 font-body text-[16px] leading-5 text-foreground placeholder:text-foreground/45 transition-colors aria-[invalid=true]:border-destructive focus:border-brand focus:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-50";

export const hintClass =
  "mt-1.5 font-body text-xs leading-4 text-muted-foreground";

export const STATE_STYLE: Record<
  CommissionState,
  { label: string; dot: string; text: string }
> = {
  pending: { label: "Pending", dot: "bg-amber-500", text: "text-amber-700" },
  approved: { label: "Approved", dot: "bg-brand", text: "text-brand" },
  paid: { label: "Paid", dot: "bg-emerald-500", text: "text-emerald-600" },
  void: {
    label: "Void",
    dot: "bg-muted-foreground/40",
    text: "text-foreground/55"
  }
};

export const StateChip: React.FC<{ state: CommissionState }> = ({ state }) => {
  const s = STATE_STYLE[state] || STATE_STYLE.void;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border/30 bg-muted/50 px-2 py-0.5 font-body text-xs leading-4",
        s.text
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden />
      {s.label}
    </span>
  );
};

/** Small secondary button. */
export const ghostBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-border/30 bg-muted/50 px-3 py-2 font-body text-[13px] leading-4 text-foreground transition-colors hover:border-brand/60 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:pointer-events-none disabled:opacity-40";

export const formatDate = (iso?: string | null) => {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};
