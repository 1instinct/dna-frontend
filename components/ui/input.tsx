import * as React from "react";
import { cn } from "@lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full border-b-2 border-dashed border-foreground/30 bg-transparent px-1 py-2 font-body text-body-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-brand focus:border-solid focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/30 dark:focus:border-brand",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
