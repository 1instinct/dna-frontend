import React, { useCallback, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@config/auth";
import {
  isInvalidReviewLink,
  isReviewsDisabledError,
  reviewErrorMessage,
  REVIEWS_ENABLED
} from "@lib/reviews";
import { useReviewRequest } from "@hooks/useReviews";
import { EmailLinkIntent, isOptOutLink, parseEmailLinkIntent } from "./flow";
import { OptOutCard } from "./OptOutCard";
import { RequestSkeleton, StatusCard } from "./RequestStatus";
import { ReviewRequestFlow } from "./ReviewRequestFlow";

/** Dead link: expired, replaced by a newer email, opted out or cancelled. */
const LinkExpired = () => {
  const { user } = useAuth();
  return (
    <StatusCard
      eyebrowText="Review your order"
      title="This review link has expired"
      actions={[
        { label: "Keep shopping", href: "/browse" },
        {
          label: user ? "Go to your reviews" : "Sign in to review",
          href: "/account/reviews",
          primary: true
        }
      ]}
    >
      <p>
        Links in our review emails stop working after a while, or once a newer
        email replaces them.
      </p>
      <p>
        If you have an account, you can still review anything you bought from
        your account.
      </p>
    </StatusCard>
  );
};

/**
 * `/review/[token]`: the page the "How's your order?" email links to.
 * No login: the token is the proof of purchase. Handles the opt-out link,
 * dead links, reviews being switched off and load errors, then hands over to
 * `ReviewRequestFlow`.
 */
export const ReviewRequestPage = () => {
  const router = useRouter();
  const token =
    typeof router.query.token === "string" ? router.query.token : undefined;
  const optOut = router.isReady && isOptOutLink(router.query);
  const [linkDead, setLinkDead] = useState(false);

  // Read the email's star once, before the URL is cleaned up.
  const intentRef = useRef<EmailLinkIntent | null>(null);
  if (router.isReady && !intentRef.current) {
    intentRef.current = parseEmailLinkIntent(router.query);
  }

  const request = useReviewRequest(token, {
    enabled: REVIEWS_ENABLED && router.isReady && !optOut && !linkDead
  });

  const cleanUrl = useCallback(() => {
    if (!token) return;
    router.replace(
      { pathname: router.pathname, query: { token } },
      `/review/${encodeURIComponent(token)}`,
      { shallow: true, scroll: false }
    );
  }, [router, token]);

  const dropIntentParams = useCallback(() => {
    const { item, rating } = router.query;
    if (item !== undefined || rating !== undefined) cleanUrl();
  }, [router.query, cleanUrl]);

  if (!REVIEWS_ENABLED) {
    return (
      <StatusCard
        title="Reviews aren't open yet"
        actions={[{ label: "Keep shopping", href: "/browse", primary: true }]}
      >
        <p>We&apos;re getting reviews ready. Please check back soon.</p>
      </StatusCard>
    );
  }

  if (!router.isReady || !token) return <RequestSkeleton />;

  if (optOut) return <OptOutCard token={token} onKeep={cleanUrl} />;

  if (linkDead) return <LinkExpired />;

  // Keep showing the page if a background refetch fails.
  if (request.data) {
    return (
      <ReviewRequestFlow
        token={token}
        request={request.data}
        intent={intentRef.current || { lineItemId: null, rating: null }}
        onIntentConsumed={dropIntentParams}
        onLinkDead={() => setLinkDead(true)}
      />
    );
  }

  if (request.isError) {
    const { error } = request;
    if (isInvalidReviewLink(error)) return <LinkExpired />;
    if (isReviewsDisabledError(error)) {
      return (
        <StatusCard
          role="status"
          title="Reviews are paused"
          actions={[{ label: "Keep shopping", href: "/browse", primary: true }]}
        >
          <p>
            We&apos;re not taking reviews right now. Please try this link again
            later.
          </p>
        </StatusCard>
      );
    }
    return (
      <StatusCard
        role="alert"
        title="We couldn't load your order"
        actions={[
          {
            label: request.isFetching ? "Trying…" : "Try again",
            primary: true,
            disabled: request.isFetching,
            onClick: () => request.refetch()
          }
        ]}
      >
        <p>{reviewErrorMessage(error, "load")}</p>
      </StatusCard>
    );
  }

  return <RequestSkeleton />;
};

export default ReviewRequestPage;
