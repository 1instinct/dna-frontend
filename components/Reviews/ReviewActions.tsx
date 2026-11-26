import React, { useId, useState } from "react";
import { useRouter } from "next/router";
import { Flag } from "lucide-react";
import { toast } from "@components/ui";
import { cn } from "@lib/utils";
import { reviewErrorMessage } from "@lib/reviews";
import {
  useReviewUserId,
  useReviewVotes,
  useVoteReview
} from "@hooks/useReviews";
import type { Review } from "../../types/reviews";
import { ReportReviewDialog } from "./ReportReviewDialog";

interface ReviewActionsProps {
  review: Review;
  /** The viewer's own review: no voting or reporting. */
  isOwn?: boolean;
}

/** Pill with a 44px hit area (the pill itself stays compact). */
const actionClass = (pressed?: boolean) =>
  cn(
    "relative inline-flex h-8 items-center gap-1 rounded-full border px-3 font-body text-xs tabular-nums transition-colors",
    "before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    pressed
      ? "border-brand bg-brand/15 text-brand-dark"
      : "border-border text-muted-foreground hover:border-foreground/60 hover:text-foreground"
  );

/**
 * "Helpful? Yes · N / No" (optimistic, one vote per visitor) and "Report".
 * Anonymous votes are allowed; reporting needs an account, so signed-out
 * shoppers go to login first (like the favorite button).
 */
export const ReviewActions = ({
  review,
  isOwn = false
}: ReviewActionsProps) => {
  const labelId = useId();
  const router = useRouter();
  const userId = useReviewUserId();
  const votes = useReviewVotes();
  const vote = useVoteReview();
  const [reportOpen, setReportOpen] = useState(false);
  const [reported, setReported] = useState(false);

  if (isOwn) return null;

  const myVote = votes.data?.[String(review.id)];

  const castVote = (helpful: boolean) => {
    if (myVote === helpful || vote.isLoading) return;
    vote.mutate(
      { reviewId: review.id, helpful },
      {
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Your vote didn't go through",
            description: reviewErrorMessage(error, "vote")
          });
        }
      }
    );
  };

  const openReport = () => {
    if (!userId) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
    setReportOpen(true);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 pt-1">
      <div
        role="group"
        aria-labelledby={labelId}
        className="flex items-center gap-1.5"
      >
        <span
          id={labelId}
          className="pr-0.5 font-body text-xs text-muted-foreground"
        >
          Helpful?
        </span>
        <button
          type="button"
          aria-pressed={myVote === true}
          onClick={() => castVote(true)}
          className={actionClass(myVote === true)}
        >
          Yes · {review.helpful_count}
        </button>
        <button
          type="button"
          aria-pressed={myVote === false}
          onClick={() => castVote(false)}
          className={actionClass(myVote === false)}
        >
          No
        </button>
      </div>
      <button
        type="button"
        onClick={openReport}
        disabled={reported}
        aria-haspopup={userId ? "dialog" : undefined}
        className={cn(
          actionClass(),
          "border-transparent disabled:cursor-default disabled:opacity-70"
        )}
      >
        <Flag className="h-3.5 w-3.5" aria-hidden="true" />
        {reported ? "Reported" : "Report"}
      </button>
      {userId && (
        <ReportReviewDialog
          reviewId={review.id}
          open={reportOpen}
          onOpenChange={setReportOpen}
          onReported={() => {
            setReported(true);
            toast({
              title: "Thanks for letting us know",
              description: "Our team will take a look at this review."
            });
          }}
        />
      )}
    </div>
  );
};

export default ReviewActions;
