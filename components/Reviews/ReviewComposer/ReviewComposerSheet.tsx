import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle
} from "@components/ui";
import { cn } from "@lib/utils";
import type { OwnReview, StarRating } from "../../../types/reviews";
import { ReviewComposer } from "./ReviewComposer";
import type { ReviewTarget } from "./types";

const DESKTOP_QUERY = "(min-width: 768px)";

/** True at Tailwind's `md` breakpoint and up; false during SSR. */
export const useIsDesktop = () => {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);
  return desktop;
};

interface ReviewComposerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: ReviewTarget | null;
  initialRating?: StarRating;
  onSubmitted?: (review: OwnReview) => void;
}

/**
 * The composer in a shadcn Sheet: from the right at `md` and up, a bottom
 * sheet on phones. Focus goes to the step heading (not the close button).
 */
export const ReviewComposerSheet = ({
  open,
  onOpenChange,
  target,
  initialRating,
  onSubmitted
}: ReviewComposerSheetProps) => {
  const desktop = useIsDesktop();
  return (
    <Sheet open={open && !!target} onOpenChange={onOpenChange}>
      <SheetContent
        side={desktop ? "right" : "bottom"}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className={cn(
          "flex flex-col gap-0 p-0",
          desktop ? "w-full sm:max-w-md" : "max-h-[92vh] rounded-t-2xl"
        )}
      >
        <SheetDescription className="sr-only">
          Rate the product, add details and photos if you like.
        </SheetDescription>
        {target && (
          <ReviewComposer
            target={target}
            mode="sheet"
            initialRating={initialRating}
            onClose={() => onOpenChange(false)}
            onSubmitted={onSubmitted}
            renderTitle={(text, className) => (
              <SheetTitle className={className}>{text}</SheetTitle>
            )}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ReviewComposerSheet;
