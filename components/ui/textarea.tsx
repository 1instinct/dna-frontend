import * as React from "react";
import { cn } from "@lib/utils";

// Same shape as InputProps in ./input; kept as an interface for extension.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[96px] w-full resize-y border-b-2 border-dashed border-foreground/30 bg-transparent px-1 py-2 font-body text-body-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-brand focus:border-solid focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/30 dark:focus:border-brand",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
