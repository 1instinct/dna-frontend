import React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@lib/utils";
import { bipolarMidLabel } from "@lib/reviews";
import type { ReviewQuestion } from "../../../types/reviews";

interface BipolarInputProps {
  question: ReviewQuestion;
  value: number | null | undefined;
  onChange: (value: number) => void;
  labelId: string;
  describedBy?: string;
  invalid?: boolean;
}

const POSITIONS = [1, 2, 3, 4, 5];

/**
 * Five-step segmented radiogroup for a two-ended question such as Fit
 * ("Runs small" … "Runs large"). The middle reads "True to size" for `fit`
 * only. Radix gives arrow-key navigation and roving focus.
 */
export const BipolarInput = ({
  question,
  value,
  onChange,
  labelId,
  describedBy,
  invalid
}: BipolarInputProps) => {
  const low = question.low_label || "Low";
  const high = question.high_label || "High";
  const mid = bipolarMidLabel(question);

  const visibleLabel = (position: number) => {
    if (position === 1) return low;
    if (position === 5) return high;
    if (position === 3) return mid;
    return null;
  };

  const accessibleLabel = (position: number) => {
    const text = visibleLabel(position);
    return text ? `${position} of 5, ${text}` : `${position} of 5`;
  };

  return (
    <RadioGroupPrimitive.Root
      value={value ? String(value) : ""}
      onValueChange={(next) => onChange(Number(next))}
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      orientation="horizontal"
      loop={false}
      className="grid grid-cols-5 gap-1"
    >
      {POSITIONS.map((position) => {
        const text = visibleLabel(position);
        return (
          <RadioGroupPrimitive.Item
            key={position}
            value={String(position)}
            aria-label={accessibleLabel(position)}
            className={cn(
              "flex min-h-[48px] items-center justify-center rounded-lg border border-border bg-background px-1 py-1.5 text-center font-body text-[11.5px] leading-tight text-muted-foreground transition-colors",
              "hover:border-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
              "data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-black"
            )}
          >
            {text ? (
              <span aria-hidden="true">{text}</span>
            ) : (
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-current opacity-60"
              />
            )}
          </RadioGroupPrimitive.Item>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
};

export default BipolarInput;
