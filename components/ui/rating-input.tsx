import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@lib/utils";

const MAX_RATING = 5;

export const DEFAULT_RATING_LABELS = [
  "Hated it",
  "Didn't like it",
  "It's OK",
  "Liked it",
  "Loved it"
] as const;

export interface RatingInputProps {
  /** Selected rating, 1–5. `0` (or `null`/`undefined`) means nothing is selected yet. */
  value?: number | null;
  onChange?: (value: number) => void;
  /** Word label for each star, index 0 = 1 star. Defaults to "Hated it" … "Loved it". */
  labels?: readonly string[];
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  required?: boolean;
  /** When set, a hidden input with this name carries the value for native form posts. */
  name?: string;
  id?: string;
  className?: string;
  /** Accessible name for the group. Use this or `aria-labelledby`. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

const sizeMap = {
  sm: { button: "h-11 w-11", icon: "h-5 w-5", label: "text-body-sm" },
  md: { button: "h-11 w-11", icon: "h-7 w-7", label: "text-body-sm" },
  lg: { button: "h-12 w-12", icon: "h-9 w-9", label: "text-body-md" }
};

/**
 * Accessible star rating input: a `radiogroup` of five `radio` buttons with
 * roving tabindex, arrow/Home/End keys, 44px hit targets and a visible word
 * label for the selected (or hovered) star. For display-only stars use
 * `Rating` from `./rating`.
 */
const RatingInput = React.forwardRef<HTMLDivElement, RatingInputProps>(
  (
    {
      value,
      onChange,
      labels = DEFAULT_RATING_LABELS,
      size = "md",
      disabled = false,
      required = false,
      name,
      id,
      className,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy
    },
    ref
  ) => {
    const selected =
      value && value >= 1 ? Math.min(Math.round(value), MAX_RATING) : 0;
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);
    const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
    const displayValue = hoverValue ?? selected;
    const tabbableIndex = selected > 0 ? selected - 1 : 0;
    const sizes = sizeMap[size];
    const visibleLabel = displayValue > 0 ? labels[displayValue - 1] : "";

    const select = (next: number) => {
      if (disabled) return;
      const clamped = Math.max(1, Math.min(MAX_RATING, next));
      buttonRefs.current[clamped - 1]?.focus();
      if (clamped !== selected) onChange?.(clamped);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      let next: number | null = null;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp":
          next = selected + 1;
          break;
        case "ArrowLeft":
        case "ArrowDown":
          next = selected - 1;
          break;
        case "Home":
          next = 1;
          break;
        case "End":
          next = MAX_RATING;
          break;
        default:
          return;
      }
      event.preventDefault();
      setHoverValue(null);
      select(next);
    };

    return (
      <div className={cn("inline-flex flex-col items-start", className)}>
        <div
          ref={ref}
          id={id}
          role="radiogroup"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-required={required || undefined}
          aria-disabled={disabled || undefined}
          className="inline-flex items-center"
          onPointerLeave={() => setHoverValue(null)}
        >
          {Array.from({ length: MAX_RATING }, (_, i) => {
            const starValue = i + 1;
            const checked = selected === starValue;
            const filled = displayValue >= starValue;
            const label = labels[i];

            return (
              <button
                key={starValue}
                ref={(el) => {
                  buttonRefs.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-label={`${starValue} ${
                  starValue === 1 ? "star" : "stars"
                }${label ? `, ${label}` : ""}`}
                tabIndex={i === tabbableIndex ? 0 : -1}
                disabled={disabled}
                className={cn(
                  "inline-flex shrink-0 items-center justify-center rounded-md transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                  !disabled && "cursor-pointer hover:scale-110",
                  sizes.button
                )}
                onClick={() => select(starValue)}
                onKeyDown={handleKeyDown}
                onPointerEnter={(event) => {
                  if (!disabled && event.pointerType === "mouse") {
                    setHoverValue(starValue);
                  }
                }}
              >
                <Star
                  aria-hidden="true"
                  className={cn(
                    sizes.icon,
                    "transition-colors duration-150",
                    filled
                      ? "fill-brand text-brand"
                      : "fill-transparent text-gray-light"
                  )}
                />
              </button>
            );
          })}
        </div>
        <span
          aria-hidden="true"
          className={cn(
            "min-h-[1.25rem] px-1 font-body text-muted-foreground",
            sizes.label
          )}
        >
          {visibleLabel || " "}
        </span>
        {name ? (
          <input type="hidden" name={name} value={selected || ""} />
        ) : null}
      </div>
    );
  }
);
RatingInput.displayName = "RatingInput";

export { RatingInput };
