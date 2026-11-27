import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";
import { Loader2 } from "lucide-react";
import { Button, Skeleton } from "@components/ui";
import { cn } from "@lib/utils";
import { reviewErrorMessage, reviewFieldErrors } from "@lib/reviews";
import {
  useCreateReview,
  useReviewables,
  useReviewForm,
  useUpdateReview
} from "@hooks/useReviews";
import type {
  OwnReview,
  ReviewForm,
  ReviewFormLimits,
  ReviewPhoto,
  StarRating
} from "../../../types/reviews";
import { NewReviewPhoto, PhotoUploader, releasePhoto } from "../PhotoUploader";
import { clearDraft, loadDraft, saveDraft } from "./draft";
import { ProductThumb } from "./ProductThumb";
import { StepDetails } from "./StepDetails";
import { StepDone } from "./StepDone";
import { StepRating } from "./StepRating";
import {
  ComposerFieldErrors,
  ComposerQueue,
  ComposerStep,
  ComposerText,
  ComposerValues,
  ReviewTarget,
  STEP_NAMES
} from "./types";

export interface ReviewComposerProps {
  target: ReviewTarget;
  /** `sheet` fills a Sheet (scrolling body, pinned footer); `page` flows in the page. */
  mode?: "sheet" | "page";
  /** Pre-selects a rating (e.g. a star tapped in the request email). */
  initialRating?: StarRating;
  /**
   * Composer data supplied by the caller instead of loading
   * `GET /products/:id/review_form` (which needs a Bearer). The email page
   * builds it from the review request.
   */
  form?: ReviewForm;
  /** Email link token: writes go out with `X-Review-Token`, no Bearer. */
  reviewToken?: string;
  /**
   * The caller decides what comes next (the email page walks the order's
   * items). Without it, "Next up" comes from the account's reviewables.
   */
  queue?: ComposerQueue;
  /** Shows a Close button on the last step and on dead ends. */
  onClose?: () => void;
  onSubmitted?: (review: OwnReview) => void;
  /** Called when a submit fails, after the composer shows the error. */
  onError?: (error: unknown) => void;
  /** Renders the title; the Sheet passes its SheetTitle for the dialog name. */
  renderTitle?: (text: string, className: string) => React.ReactNode;
  /**
   * Focus the composer as soon as it mounts. Defaults to true in a sheet; in
   * page mode focus only moves once the shopper starts using it.
   */
  autoFocus?: boolean;
  className?: string;
}

const DEFAULT_LIMITS: ReviewFormLimits = {
  max_photos: 5,
  max_photo_mb: 10,
  title_max: 120,
  body_max: 5000,
  photo_types: []
};

const EMPTY_VALUES: ComposerValues = {
  rating: 0,
  attributeRatings: {},
  title: "",
  body: "",
  displayName: ""
};

const STEP_HEADINGS: Record<ComposerStep, string> = {
  0: "How would you rate it?",
  1: "Tell us more",
  2: "Add photos",
  3: "Thanks"
};

const INELIGIBLE_COPY: Record<string, string> = {
  not_purchased: "Reviews are open to customers who bought this item.",
  not_shipped: "You can review this once it has shipped.",
  staff: "Staff accounts can't review products."
};

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "";

const baseButton =
  "min-h-[44px] flex-1 rounded-full font-title text-xs uppercase tracking-[0.12em]";
// Dark text on the brand pink keeps contrast above 4.5:1 (white is ~2.3:1).
const primaryButton = cn(baseButton, "text-black");
const secondaryButton = cn(baseButton, "border-foreground/30");

/**
 * Review composer: Rating → Details → Photos → Done. Loads the product's
 * `review_form` (eligibility, existing review, questions, limits), prefills
 * an edit, autosaves text drafts, resizes photos on the device and posts
 * multipart. Works inside `ReviewComposerSheet` or as a page section.
 *
 * Copy stays neutral ("Tell us more", never "what you loved") and the Done
 * step reads the same for every rating.
 */
