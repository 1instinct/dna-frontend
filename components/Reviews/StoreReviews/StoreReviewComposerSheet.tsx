import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle
} from "@components/ui";
import { cn } from "@lib/utils";
import type { OwnStoreReview } from "../../../types/reviews";
import { useIsDesktop } from "../ReviewComposer/ReviewComposerSheet";
import {
  StoreReviewComposer,
  StoreReviewComposerForm
} from "./StoreReviewComposer";

interface StoreReviewComposerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: StoreReviewComposerForm | null | undefined;
  onSubmitted?: (review: OwnStoreReview) => void;
}

/**
 * The store composer in a shadcn Sheet, like `ReviewComposerSheet`: from the
 * right at `md` and up, a bottom sheet on phones.
 */
export const StoreReviewComposerSheet = ({
  open,
  onOpenChange,
  form,
  onSubmitted
}: StoreReviewComposerSheetProps) => {
  const desktop = useIsDesktop();
  return (
    <Sheet open={open && !!form} onOpenChange={onOpenChange}>
      <SheetContent
        side={desktop ? "right" : "bottom"}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className={cn(
          "flex flex-col gap-0 p-0",
          desktop ? "w-full sm:max-w-md" : "max-h-[92vh] rounded-t-2xl"
        )}
      >
        <SheetDescription className="sr-only">
          Rate your experience shopping with us, and add details if you like.
        </SheetDescription>
        {form && open && (
          <StoreReviewComposer
            form={form}
            mode="sheet"
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

export default StoreReviewComposerSheet;
