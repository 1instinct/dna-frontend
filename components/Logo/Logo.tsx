import React from "react";

import { AnimatedLogo } from "./AnimatedLogo";

export const Logo = ({
  hasBlob,
  isDark,
  animated = false,
  showTagline = false
}: any) => {
  if (animated) {
    return (
      <div className="w-[90%] h-auto -mt-[100px] sm:w-auto sm:h-[240px] [&_svg]:w-full [&_svg]:h-auto sm:[&_svg]:w-auto sm:[&_svg]:h-[240px]">
        <AnimatedLogo showTagline={showTagline} />
      </div>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="w-[90%] h-auto -mt-[100px] sm:w-auto sm:h-[240px]"
        src={process.env.NEXT_PUBLIC_LOGO_PATH}
        alt=""
      />
    </>
  );
};
