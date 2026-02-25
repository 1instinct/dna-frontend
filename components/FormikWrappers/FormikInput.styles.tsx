import React from "react";
import { Field } from "formik";
import { cn } from "@lib/utils";

const inputClass =
  "w-full rounded-lg border-2 border-dashed border-border bg-background px-3 py-2.5 font-body text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

export const BasicField = React.forwardRef<any, any>(
  ({ className, invalid, ...props }, ref) => (
    <Field
      ref={ref}
      className={cn(inputClass, invalid && "border-destructive", className)}
      {...props}
    />
  )
);
BasicField.displayName = "BasicField";

export const Error = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-1 text-left font-body text-xs font-bold text-destructive",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const HiddenInput = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("hidden", className)} {...props}>
    {children}
  </div>
);

export const SuggestionWrapper = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "absolute z-[1] mt-[54px] flex min-w-[250px] max-w-[500px] flex-col items-start justify-center overflow-scroll rounded border-2 border-dashed border-border bg-background shadow-[1px_3px_30px_rgba(0,0,0,0.23)] transition-all sm:justify-start sm:pb-16 sm:pt-5",
      className
    )}
    style={{ maxHeight: 200, width: "100%" }}
    {...props}
  >
    {children}
  </div>
);

export const SuggestionLoader = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mx-auto", className)} {...props}>
    {children}
  </div>
);

export const SuggestionItem = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "w-full self-start bg-background px-2.5 py-1 text-left text-foreground",
      "[&.active]:cursor-pointer [&.active]:text-brand [&.active]:bg-muted",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const TermsCheckbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { accepted?: boolean }
>(({ className, accepted, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      "h-5 w-5 flex-shrink-0 cursor-pointer rounded border-2 accent-brand",
      accepted ? "border-brand" : "border-destructive",
      className
    )}
    {...props}
  />
));
TermsCheckbox.displayName = "TermsCheckbox";

export const Wrapper = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4", className)} {...props}>
    {children}
  </div>
);
