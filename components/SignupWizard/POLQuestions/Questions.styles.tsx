import React from "react";
import { cn } from "@lib/utils";

export const QuestionWrapper = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("my-4 text-brand", className)} {...props}>
    {children}
  </div>
);

export const InputGroupWrapper = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "-mt-32 mx-4 mb-4 text-center",
      "[&_[data-qa='title']]:text-[1.6rem] [&_[data-qa='title']]:text-foreground",
      "[&_.carousel_.thumbs-wrapper]:hidden",
      "[&_.carousel_.slide]:bg-transparent [&_.carousel_.slide]:pb-5",
      "[&_.carousel_.control-dots]:p-0",
      "[&_.carousel_.control-dots_.dot]:h-[5px] [&_.carousel_.control-dots_.dot]:w-[5px] [&_.carousel_.control-dots_.dot]:bg-foreground [&_.carousel_.control-dots_.dot]:shadow-none [&_.carousel_.control-dots_.dot:focus]:outline-none",
      "[&_.carousel_.control-dots_.dot.selected]:bg-white [&_.carousel_.control-dots_.dot.selected]:shadow-[0_0_0_7px_hsl(var(--brand))]",
      "sm:mx-auto sm:pt-8",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const InputWrapper = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mx-6 my-2.5 flex flex-col text-left",
      "[&_.MuiFormControl-root.MuiTextField-root]:w-full",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const Title = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1 className={cn("mx-4 mb-4 mt-1 text-brand", className)} {...props}>
    {children}
  </h1>
);

export const Subtitle = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("mx-4 my-1 text-brand", className)} {...props}>
    {children}
  </h3>
);

export const Description = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("mx-4 mb-6 mt-1 text-muted-foreground", className)}
    {...props}
  >
    {children}
  </p>
);

export const LinkOut = ({
  children,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a className={cn("[&_button]:mx-auto", className)} {...props}>
    {children}
  </a>
);

export const TermsWrapper = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-row flex-nowrap items-start overflow-hidden px-6",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const Term = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-row flex-nowrap items-start", className)}
    {...props}
  >
    {children}
  </div>
);

export const TermsStatement = ({
  children,
  className,
  accepted,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & { accepted?: boolean }) => (
  <p
    className={cn(
      "m-0 max-w-[420px] basis-full overflow-y-scroll text-left text-[0.7rem]",
      accepted ? "text-brand" : "text-destructive",
      "[&_button]:cursor-pointer [&_button]:contents [&_button]:text-[0.7rem] [&_button]:font-bold [&_button]:underline",
      accepted ? "[&_button]:text-brand" : "[&_button]:text-destructive",
      "sm:basis-1/2",
      className
    )}
    {...props}
  >
    {children}
  </p>
);

export const StyledModalContent = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mx-auto my-10 h-full max-w-[50%] overflow-y-scroll bg-card",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
