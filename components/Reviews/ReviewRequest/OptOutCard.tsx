import React from "react";
import { isDnaApiError } from "@lib/api/dnaFetch";
import { reviewErrorMessage } from "@lib/reviews";
import { useOptOutReviewRequest } from "@hooks/useReviews";
import { StatusCard } from "./RequestStatus";

interface OptOutCardProps {
  token: string;
  /** "Keep them": go on to the review page instead. */
  onKeep: () => void;
}

/**
 * The email's "Don't ask me for reviews" link (`?opt_out=1`). Opting out
 * needs a click on Confirm: mail scanners open every link in an email, so a
 * page load alone must never unsubscribe anyone.
 */
export const OptOutCard = ({ token, onKeep }: OptOutCardProps) => {
  const optOut = useOptOutReviewRequest(token);

  if (optOut.isSuccess) {
    return (
      <StatusCard
        role="status"
        eyebrowText="Review emails"
        title="You're unsubscribed"
        focusHeading
        actions={[{ label: "Keep shopping", href: "/browse", primary: true }]}
      >
        <p>You won&apos;t get review emails from us anymore.</p>
        <p>This only affects review requests.</p>
      </StatusCard>
    );
  }

  const error = optOut.error;
  const unknownLink = isDnaApiError(error) && error.status === 404;
  const sending = optOut.isLoading;

  return (
    <StatusCard
      eyebrowText="Review emails"
      title="Stop review emails to this address?"
      actions={[
        {
          label: "Keep them",
          onClick: onKeep,
          disabled: sending
        },
        {
          label: sending ? "Saving…" : "Confirm",
          primary: true,
          disabled: sending,
          onClick: () => {
            if (!optOut.isLoading) optOut.mutate();
          }
        }
      ]}
    >
      <p>
        We&apos;ll stop asking you to review your orders. Order and shipping
        emails aren&apos;t affected.
      </p>
      <div aria-live="assertive">
        {error ? (
          <p role="alert" className="text-red">
            {unknownLink
              ? "We couldn't find this link. Please open it again from the email."
              : reviewErrorMessage(error, "load")}
          </p>
        ) : null}
      </div>
    </StatusCard>
  );
};

export default OptOutCard;
