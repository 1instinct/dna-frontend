import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@lib/utils";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    { value, max = 5, size = "md", readOnly = true, onChange, className },
    ref
  ) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);
    const displayValue = hoverValue ?? value;

    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center gap-0.5", className)}
        role="img"
        aria-label={`${value} out of ${max} stars`}
      >
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1;
          const filled = displayValue >= starValue;
          const halfFilled =
            !filled && displayValue >= starValue - 0.5;

          return (
            <button
              key={i}
              type="button"
              disabled={readOnly}
              className={cn(
                "relative transition-transform duration-150",
                !readOnly &&
                  "cursor-pointer hover:scale-110 focus:outline-none"
              )}
              onClick={() => !readOnly && onChange?.(starValue)}
              onMouseEnter={() => !readOnly && setHoverValue(starValue)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
            >
              <Star
                className={cn(
                  sizeMap[size],
                  "transition-colors duration-150",
                  filled
                    ? "fill-brand text-brand"
                    : halfFilled
                    ? "fill-brand/50 text-brand"
                    : "fill-transparent text-gray-light"
                )}
              />
            </button>
          );
        })}
      </div>
    );
  }
);
Rating.displayName = "Rating";

export { Rating };
