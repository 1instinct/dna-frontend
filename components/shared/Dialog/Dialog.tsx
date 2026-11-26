import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@lib/utils";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

// Built on Radix: it traps focus inside the dialog, returns it to the trigger on close, closes
// on Escape and outside clicks, locks page scroll and labels the dialog with its title.
export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  className
}) => (
  <DialogPrimitive.Root
    open={isOpen}
    onOpenChange={(open) => {
      if (!open) onClose();
    }}
  >
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[10000] bg-black/75 animate-fade-in" />
      <div className="pointer-events-none fixed inset-0 z-[10000] flex items-center justify-center">
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "pointer-events-auto relative mx-4 max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-xl border border-border/30 bg-card shadow-2xl animate-fade-up focus:outline-none",
            className
          )}
        >
          {title ? (
            <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
              <DialogPrimitive.Title className="font-title text-lg font-semibold text-foreground">
                {title}
              </DialogPrimitive.Title>
              {showCloseButton && <CloseButton />}
            </div>
          ) : (
            <>
              {/* Every dialog needs an accessible name, even without a visible title. */}
              <DialogPrimitive.Title className="sr-only">
                Dialog
              </DialogPrimitive.Title>
              {showCloseButton && (
                <div className="flex justify-end border-b border-border/30 px-6 py-4">
                  <CloseButton />
                </div>
              )}
            </>
          )}
          <div className="p-6">{children}</div>
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);

const CloseButton = () => (
  <DialogPrimitive.Close
    aria-label="Close"
    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-2xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <span aria-hidden="true">&times;</span>
  </DialogPrimitive.Close>
);
