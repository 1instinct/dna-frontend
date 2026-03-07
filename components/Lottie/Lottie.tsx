"use client";
import React, { useEffect, useRef } from "react";

export const Lottie = ({
  animationOptions = {
    data: null,
    loop: true,
    autoplay: true,
    width: "400px",
    height: "400px",
    className: "",
    style: {}
  }
}: {
  animationOptions?: {
    data: any;
    loop?: boolean;
    autoplay?: boolean;
    width?: string;
    height?: string;
    className?: string;
    style?: React.CSSProperties;
  };
}) => {
  const animationRef = useRef<HTMLDivElement>(null);
  const animationInstance = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !animationRef.current) return;

    let isMounted = true;

    import("lottie-web").then((lottieModule) => {
      if (!isMounted || !animationRef.current) return;

      const lottie = lottieModule.default || lottieModule;
      animationInstance.current = lottie.loadAnimation({
        container: animationRef.current,
        renderer: "svg",
        loop: animationOptions.loop,
        autoplay: animationOptions.autoplay,
        animationData: animationOptions.data,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice",
          className: `lottie-animation ${animationOptions.className}`
        }
      });
    });

    return () => {
      isMounted = false;
      if (animationInstance.current) {
        animationInstance.current.destroy();
        animationInstance.current = null;
      }
    };
  }, [animationOptions]);

  return (
    <div
      ref={animationRef}
      style={{
        pointerEvents: "none",
        width: animationOptions.width,
        height: animationOptions.height,
        ...animationOptions.style
      }}
    />
  );
};
