import React from "react";
import { cn } from "@lib/utils";

export const FadeIn = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-fade-in", className)} {...props}>
    {children}
  </div>
);

export const FadeInOut = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-fade-in-out", className)} {...props}>
    {children}
  </div>
);

export const SlideOutLeft = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-slide-out-left", className)} {...props}>
    {children}
  </div>
);

export const SlideInLeft = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("animate-slide-in-left", className)} {...props}>
    {children}
  </div>
);
