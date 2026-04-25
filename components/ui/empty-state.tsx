import React from "react";
import { cn } from "@lib/utils";
import { LottieAnimation } from "./lottie-animation";
import { Button } from "./button";

interface EmptyStateProps {
  animationData?: any;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState = ({
  animationData,
  icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
  className,
  children
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      {animationData && (
        <LottieAnimation
          animationData={animationData}
          width={200}
          height={200}
          className="mb-4"
        />
      )}
      {icon && !animationData && (
        <div className="mb-4 text-muted-foreground">{icon}</div>
      )}
      <h3 className="heading-md mb-2">{title}</h3>
      {description && <p className="body-sm mx-auto max-w-sm">{description}</p>}
      {ctaLabel && (ctaHref || onCtaClick) && (
        <Button
          variant="default"
          className="mt-6"
          onClick={onCtaClick}
          asChild={!!ctaHref}
        >
          {ctaHref ? <a href={ctaHref}>{ctaLabel}</a> : ctaLabel}
        </Button>
      )}
      {children}
    </div>
  );
};
