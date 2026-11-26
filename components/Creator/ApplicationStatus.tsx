import React from "react";
import Link from "next/link";
import { useWithdrawCreatorApplication } from "@hooks/useCreator";
import type { CreatorApplication } from "../../lib/creator/types";
import { Button } from "@components/ui";
import { kindLabel } from "../../lib/digitalKinds";
import { Chip, ErrorNote, formatDate, Section } from "../CreatorPortal/kit";

export const ApplicationStatus: React.FC<{
  application: CreatorApplication;
  onApplyAgain?: () => void;
}> = ({ application: app, onApplyAgain }) => {
  const withdraw = useWithdrawCreatorApplication();

  if (app.status === "pending") {
    return (
      <Section
        title="Application in review"
        aside={<Chip tone="warning">Pending</Chip>}
      >
        <p className="font-body text-sm text-muted-foreground">
          Sent {formatDate(app.created_at)} as{" "}
          <span className="text-foreground">{app.display_name}</span> for{" "}
          {app.kinds.map((k) => kindLabel(k, true).toLowerCase()).join(", ")}.
          We review applications by hand and email you when there&apos;s a
          decision.
        </p>
        <ErrorNote error={withdraw.error} />
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            className="text-destructive"
            disabled={withdraw.isLoading}
            onClick={() => {
              if (window.confirm("Withdraw your creator application?"))
                withdraw.mutate();
            }}
          >
            {withdraw.isLoading ? "Withdrawing…" : "Withdraw application"}
          </Button>
        </div>
      </Section>
    );
  }

  if (app.status === "rejected") {
    return (
      <Section
        title="Application not approved"
        aside={<Chip tone="danger">Not approved</Chip>}
      >
        <p className="font-body text-sm text-muted-foreground">
          Reviewed {formatDate(app.reviewed_at)}.
        </p>
        {app.review_note && (
          <blockquote className="mt-3 border-l-2 border-destructive/50 pl-3 font-body text-sm text-foreground">
            {app.review_note}
          </blockquote>
        )}
        {onApplyAgain && (
          <Button type="button" className="mt-4" onClick={onApplyAgain}>
            Apply again
          </Button>
        )}
      </Section>
    );
  }

  return <CreatorApproved />;
};

export const CreatorApproved: React.FC = () => (
  <Section
    title="You're a creator"
    aside={<Chip tone="success">Approved</Chip>}
  >
    <p className="font-body text-sm text-muted-foreground">
      Upload products, follow their review and see your sales in the creator
      portal.
    </p>
    <Button asChild className="mt-4">
      <Link href="/creator" className="no-underline">
        Open creator portal
      </Link>
    </Button>
  </Section>
);
