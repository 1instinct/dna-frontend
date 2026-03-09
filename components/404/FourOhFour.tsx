"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const Lottie = dynamic(() => import("react-lottie"), { ssr: false });

export const FourOhFour = () => {
  // Import animation data only on client
  const girlAnimation = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("../../data/girl.json");
  }, []);

  const animationOptions = useMemo(
    () => ({
      loop: true,
      autoplay: true,
      animationData: girlAnimation,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
      }
    }),
    [girlAnimation]
  );

  return (
    <>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <h1 className="mb-4 font-title text-8xl font-black tracking-tight text-neon-cyan">
          404
        </h1>
        <p className="font-body text-lg text-white/50">
          Whoops, keep looking...
        </p>
      </div>
    </>
  );
};
