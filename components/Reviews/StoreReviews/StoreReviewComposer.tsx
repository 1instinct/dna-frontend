import React, { useEffect, useId, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button, Rating } from "@components/ui";
import { cn } from "@lib/utils";
import {
  reviewErrorMessage,
  reviewFieldErrors,
  STORE_NAME
} from "@lib/reviews";
import { useSaveStoreReview } from "@hooks/useStoreReviews";
import type {
  OwnStoreReview,
  ReviewFormLimits,
  ReviewQuestion,
  ReviewRequestStoreReview,
  StarRating
} from "../../../types/reviews";
import { clearDraft, loadDraft, saveDraft } from "../ReviewComposer/draft";
import { StepDetails } from "../ReviewComposer/StepDetails";
import { StepRating } from "../ReviewComposer/StepRating";
import type {
  ComposerFieldErrors,
  ComposerText,
  ComposerValues
} from "../ReviewComposer/types";

/** What the store composer needs, from `/store_reviews/form` or a review request. */
export interface StoreReviewComposerForm {
  display_name: string | null;
  questions: ReviewQuestion[];
  /** The full own-review shape, or the `{ id, rating }` a review request sends. */
  existing_review: OwnStoreReview | ReviewRequestStoreReview | null;
  limits?: Partial<Pick<ReviewFormLimits, "title_max" | "body_max">>;
}

export interface StoreReviewComposerProps {
  form: StoreReviewComposerForm;
  /** `sheet` fills a Sheet (scrolling body, pinned footer); `page` flows in the page. */
  mode?: "sheet" | "page";
  /** Email link token: writes go out with `X-Review-Token`, no Bearer. */
  reviewToken?: string;
  /** Shows a Skip button before submitting (the email page). */
  onSkip?: () => void;
  /** The last step's button. Without it, `onClose` closes the sheet. */
  onContinue?: () => void;
  continueLabel?: string;
  onClose?: () => void;
  onSubmitted?: (review: OwnStoreReview) => void;
  onError?: (error: unknown) => void;
  renderTitle?: (text: string, className: string) => React.ReactNode;
  /** Move focus into the composer on mount. Defaults to true in a sheet. */
  autoFocus?: boolean;
  className?: string;
}

type StoreStep = 0 | 1 | 2;
const STEP_NAMES = ["Rating", "Details", "Done"] as const;
const DRAFT_KEY = "store";

const STEP_HEADINGS: Record<StoreStep, string> = {
  0: "How was shopping with us?",
  1: "Tell us more",
  2: "Thanks"
};

const DEFAULT_LIMITS = { title_max: 120, body_max: 5000 };

const baseButton =
  "min-h-[44px] flex-1 rounded-full font-title text-xs uppercase tracking-[0.12em]";
// Dark text on the brand pink keeps contrast above 4.5:1.
const primaryButton = cn(baseButton, "text-black");
const secondaryButton = cn(baseButton, "border-foreground/30");

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "";

/**
 * Store review composer: Rating → Details → Done. No photos and no points
 * (store reviews earn none), neutral copy, and the same Done step for every
 * rating. Creates with POST and, on 409 `already_reviewed`, edits the
 * returned review instead (see `useSaveStoreReview`).
 */
