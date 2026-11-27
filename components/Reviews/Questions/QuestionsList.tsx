import React, { useMemo } from "react";
import { BadgeCheck, MessageCircleQuestion } from "lucide-react";
import type { UseInfiniteQueryResult } from "react-query";
import { cn } from "@lib/utils";
import { formatReviewDate, pluralize, questionAnchorId } from "@lib/reviews";
import type {
  ProductAnswer,
  ProductQuestion,
  ProductQuestionsResponse
} from "../../../types/reviews";
import {
  CardSkeleton,
  EmptyBox,
  ErrorState,
  ShowMoreButton
} from "../ReviewStates";

const badgeClass =
  "inline-flex w-max items-center gap-1 rounded border px-1.5 py-px font-title text-[10.5px] uppercase tracking-widest";

const Answer = ({ answer }: { answer: ProductAnswer }) => {
  const date = formatReviewDate(answer.answered_at);
  return (
    <li
      className={cn(
        "grid gap-1.5 border-l-2 py-1 pl-3.5",
        answer.official ? "border-brand" : "border-border"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {answer.official && (
          <span className={cn(badgeClass, "border-brand text-brand-dark")}>
            Official answer
          </span>
        )}
        {answer.verified_buyer && (
          <span className="inline-flex w-max items-center gap-1 font-body text-xs text-green">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Verified buyer
          </span>
        )}
      </div>
      <p className="m-0 whitespace-pre-line break-words font-body text-sm leading-relaxed text-foreground/80">
        {answer.body}
      </p>
      <p className="m-0 font-body text-xs text-muted-foreground">
        {answer.display_name}
        {date && (
          <>
            {" · "}
            <time dateTime={answer.answered_at}>{date}</time>
          </>
        )}
      </p>
    </li>
  );
};

const QuestionItem = ({ question }: { question: ProductQuestion }) => {
  const date = formatReviewDate(question.asked_at);
  const headingId = `${questionAnchorId(question.id)}-text`;
  return (
    <li
      id={questionAnchorId(question.id)}
      tabIndex={-1}
      aria-labelledby={headingId}
      className="grid scroll-mt-24 gap-3 border-t border-border/60 py-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <div className="grid gap-1">
        <h3
          id={headingId}
          className="m-0 break-words font-body-bold text-base text-foreground"
        >
          <span className="sr-only">Question: </span>
          {question.body}
        </h3>
        <p className="m-0 font-body text-xs text-muted-foreground">
          Asked by {question.display_name}
          {date && (
            <>
              {" · "}
              <time dateTime={question.asked_at}>{date}</time>
            </>
          )}
        </p>
      </div>
      <ul
        className="m-0 grid list-none gap-3 p-0"
        aria-label={pluralize(question.answers.length, "answer")}
      >
        {question.answers.map((answer) => (
          <Answer key={answer.id} answer={answer} />
        ))}
      </ul>
    </li>
  );
};

interface QuestionsListProps {
  query: UseInfiniteQueryResult<ProductQuestionsResponse, unknown>;
}

/**
 * Answered questions, newest answer first, each at `#question-<id>` (the
 * answer email links there). Official answers carry an "Official answer"
 * badge, buyers' answers "Verified buyer".
 */
export const QuestionsList = ({ query }: QuestionsListProps) => {
  const questions = useMemo(
    () => (query.data?.pages || []).flatMap((page) => page.data || []),
    [query.data]
  );

  if (query.isError && !query.data) {
    return (
      <ErrorState
        message="We couldn't load the questions right now."
        onRetry={() => query.refetch()}
      />
    );
  }
  if (!query.data) {
    return (
      <div>
        {[0, 1].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (!questions.length) {
    return (
      <EmptyBox>
        <MessageCircleQuestion
          className="h-7 w-7 text-brand"
          aria-hidden="true"
        />
        <p className="m-0">No answered questions yet.</p>
      </EmptyBox>
    );
  }
  return (
    <div className="grid gap-6">
      <ul className="m-0 grid list-none p-0" aria-label="Questions and answers">
        {questions.map((question) => (
          <QuestionItem key={question.id} question={question} />
        ))}
      </ul>
      {query.hasNextPage && (
        <ShowMoreButton
          onClick={() => query.fetchNextPage()}
          loading={query.isFetchingNextPage}
        >
          Show more questions
        </ShowMoreButton>
      )}
    </div>
  );
};

export default QuestionsList;
