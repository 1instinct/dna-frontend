import React, { useId } from "react";
import { Input, Label, RatingInput, Textarea } from "@components/ui";
import { cn } from "@lib/utils";
import { SCALE_LABELS } from "@lib/reviews";
import type {
  AttributeRatings,
  ReviewFormLimits,
  ReviewQuestion
} from "../../../types/reviews";
import { BipolarInput } from "./BipolarInput";
import type { ComposerFieldErrors, ComposerText } from "./types";

interface StepDetailsProps {
  questions: ReviewQuestion[];
  attributeRatings: AttributeRatings;
  onAttribute: (key: string, value: number) => void;
  text: ComposerText;
  onText: (field: keyof ComposerText, value: string) => void;
  limits: Pick<ReviewFormLimits, "title_max" | "body_max">;
  errors: ComposerFieldErrors;
  /** Neutral prompt for the review text; defaults to the product one. */
  bodyPlaceholder?: string;
}

const DISPLAY_NAME_MAX = 60;

/**
 * Explicit label size: `cn()` (plain tailwind-merge) drops the Label's
 * custom `text-title-xs` size because it reads it as a color.
 */
const LABEL_CLASS = "text-[11px] leading-4";

const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <p id={id} className="m-0 font-body text-xs text-red">
      {message}
    </p>
  ) : null;

/** Visible counter near the limit, plus a screen reader hint every 50 characters. */
const Counter = ({
  length,
  max,
  showFrom
}: {
  length: number;
  max: number;
  showFrom: number;
}) => {
  if (length < showFrom) return null;
  const left = max - length;
  const spoken =
    left <= 0
      ? "Character limit reached"
      : `About ${Math.ceil(left / 50) * 50} characters left`;
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "font-body text-xs tabular-nums",
          left <= 0 ? "text-red" : "text-muted-foreground"
        )}
      >
        {length.toLocaleString("en-US")} / {max.toLocaleString("en-US")}
      </span>
      <span className="sr-only" aria-live="polite">
        {spoken}
      </span>
    </>
  );
};

/**
 * Step 2, all optional: the product's questions (scale = stars, bipolar =
 * five-step segments), title, review text and display name. Prompts stay
 * neutral; never ask for a positive review.
 */
export const StepDetails = ({
  questions,
  attributeRatings,
  onAttribute,
  text,
  onText,
  limits,
  errors,
  bodyPlaceholder = "How's the fit, fabric, color in person?"
}: StepDetailsProps) => {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const describe = (...ids: Array<string | false | undefined>) =>
    ids.filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-6">
      {questions.map((question) => {
        const labelId = id(`q-${question.key}`);
        const value = attributeRatings[question.key];
        return (
          <div key={question.key} className="grid gap-2">
            <span
              id={labelId}
              className="font-title text-[11px] leading-4 uppercase tracking-[0.15em] text-foreground/70"
            >
              {question.kind === "bipolar"
                ? `How's the ${question.label.toLowerCase()}?`
                : question.label}
            </span>
            {question.kind === "bipolar" ? (
              <BipolarInput
                question={question}
                value={value}
                onChange={(next) => onAttribute(question.key, next)}
                labelId={labelId}
              />
            ) : (
              <RatingInput
                value={value}
                onChange={(next) => onAttribute(question.key, next)}
                labels={SCALE_LABELS}
                size="sm"
                aria-labelledby={labelId}
              />
            )}
          </div>
        );
      })}
      {errors.attribute_ratings && (
        <FieldError
          id={id("attributes-error")}
          message={errors.attribute_ratings}
        />
      )}

      <div className="grid gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor={id("title")} className={LABEL_CLASS}>
            Title
          </Label>
          <Counter
            length={text.title.length}
            max={limits.title_max}
            showFrom={Math.floor(limits.title_max * 0.8)}
          />
        </div>
        <Input
          id={id("title")}
          value={text.title}
          maxLength={limits.title_max}
          placeholder="Sum it up in a few words"
          autoComplete="off"
          aria-invalid={!!errors.title || undefined}
          aria-describedby={describe(errors.title && id("title-error"))}
          onChange={(event) => onText("title", event.target.value)}
        />
        <FieldError id={id("title-error")} message={errors.title} />
      </div>

      <div className="grid gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor={id("body")} className={LABEL_CLASS}>
            Your review
          </Label>
          <Counter
            length={text.body.length}
            max={limits.body_max}
            showFrom={Math.max(0, limits.body_max - 500)}
          />
        </div>
        <Textarea
          id={id("body")}
          value={text.body}
          maxLength={limits.body_max}
          rows={5}
          placeholder={bodyPlaceholder}
          aria-invalid={!!errors.body || undefined}
          aria-describedby={describe(errors.body && id("body-error"))}
          onChange={(event) => onText("body", event.target.value)}
        />
        <FieldError id={id("body-error")} message={errors.body} />
      </div>

      <div className="grid gap-1">
        <Label htmlFor={id("name")} className={LABEL_CLASS}>
          Shown as
        </Label>
        <Input
          id={id("name")}
          value={text.displayName}
          maxLength={DISPLAY_NAME_MAX}
          autoComplete="nickname"
          aria-invalid={!!errors.display_name || undefined}
          aria-describedby={describe(
            id("name-hint"),
            errors.display_name && id("name-error")
          )}
          onChange={(event) => onText("displayName", event.target.value)}
        />
        <p
          id={id("name-hint")}
          className="m-0 font-body text-xs text-muted-foreground"
        >
          The name next to your review.
        </p>
        <FieldError id={id("name-error")} message={errors.display_name} />
      </div>
    </div>
  );
};

export default StepDetails;
