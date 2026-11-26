import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@lib/utils";

interface RatingProps {
  value: number;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
  readOnly?: boolean;
  onChange?: (value: number) => void;
  className?: string;
  /** Overrides the default "4.5 out of 5 stars" label. */
  label?: string;
}

const sizeMap = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-6 w-6"
};

/**
 * Star display. Read-only (the default) renders plain icons inside a
 * `role="img"` wrapper; averages are rounded to the nearest half star and the
 * half is drawn as a clipped overlay. For input use `RatingInput`.
 */
const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      max = 5,
      size = "md",
      readOnly = true,
      onChange,
      className,
      label
    },
    ref
  ) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);
    const displayValue = Math.round((hoverValue ?? value) * 2) / 2;
    const rounded = Math.round(value * 10) / 10;

    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center gap-0.5", className)}
        role="img"
        aria-label={label || `${rounded} out of ${max} stars`}
      >
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1;
          const filled = displayValue >= starValue;
          const halfFilled = !filled && displayValue >= starValue - 0.5;

          const icon = (
            <span className="relative inline-flex">
              <Star
                aria-hidden="true"
                className={cn(
                  sizeMap[size],
                  "transition-colors duration-150",
                  filled
                    ? "fill-brand text-brand"
                    : "fill-transparent text-gray-light"
                )}
              />
              {halfFilled && (
                <span
                  className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"
                  aria-hidden="true"
                >
                  <Star
                    className={cn(sizeMap[size], "fill-brand text-brand")}
                  />
                </span>
              )}
            </span>
          );

          if (readOnly) {
            return (
              <span key={i} className="inline-flex" aria-hidden="true">
                {icon}
              </span>
            );
          }

          return (
            <button
              key={i}
              type="button"
              className="relative cursor-pointer transition-transform duration-150 hover:scale-110 focus:outline-none"
              onClick={() => onChange?.(starValue)}
              onMouseEnter={() => setHoverValue(starValue)}
              onMouseLeave={() => setHoverValue(null)}
            >
              {icon}
            </button>
          );
        })}
      </div>
    );
  }
);
Rating.displayName = "Rating";

export { Rating };