export const StoreReviewComposer = ({
  form,
  mode = "sheet",
  reviewToken,
  onSkip,
  onContinue,
  continueLabel = "Continue",
  onClose,
  onSubmitted,
  onError,
  renderTitle,
  autoFocus,
  className
}: StoreReviewComposerProps) => {
  const uid = useId();
  const headingId = `${uid}-heading`;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const interactedRef = useRef(autoFocus ?? mode === "sheet");
  const dirtyRef = useRef(false);

  const existing = form.existing_review;
  const [editingId, setEditingId] = useState<number | null>(
    existing?.id ?? null
  );
  const [step, setStep] = useState<StoreStep>(0);
  const [values, setValues] = useState<ComposerValues>(() => {
    const draft = loadDraft(DRAFT_KEY, existing?.id ?? null);
    return {
      rating: existing?.rating || 0,
      attributeRatings: { ...(existing?.attribute_ratings || {}) },
      title: draft?.title ?? existing?.title ?? "",
      body: draft?.body ?? existing?.body ?? "",
      displayName:
        draft?.displayName || existing?.display_name || form.display_name || ""
    };
  });
  const [errors, setErrors] = useState<ComposerFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<OwnStoreReview | null>(null);

  const save = useSaveStoreReview({ reviewToken });
  const submitting = save.isLoading;
  const limits = { ...DEFAULT_LIMITS, ...(form.limits || {}) };
  // Labels follow what the customer opened (write vs edit); a review created
  // here keeps "Review DNA" through the Done step, while later saves PATCH it.
  const isEdit = !!existing;

  // Autosave text (debounced) while writing.
  useEffect(() => {
    if (step === 2 || !dirtyRef.current) return;
    const timer = window.setTimeout(() => {
      saveDraft(DRAFT_KEY, editingId, {
        title: values.title,
        body: values.body,
        displayName: values.displayName
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [step, editingId, values.title, values.body, values.displayName]);

  // Focus the step heading on every step change (after the shopper acts).
  useEffect(() => {
    if (!interactedRef.current) return;
    headingRef.current?.focus();
  }, [step]);

  const goTo = (next: StoreStep) => {
    interactedRef.current = true;
    setSubmitError(null);
    setStep(next);
  };

  const setText = (field: keyof ComposerText, value: string) => {
    dirtyRef.current = true;
    setValues((current) => ({ ...current, [field]: value }));
    const errorKey = field === "displayName" ? "display_name" : field;
    if (errors[errorKey]) {
      setErrors((current) => ({ ...current, [errorKey]: undefined }));
    }
  };

  const setRating = (rating: number) => {
    setValues((current) => ({ ...current, rating: rating as StarRating }));
    if (errors.rating)
      setErrors((current) => ({ ...current, rating: undefined }));
  };

  const setAttribute = (key: string, value: number) =>
    setValues((current) => ({
      ...current,
      attributeRatings: { ...current.attributeRatings, [key]: value }
    }));

  const submit = async () => {
    if (!values.rating) {
      setErrors({ rating: "Choose a star rating first." });
      goTo(0);
      return;
    }
    interactedRef.current = true;
    setSubmitError(null);
    setErrors({});
    // A review request may only send `{ id, rating }` for an existing store
    // review: never clear text we were never shown.
    const unseen = (field: "title" | "body") =>
      !!existing && existing[field] === undefined && !values[field].trim();
    try {
      const review = await save.mutateAsync({
        id: editingId,
        rating: values.rating as StarRating,
        title: unseen("title") ? undefined : values.title,
        body: unseen("body") ? undefined : values.body,
        display_name: values.displayName,
        attribute_ratings: values.attributeRatings
      });
      clearDraft(DRAFT_KEY);
      dirtyRef.current = false;
      setEditingId(review?.id ?? editingId);
      setResult(review);
      setStep(2);
      onSubmitted?.(review);
    } catch (error) {
      onError?.(error);
      const fields = reviewFieldErrors(error) as ComposerFieldErrors;
      setErrors(fields);
      setSubmitError(reviewErrorMessage(error, "store"));
      const errorStep: StoreStep | null = fields.rating
        ? 0
        : fields.attribute_ratings ||
          fields.title ||
          fields.body ||
          fields.display_name
        ? 1
        : null;
      if (errorStep !== null && errorStep !== step) setStep(errorStep);
      window.setTimeout(() => {
        rootRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus();
      }, 60);
    }
  };

  const titleText = isEdit
    ? `Edit your review of ${STORE_NAME}`
    : `Review ${STORE_NAME}`;
  const name = firstName(values.displayName);
  const heading =
    step === 2 ? `Thanks${name ? `, ${name}` : ""}` : STEP_HEADINGS[step];
  const isSheet = mode === "sheet";
  const titleClass =
    "font-title text-[11px] leading-4 uppercase tracking-[0.2em] text-muted-foreground";

  const busyLabel = (
    <>
      <Loader2 className="animate-spin" aria-hidden="true" />
      Sending…
    </>
  );

  const renderBody = () => {
    switch (step) {
      case 0:
        return (
          <StepRating
            headingId={headingId}
            rating={values.rating}
            onRating={setRating}
            error={errors.rating}
            points={null}
          />
        );
      case 1:
        return (
          <StepDetails
            questions={form.questions || []}
            attributeRatings={values.attributeRatings}
            onAttribute={setAttribute}
            text={values}
            onText={setText}
            limits={limits}
            errors={errors}
            bodyPlaceholder="How were ordering, delivery and packaging?"
          />
        );
      default:
        return result ? (
          <div className="grid justify-items-center gap-4 text-center">
            <Rating value={result.rating} size="lg" />
            <p className="m-0 max-w-xs font-body text-base text-foreground">
              {result.status_message}
            </p>
          </div>
        ) : null;
    }
  };

  const renderFooterButtons = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Button
              variant="outline"
              className={secondaryButton}
              disabled={!values.rating || submitting}
              onClick={submit}
            >
              {submitting
                ? busyLabel
                : isEdit
                ? "Save rating"
                : "Submit rating"}
            </Button>
            <Button
              className={primaryButton}
              disabled={!values.rating || submitting}
              onClick={() => goTo(1)}
            >
              {isEdit ? "Edit details" : "Add details"}
            </Button>
          </>
        );
      case 1:
        return (
          <>
            <Button
              variant="outline"
              className={secondaryButton}
              disabled={submitting}
              onClick={() => goTo(0)}
            >
              Back
            </Button>
            <Button
              className={primaryButton}
              disabled={submitting}
              onClick={submit}
            >
              {submitting
                ? busyLabel
                : isEdit
                ? "Save changes"
                : "Submit review"}
            </Button>
          </>
        );
      default: {
        const finish = onContinue || onClose;
        return finish ? (
          <Button className={primaryButton} onClick={finish}>
            {onContinue ? continueLabel : "Done"}
          </Button>
        ) : null;
      }
    }
  };

  const footerButtons = renderFooterButtons();
  const statusText = submitting
    ? "Sending your review…"
    : step === 2 && result
    ? `Review sent. ${result.status_message}`
    : "";

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      data-store-review-composer
      data-step={STEP_NAMES[step].toLowerCase()}
      className={cn(
        "flex flex-col bg-background text-foreground focus:outline-none",
        isSheet
          ? "min-h-0 flex-1"
          : "rounded-2xl border border-border shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          "grid gap-3 border-b border-border/70 px-5 pb-4 pt-5",
          isSheet && "pr-14"
        )}
      >
        {renderTitle ? (
          renderTitle(titleText, titleClass)
        ) : (
          <h2 className={cn("m-0", titleClass)}>{titleText}</h2>
        )}
        <div className="grid grid-cols-3 gap-1" aria-hidden="true">
          {STEP_NAMES.map((stepName, index) => (
            <span
              key={stepName}
              className={cn(
                "h-[3px] rounded-full transition-colors",
                index <= step ? "bg-brand" : "bg-border"
              )}
            />
          ))}
        </div>
        <p className="sr-only">
          Step {step + 1} of 3: {STEP_NAMES[step]}
        </p>
      </div>

      <div
        className={cn(
          "grid content-start gap-5 px-5 py-6",
          isSheet && "min-h-0 flex-1 overflow-y-auto overscroll-contain"
        )}
      >
        <h3
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={cn(
            "m-0 font-title text-lg uppercase tracking-[0.08em] text-foreground focus:outline-none",
            step !== 1 && "text-center"
          )}
        >
          {heading}
        </h3>
        {renderBody()}
      </div>

      <div className="grid gap-2 border-t border-border/70 px-5 pb-5 pt-3">
        <p className="sr-only" role="status" aria-live="polite">
          {statusText}
        </p>
        <div aria-live="assertive">
          {submitError && (
            <p role="alert" className="m-0 font-body text-sm text-red">
              {submitError}
            </p>
          )}
        </div>
        {footerButtons && <div className="flex gap-2.5">{footerButtons}</div>}
        {onSkip && step !== 2 && (
          <Button
            type="button"
            variant="ghost"
            className="min-h-[44px] w-full rounded-full font-title text-xs uppercase tracking-[0.12em] text-muted-foreground"
            disabled={submitting}
            onClick={onSkip}
          >
            Skip
          </Button>
        )}
      </div>
    </div>
  );
};

export default StoreReviewComposer;
