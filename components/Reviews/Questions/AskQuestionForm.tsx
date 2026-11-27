import React, { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button, Label, Textarea } from "@components/ui";
import { cn } from "@lib/utils";
import {
  QUESTION_MAX_LENGTH,
  QUESTION_MIN_LENGTH,
  reviewErrorMessage,
  reviewFieldErrors
} from "@lib/reviews";
import { useReviewUserId } from "@hooks/useReviews";
import { useAskQuestion } from "@hooks/useQuestions";

const DEFAULT_THANKS = "Thanks! We'll email you when it's answered.";

const pillButton =
  "min-h-[44px] rounded-full px-5 font-title text-xs uppercase tracking-[0.12em]";

interface AskQuestionFormProps {
  productId: string | number;
  productName?: string;
  className?: string;
}

/**
 * "Ask a question" on the PDP's Questions tab. Signed-in only; signed-out
 * shoppers get a "Sign in to ask" link that comes back to the tab. The
 * question stays private until staff answer it, and the asker gets an email.
 */
export const AskQuestionForm = ({
  productId,
  productName,
  className
}: AskQuestionFormProps) => {
  const uid = useId();
  const router = useRouter();
  const userId = useReviewUserId();
  const ask = useAskQuestion(productId);
  const [body, setBody] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [thanks, setThanks] = useState<string | null>(null);

  const headingId = `${uid}-heading`;
  const fieldId = `${uid}-body`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;
  const counterId = `${uid}-counter`;

  const wrapper = cn(
    "grid content-start gap-3 rounded-2xl border border-border/60 bg-card p-5",
    className
  );
  const heading = (
    <h3
      id={headingId}
      className="m-0 font-title text-xs uppercase tracking-[0.16em] text-foreground"
    >
      Ask a question
    </h3>
  );

  if (!userId) {
    const returnTo = `${(router.asPath || "/").split("#")[0]}#questions`;
    return (
      <section aria-labelledby={headingId} className={wrapper}>
        {heading}
        <p className="m-0 font-body text-sm text-muted-foreground">
          Wondering about {productName || "this item"}? Our team answers
          questions here.
        </p>
        <Button
          asChild
          variant="outline"
          className={cn(pillButton, "justify-self-start border-foreground/30")}
        >
          <Link href={`/login?redirect=${encodeURIComponent(returnTo)}`}>
            Sign in to ask
          </Link>
        </Button>
      </section>
    );
  }

  if (thanks) {
    return (
      <section aria-labelledby={headingId} className={wrapper}>
        {heading}
        <p
          role="status"
          className="m-0 flex items-start gap-2 font-body text-sm text-foreground"
        >
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0 text-green"
            aria-hidden="true"
          />
          {thanks}
        </p>
        <Button
          type="button"
          variant="ghost"
          className={cn(pillButton, "justify-self-start px-0")}
          onClick={() => setThanks(null)}
        >
          Ask another question
        </Button>
      </section>
    );
  }

  const length = body.trim().length;
  const tooShort = length < QUESTION_MIN_LENGTH;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (tooShort) {
      setFieldError(`Please write at least ${QUESTION_MIN_LENGTH} characters.`);
      document.getElementById(fieldId)?.focus();
      return;
    }
    setFieldError(null);
    try {
      const response = await ask.mutateAsync({ body });
      setBody("");
      setThanks(response?.message || DEFAULT_THANKS);
    } catch (error) {
      const fields = reviewFieldErrors(error);
      if (fields.body) {
        setFieldError(fields.body);
        document.getElementById(fieldId)?.focus();
      } else {
        setFormError(reviewErrorMessage(error, "ask"));
      }
    }
  };

  return (
    <section aria-labelledby={headingId} className={wrapper}>
      {heading}
      <form noValidate onSubmit={submit} className="grid gap-3">
        <div className="grid gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor={fieldId} className="text-[11px] leading-4">
              Your question
            </Label>
            <span
              id={counterId}
              className={cn(
                "font-body text-xs tabular-nums",
                body.length >= QUESTION_MAX_LENGTH
                  ? "text-red"
                  : "text-muted-foreground"
              )}
            >
              {body.length} / {QUESTION_MAX_LENGTH}
            </span>
          </div>
          <Textarea
            id={fieldId}
            value={body}
            rows={4}
            maxLength={QUESTION_MAX_LENGTH}
            placeholder="e.g. Is the fabric see-through?"
            aria-invalid={!!fieldError || undefined}
            aria-describedby={[hintId, counterId, fieldError ? errorId : ""]
              .filter(Boolean)
              .join(" ")}
            onChange={(event) => {
              setBody(event.target.value);
              if (fieldError) setFieldError(null);
            }}
          />
          <p
            id={hintId}
            className="m-0 font-body text-xs text-muted-foreground"
          >
            {QUESTION_MIN_LENGTH}–{QUESTION_MAX_LENGTH} characters. We&apos;ll
            email you when it&apos;s answered.
          </p>
          {fieldError && (
            <p id={errorId} className="m-0 font-body text-xs text-red">
              {fieldError}
            </p>
          )}
        </div>
        <div aria-live="assertive">
          {formError && (
            <p role="alert" className="m-0 font-body text-sm text-red">
              {formError}
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={ask.isLoading}
          className={cn(pillButton, "justify-self-start text-black")}
        >
          {ask.isLoading ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            "Ask question"
          )}
        </Button>
      </form>
    </section>
  );
};

export default AskQuestionForm;
