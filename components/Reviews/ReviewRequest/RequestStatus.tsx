import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Button, Skeleton } from "@components/ui";
import { cn } from "@lib/utils";

/** Pill buttons shared with the composer's footer (44px tall, mono caps). */
export const pillButton =
  "min-h-[44px] rounded-full px-5 font-title text-xs uppercase tracking-[0.12em]";
// Dark text on the brand pink keeps contrast above 4.5:1.
export const primaryPill = cn(pillButton, "text-black");
export const secondaryPill = cn(
  pillButton,
  "border-foreground/30 text-foreground"
);

export const eyebrow =
  "m-0 font-title text-[11px] leading-4 uppercase tracking-[0.2em] text-muted-foreground";

/** Centered page column for every state of the email review page. */
export const RequestColumn = ({
  children,
  wide = false,
  className
}: {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}) => (
  <div
    className={cn(
      "mx-auto w-full px-4 pb-16 pt-6 sm:px-6 sm:pt-10",
      wide ? "max-w-5xl" : "max-w-xl",
      className
    )}
  >
    {children}
  </div>
);

export interface StatusAction {
  label: string;
  href?: string;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
}

interface StatusCardProps {
  eyebrowText?: string;
  title: string;
  children?: React.ReactNode;
  actions?: StatusAction[];
  /** Move focus to the heading on mount (after an in-page change). */
  focusHeading?: boolean;
  /** `alert` for errors, so screen readers announce them. */
  role?: "alert" | "status";
}

/**
 * One card for the page's non-composer states: link expired, reviews off,
 * load error, opt-out. Actions are full-width on phones (thumb reach) and
 * sit side by side from `sm` up.
 */
export const StatusCard = ({
  eyebrowText,
  title,
  children,
  actions = [],
  focusHeading = false,
  role
}: StatusCardProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusHeading) headingRef.current?.focus();
  }, [focusHeading, title]);

  return (
    <RequestColumn>
      <section
        role={role}
        className="grid gap-5 rounded-2xl border border-border bg-background px-5 py-8 text-center shadow-sm sm:px-8"
      >
        <div className="grid gap-2">
          {eyebrowText && <p className={eyebrow}>{eyebrowText}</p>}
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="m-0 font-title text-xl uppercase tracking-[0.08em] text-foreground focus:outline-none"
          >
            {title}
          </h1>
        </div>
        {children && (
          <div className="mx-auto grid max-w-sm gap-3 font-body text-sm text-muted-foreground [&_p]:m-0">
            {children}
          </div>
        )}
        {actions.length > 0 && (
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-center">
            {actions.map((action) =>
              action.href ? (
                <Button
                  key={action.label}
                  asChild
                  variant={action.primary ? "default" : "outline"}
                  className={action.primary ? primaryPill : secondaryPill}
                >
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ) : (
                <Button
                  key={action.label}
                  type="button"
                  variant={action.primary ? "default" : "outline"}
                  className={action.primary ? primaryPill : secondaryPill}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              )
            )}
          </div>
        )}
      </section>
    </RequestColumn>
  );
};

/** Placeholder while the review request loads. */
export const RequestSkeleton = () => (
  <RequestColumn>
    <div className="grid gap-6" aria-busy="true">
      <span className="sr-only" role="status">
        Loading your order…
      </span>
      <div className="grid gap-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="grid gap-5 rounded-2xl border border-border p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-[54px] w-11 rounded-md" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="mx-auto h-6 w-48" />
        <Skeleton className="mx-auto h-12 w-64" />
        <div className="flex gap-2.5">
          <Skeleton className="h-11 flex-1 rounded-full" />
          <Skeleton className="h-11 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  </RequestColumn>
);
