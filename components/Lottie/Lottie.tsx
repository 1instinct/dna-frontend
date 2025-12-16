"use client";
import React, { useEffect, useRef, useState } from "react";
import type { LottiePlayer } from 'lottie-web';

export const Lottie = ({
  animationOptions = {
    data: null,
    loop: true,
    autoplay: true,
    width: "400px",
    height: "400px",
    className: "",
    style: {},
  },
}: {
  animationOptions?: {
    data: any;
    loop?: boolean;
    autoplay?: boolean;
    width?: string;
    height?: string;
    className?: string;
    style?: React.CSSProperties;
  }
}) => {
  const animationRef = useRef<HTMLDivElement>(null);
  const animationInstance = useRef<any>(null); // Use any to avoid TypeScript issues with AnimationItem

  const [lottie, setLottie] = useState<LottiePlayer | null>(null);

  useEffect(() => {
    import('lottie-web').then((Lottie) => setLottie(Lottie.default || Lottie));
  }, []);

  useEffect(() => {
    if (lottie && animationRef.current) {
      const animation = lottie.loadAnimation({
        container: animationRef.current,
        renderer: "svg",
        loop: animationOptions.loop,
        autoplay: animationOptions.autoplay,
        animationData: animationOptions.data,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice",
          className: `lottie-animation ${animationOptions.className}`,
        },
      });

      return () => {
        if (animationInstance.current) {
          animationInstance.current.destroy();
          animationInstance.current = null;
        }
      };
    }
  }, [lottie, animationOptions]);

  return (
    <div
      ref={animationRef}
      style={{
        pointerEvents: "none",
        width: animationOptions.width,
        height: animationOptions.height,
        ...animationOptions.style,
      }}
    />
  );
}