export const ReviewComposer = ({
  target: initialTarget,
  mode = "sheet",
  initialRating,
  form: suppliedForm,
  reviewToken,
  queue,
  onClose,
  onSubmitted,
  onError,
  renderTitle,
  autoFocus,
  className
}: ReviewComposerProps) => {
  const uid = useId();
  const headingId = `${uid}-heading`;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [target, setTarget] = useState<ReviewTarget>(initialTarget);
  useEffect(() => {
    setTarget(initialTarget);
    // Only a different product should reset the composer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTarget.productId]);
  const targetKey = String(target.productId);

  const formQuery = useReviewForm(target.productId, {
    enabled: !suppliedForm
  });
  const form = suppliedForm || formQuery.data;
  const reviewables = useReviewables({ enabled: !queue });

  const [initializedFor, setInitializedFor] = useState<string | null>(null);
  const [editing, setEditing] = useState<OwnReview | null>(null);
  const [step, setStep] = useState<ComposerStep>(0);
  const [values, setValues] = useState<ComposerValues>(EMPTY_VALUES);
  const [newPhotos, setNewPhotos] = useState<NewReviewPhoto[]>([]);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<
    Array<ReviewPhoto["id"]>
  >([]);
  const [photosBusy, setPhotosBusy] = useState(false);
  const [errors, setErrors] = useState<ComposerFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<OwnReview | null>(null);
  const [doneProducts, setDoneProducts] = useState<string[]>([]);
  const dirtyRef = useRef(false);
  const interactedRef = useRef(autoFocus ?? mode === "sheet");

  const createReview = useCreateReview({ reviewToken });
  const updateReview = useUpdateReview({ reviewToken });
  const submitting = createReview.isLoading || updateReview.isLoading;

  const ready = initializedFor === targetKey && !!form;
  const limits = { ...DEFAULT_LIMITS, ...(form?.limits || {}) };
  const questions = form?.questions || [];
  const canReview = !!form && (form.eligible || !!form.existing_review);

  // Initialize once per product: from the existing review (edit) or a draft.
  useEffect(() => {
    if (!form || initializedFor === targetKey) return;
    const existing = form.existing_review;
    const draft = loadDraft(target.productId, existing?.id ?? null);
    setEditing(existing);
    setValues({
      rating: existing?.rating || initialRating || 0,
      attributeRatings: { ...(existing?.attribute_ratings || {}) },
      title: draft?.title ?? existing?.title ?? "",
      body: draft?.body ?? existing?.body ?? "",
      displayName:
        draft?.displayName || existing?.display_name || form.display_name || ""
    });
    setNewPhotos((photos) => {
      photos.forEach(releasePhoto);
      return [];
    });
    setRemovedPhotoIds([]);
    setErrors({});
    setSubmitError(null);
    setResult(null);
    setStep(0);
    dirtyRef.current = false;
    setInitializedFor(targetKey);
  }, [form, initializedFor, targetKey, target.productId, initialRating]);

  // Release preview URLs when the composer goes away.
  const photosRef = useRef(newPhotos);
  photosRef.current = newPhotos;
  useEffect(() => () => photosRef.current.forEach(releasePhoto), []);

  // Autosave text fields (debounced) while writing.
  useEffect(() => {
    if (!ready || step === 3 || !dirtyRef.current) return;
    const timer = window.setTimeout(() => {
      saveDraft(target.productId, editing?.id ?? null, {
        title: values.title,
        body: values.body,
        displayName: values.displayName
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [
    ready,
    step,
    target.productId,
    editing,
    values.title,
    values.body,
    values.displayName
  ]);

  // Move focus to the step heading on every step (and product) change.
  const focusKey = ready ? `${targetKey}:${step}` : null;
  useEffect(() => {
    if (!interactedRef.current) return;
    if (focusKey) headingRef.current?.focus({ preventScroll: false });
    else rootRef.current?.focus({ preventScroll: true });
  }, [focusKey]);

  const goTo = (next: ComposerStep) => {
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

  const keptPhotos = useMemo(
    () =>
      (editing?.photos || []).filter(
        (photo) => !removedPhotoIds.includes(photo.id)
      ),
    [editing, removedPhotoIds]
  );

  const remainingReviewables = useMemo(() => {
    const items = reviewables.data?.data || [];
    return items.filter(
      (item) =>
        !item.existing_review &&
        item.slug !== targetKey &&
        String(item.product_id) !== targetKey &&
        !doneProducts.includes(item.slug) &&
        !doneProducts.includes(String(item.product_id))
    );
  }, [reviewables.data, targetKey, doneProducts]);
  const nextItem = queue ? queue.next : remainingReviewables[0] || null;
  const remainingCount = queue ? queue.remaining : remainingReviewables.length;

  const submit = async () => {
    if (!values.rating) {
      setErrors({ rating: "Choose a star rating first." });
      goTo(0);
      return;
    }
    if (photosBusy) return;
    interactedRef.current = true;
    setSubmitError(null);
    setErrors({});
    const shared = {
      rating: values.rating as StarRating,
      title: values.title,
      body: values.body,
      display_name: values.displayName,
      attribute_ratings: values.attributeRatings,
      photos: newPhotos.map((photo) => photo.file)
    };
    try {
      const review = editing
        ? await updateReview.mutateAsync({
            id: editing.id,
            ...shared,
            remove_photo_ids: removedPhotoIds
          })
        : await createReview.mutateAsync({
            product_id: target.productId,
            line_item_id: target.lineItemId ?? form?.line_item_id ?? undefined,
            ...shared
          });
      clearDraft(target.productId);
      dirtyRef.current = false;
      newPhotos.forEach(releasePhoto);
      setNewPhotos([]);
      setResult(review);
      setDoneProducts((current) => [
        ...current,
        targetKey,
        String(review.product?.id ?? targetKey),
        review.product?.slug || targetKey
      ]);
      setStep(3);
      onSubmitted?.(review);
    } catch (error) {
      onError?.(error);
      const fields = reviewFieldErrors(error) as ComposerFieldErrors;
      setErrors(fields);
      setSubmitError(reviewErrorMessage(error, "submit"));
      const errorStep: ComposerStep | null = fields.rating
        ? 0
        : fields.attribute_ratings ||
          fields.title ||
          fields.body ||
          fields.display_name
        ? 1
        : fields.photos
        ? 2
        : null;
      if (errorStep !== null && errorStep !== step) setStep(errorStep);
      // After the step heading takes focus, move it to the first invalid field.
      window.setTimeout(() => {
        rootRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus();
      }, 60);
    }
  };

  const reviewNext = () => {
    if (!nextItem) return;
    interactedRef.current = true;
    if (queue) {
      queue.onNext();
      return;
    }
    const reviewable = remainingReviewables[0];
    if (!reviewable) return;
    setResult(null);
    setInitializedFor(null);
    setTarget({
      productId: reviewable.slug || reviewable.product_id,
      name: reviewable.name,
      imageUrl: reviewable.image_url,
      variantLabel: reviewable.variant_label,
      lineItemId: reviewable.line_item_id
    });
  };

  const productName =
    target.name ||
    editing?.product?.name ||
    form?.existing_review?.product?.name;
  const productImage =
    target.imageUrl ||
    editing?.product?.image_url ||
    form?.existing_review?.product?.image_url;
  const variantLabel = target.variantLabel || form?.variant_label;
  const titleText = editing ? "Edit your review" : "Write a review";
  const isSheet = mode === "sheet";
  const heading =
    step === 3
      ? `Thanks${
          firstName(values.displayName)
            ? `, ${firstName(values.displayName)}`
            : ""
        }`
      : STEP_HEADINGS[step];

  /* ---------------------------------------------------------------- */

  const renderBody = () => {
    if (formQuery.isError && !form) {
      return (
        <div
          role="alert"
          className="grid justify-items-center gap-3 py-8 text-center"
        >
          <p className="m-0 font-body text-sm text-muted-foreground">
            {reviewErrorMessage(formQuery.error, "load")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => formQuery.refetch()}
          >
            Try again
          </Button>
        </div>
      );
    }
    if (!ready) {
      return (
        <div className="grid justify-items-center gap-4 py-6" aria-busy="true">
          <span className="sr-only">Loading…</span>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-12 w-60" />
          <Skeleton className="h-4 w-40" />
        </div>
      );
    }
    if (!canReview) {
      return (
        <p className="m-0 py-6 text-center font-body text-sm text-muted-foreground">
          {INELIGIBLE_COPY[form?.reason || ""] ||
            "This item can't be reviewed from your account."}
        </p>
      );
    }
    switch (step) {
      case 0:
        return (
          <StepRating
            headingId={headingId}
            rating={values.rating}
            onRating={setRating}
            error={errors.rating}
            points={editing ? null : form?.points}
          />
        );
      case 1:
        return (
          <StepDetails
            questions={questions}
            attributeRatings={values.attributeRatings}
            onAttribute={setAttribute}
            text={values}
            onText={setText}
            limits={limits}
            errors={errors}
          />
        );
      case 2:
        return (
          <div className="grid gap-3">
            <PhotoUploader
              value={newPhotos}
              onChange={setNewPhotos}
              existing={keptPhotos}
              onRemoveExisting={(id) =>
                setRemovedPhotoIds((current) => [...current, id])
              }
              limits={limits}
              productName={productName || undefined}
              error={errors.photos}
              onBusyChange={setPhotosBusy}
            />
            <p className="m-0 font-body text-xs text-muted-foreground">
              Our team checks photos before they appear.
            </p>
          </div>
        );
      default:
        return result ? (
          <StepDone
            review={result}
            isNew={!editing}
            next={nextItem}
            remaining={remainingCount}
            nextLabel={queue?.nextLabel}
          />
        ) : null;
    }
  };

  const renderFooterButtons = () => {
    if (!ready || !canReview) {
      return onClose ? (
        <Button variant="outline" className={secondaryButton} onClick={onClose}>
          Close
        </Button>
      ) : null;
    }
    const submitLabel = editing ? "Save changes" : "Submit review";
    const busyLabel = (
      <>
        <Loader2 className="animate-spin" aria-hidden="true" />
        Sending…
      </>
    );
    switch (step) {
      case 0:
        return (
          <>
            <Button
              variant="outline"
              className={secondaryButton}
              disabled={!values.rating || submitting || photosBusy}
              onClick={submit}
            >
              {submitting
                ? busyLabel
                : editing
                ? "Save rating"
                : "Submit rating"}
            </Button>
            <Button
              className={primaryButton}
              disabled={!values.rating || submitting}
              onClick={() => goTo(1)}
            >
              {editing ? "Edit details" : "Add details"}
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
              onClick={() => goTo(2)}
            >
              {editing ? "Photos" : "Add photos"}
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <Button
              variant="outline"
              className={secondaryButton}
              disabled={submitting}
              onClick={() => goTo(1)}
            >
              Back
            </Button>
            <Button
              className={primaryButton}
              disabled={submitting || photosBusy}
              onClick={submit}
            >
              {submitting ? busyLabel : submitLabel}
            </Button>
          </>
        );
      default:
        return (
          <>
            {onClose && (
              <Button
                variant="outline"
                className={secondaryButton}
                onClick={onClose}
              >
                {nextItem ? "Close" : "Done"}
              </Button>
            )}
            {nextItem && (
              <Button className={primaryButton} onClick={reviewNext}>
                Review next item
              </Button>
            )}
          </>
        );
    }
  };

  const titleClass =
    "font-title text-[11px] leading-4 uppercase tracking-[0.2em] text-muted-foreground";
  const footerButtons = renderFooterButtons();
  const statusText = submitting
    ? "Sending your review…"
    : step === 3 && result
    ? `Review sent. ${result.status_message}`
    : "";

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      data-review-composer
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
        <div className="grid grid-cols-4 gap-1" aria-hidden="true">
          {STEP_NAMES.map((name, index) => (
            <span
              key={name}
              className={cn(
                "h-[3px] rounded-full transition-colors",
                index <= step ? "bg-brand" : "bg-border"
              )}
            />
          ))}
        </div>
        <p className="sr-only">
          Step {step + 1} of 4: {STEP_NAMES[step]}
        </p>
        {(productName || variantLabel) && (
          <ProductThumb
            name={productName || "This item"}
            imageUrl={productImage}
            detail={variantLabel}
          />
        )}
      </div>

      <div
        className={cn(
          "grid content-start gap-5 px-5 py-6",
          isSheet && "min-h-0 flex-1 overflow-y-auto overscroll-contain"
        )}
      >
        {ready && canReview && (
          <h3
            id={headingId}
            ref={headingRef}
            tabIndex={-1}
            className={cn(
              "m-0 font-title text-lg uppercase tracking-[0.08em] text-foreground focus:outline-none",
              (step === 0 || step === 3) && "text-center"
            )}
          >
            {heading}
          </h3>
        )}
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
      </div>
    </div>
  );
};

export default ReviewComposer;
