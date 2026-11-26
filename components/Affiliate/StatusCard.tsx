import { Button } from "@components/ui";
import React from "react";
import { Clock, Ban, CircleSlash } from "lucide-react";
import { CONTACT_EMAIL } from "@lib/affiliate/terms";
import type { Affiliate } from "@lib/affiliate/types";
import { PayoutEmail } from "./PayoutEmail";
import { Panel, num } from "./ui";

const COPY = {
  pending: {
    icon: Clock,
    tone: "text-amber-700",
    title: "Application received",
    body: "We review every application by hand. This page turns into your dashboard once you're approved."
  },
  rejected: {
    icon: CircleSlash,
    tone: "text-muted-foreground",
    title: "Application not approved",
    body: "We can't add you to the program right now. If something has changed, apply again or write to us."
  },
  suspended: {
    icon: Ban,
    tone: "text-destructive",
    title: "Affiliate account suspended",
    body: "Your link still works for shoppers, but orders through it don't earn commission. Write to us if you think this is a mistake."
  }
} as const;

export const StatusCard: React.FC<{
  affiliate: Affiliate & { status: keyof typeof COPY };
  /** Rejected applicants may apply again (POST /affiliate). */
  onApplyAgain?: () => void;
}> = ({ affiliate, onApplyAgain }) => {
  const c = COPY[affiliate.status];
  const Icon = c.icon;
  const channels = affiliate.application?.channels?.filter(Boolean) || [];

  return (
    <Panel>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${c.tone}`} aria-hidden />
        <div className="min-w-0">
          <h2 className="m-0 mb-2 font-title font-semibold text-[13px] leading-5 tracking-[0.03em] text-foreground">
            {c.title}
          </h2>
          <p className="m-0 max-w-prose font-body text-sm leading-6 text-muted-foreground">
            {c.body}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-border/30 pt-4 text-sm xs:grid-cols-2">
        <div className="min-w-0">
          <dt className="font-body text-xs text-foreground/55">Code</dt>
          <dd className={`m-0 mt-0.5 truncate text-foreground ${num}`}>
            {affiliate.code || "—"}
          </dd>
        </div>
        {channels.length > 0 && (
          <div className="min-w-0">
            <dt className="font-body text-xs text-foreground/55">Channels</dt>
            <dd className="m-0 mt-0.5 font-body text-foreground">
              {channels.join(", ")}
            </dd>
          </div>
        )}
      </dl>

      {affiliate.status === "pending" && (
        <PayoutEmail
          email={affiliate.payout_email}
          className="mt-4 border-t border-border/30 pt-4"
        />
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        {affiliate.status === "rejected" && onApplyAgain && (
          <Button type="button" onClick={onApplyAgain}>
            Apply again
          </Button>
        )}
        {affiliate.status !== "pending" && CONTACT_EMAIL && (
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
              `Affiliate account: ${affiliate.code}`
            )}`}
            className="inline-block font-body text-sm text-brand underline underline-offset-4"
          >
            Email {CONTACT_EMAIL}
          </a>
        )}
      </div>
    </Panel>
  );
};

export default StatusCard;
