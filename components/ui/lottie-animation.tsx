"use client";
import React, { useEffect, useRef, useState } from "react";
import type { LottiePlayer } from "lottie-web";
import { cn } from "@lib/utils";

interface LottieAnimationProps {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const LottieAnimation = ({
  animationData,
  loop = true,
  autoplay = true,
  width = 200,
  height = 200,
  className,
  style
}: LottieAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);
  const [lottie, setLottie] = useState<LottiePlayer | null>(null);

  useEffect(() => {
    import("lottie-web").then((mod) => setLottie(mod.default || mod));
  }, []);

  useEffect(() => {
    if (lottie && containerRef.current && animationData) {
      animationRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop,
        autoplay,
        animationData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice"
        }
      });

      return () => {
        animationRef.current?.destroy();
        animationRef.current = null;
      };
    }
  }, [lottie, animationData, loop, autoplay]);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none", className)}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style
      }}
    />
  );
};
