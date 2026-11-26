import React, { useEffect, useId, useState } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea
} from "@components/ui";
import { cn } from "@lib/utils";
import { REPORT_REASONS, reviewErrorMessage } from "@lib/reviews";
import { useReportReview } from "@hooks/useReviews";
import type { ReportReason } from "../../types/reviews";

interface ReportReviewDialogProps {
  reviewId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReported: () => void;
}

const DETAILS_MAX = 1000;

/** Reason picker + optional details for `POST /reports` (review target). */
export const ReportReviewDialog = ({
  reviewId,
  open,
  onOpenChange,
  onReported
}: ReportReviewDialogProps) => {
  const uid = useId();
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const report = useReportReview();

  useEffect(() => {
    if (!open) return;
    setReason("");
    setDetails("");
    setError(null);
  }, [open]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reason) {
      setError("Choose a reason.");
      return;
    }
    setError(null);
    try {
      await report.mutateAsync({ reviewId, reason, details });
      onReported();
      onOpenChange(false);
    } catch (err) {
      setError(reviewErrorMessage(err, "report"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <form onSubmit={submit} className="grid gap-5" noValidate>
          <DialogHeader>
            <DialogTitle className="font-title !text-base uppercase tracking-[0.12em]">
              Report this review
            </DialogTitle>
            <DialogDescription className="font-body text-sm text-muted-foreground">
              Tell us what&apos;s wrong. Our team reviews every report.
            </DialogDescription>
          </DialogHeader>

          <fieldset className="m-0 grid gap-1 border-0 p-0">
            <legend
              id={`${uid}-reason`}
              className="mb-2 font-title text-[11px] leading-4 uppercase tracking-[0.15em] text-foreground/70"
            >
              Reason
            </legend>
            <RadioGroupPrimitive.Root
              value={reason}
              onValueChange={(value) => {
                setReason(value as ReportReason);
                setError(null);
              }}
              aria-labelledby={`${uid}-reason`}
              aria-required
              className="grid gap-0.5"
            >
              {REPORT_REASONS.map((item) => {
                const itemId = `${uid}-${item.value}`;
                return (
                  <div key={item.value} className="flex items-center">
                    <RadioGroupPrimitive.Item
                      id={itemId}
                      value={item.value}
                      className={cn(
                        "peer flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 data-[state=checked]:border-brand"
                      )}
                    >
                      <RadioGroupPrimitive.Indicator className="h-2.5 w-2.5 rounded-full bg-brand" />
                    </RadioGroupPrimitive.Item>
                    <label
                      htmlFor={itemId}
                      className="flex min-h-[44px] flex-1 cursor-pointer items-center pl-3 font-body text-sm text-foreground"
                    >
                      {item.label}
                    </label>
                  </div>
                );
              })}
            </RadioGroupPrimitive.Root>
          </fieldset>

          <div className="grid gap-1">
            <Label htmlFor={`${uid}-details`} className="text-[11px] leading-4">
              Details (optional)
            </Label>
            <Textarea
              id={`${uid}-details`}
              value={details}
              maxLength={DETAILS_MAX}
              rows={3}
              onChange={(event) => setDetails(event.target.value)}
            />
          </div>

          <div aria-live="assertive">
            {error && (
              <p role="alert" className="m-0 font-body text-sm text-red">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-[44px] rounded-full"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-h-[44px] rounded-full text-black"
              disabled={report.isLoading}
            >
              {report.isLoading ? "Sending…" : "Send report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportReviewDialog;
