import { useState, useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";

import { AnimatedLogo } from "../Logo/AnimatedLogo";

const BLOB_BOX_SHADOW = [
  "0 0 30px rgba(124, 58, 237, 0.25)",
  "0 0 20px rgba(124, 58, 237, 0.3)",
  "0 0 12px rgba(255, 0, 138, 0.25)",
  "0 0 8px rgba(255, 0, 138, 0.3)"
].join(", ");

const blob1 =
  "M43.3,-69.7C51.1,-62.3,49,-41.9,53.7,-26.1C58.4,-10.4,69.9,0.6,68.8,10.1C67.8,19.6,54.4,27.5,43.4,34.4C32.4,41.2,24,46.9,14.5,50.1C5,53.4,-5.6,54,-19.9,55.4C-34.2,56.8,-52.3,58.9,-58.2,51C-64.1,43.1,-57.9,25.3,-58.1,9.7C-58.3,-6,-65,-19.4,-65,-34C-65,-48.6,-58.4,-64.5,-46.4,-70C-34.4,-75.6,-17.2,-70.8,0.3,-71.2C17.7,-71.6,35.5,-77.2,43.3,-69.7Z";
const blob2 =
  "M40.8,-63.9C54.3,-54.8,67.7,-45.9,76.2,-33.1C84.6,-20.3,88.1,-3.6,82,9C75.9,21.6,60.1,30,48.3,39.5C36.4,49,28.5,59.6,18.1,63.3C7.8,67,-5,63.9,-19.6,61.8C-34.1,59.7,-50.3,58.7,-59.9,50.4C-69.5,42.1,-72.5,26.5,-73.4,11.4C-74.3,-3.7,-73.2,-18.3,-65.9,-28.3C-58.6,-38.3,-45.1,-43.8,-33.1,-53.6C-21.1,-63.4,-10.5,-77.5,1.6,-80C13.7,-82.4,27.3,-73.1,40.8,-63.9Z";
const blob3 =
  "M36.4,-58.3C45.7,-50.6,51,-38.1,58.4,-25.6C65.9,-13,75.5,-0.4,76.7,13.1C77.9,26.5,70.8,40.9,59.4,48.4C48.1,55.9,32.5,56.7,18.3,59.4C4.2,62.2,-8.5,67.1,-21.3,66.2C-34.1,65.3,-47.1,58.7,-58.1,48.8C-69.1,38.9,-78,25.7,-82.2,10.5C-86.5,-4.7,-85.9,-21.8,-77.9,-34C-69.8,-46.1,-54.3,-53.2,-40.1,-58.7C-25.8,-64.3,-12.9,-68.3,0.3,-68.7C13.5,-69.2,27,-66.1,36.4,-58.3Z";
const blob4 =
  "M35.1,-51.8C49.7,-45.2,68.6,-42.6,72.9,-33.3C77.3,-23.9,67,-7.9,62,7.1C57,22.1,57.4,36.1,50.9,44.9C44.4,53.7,31.2,57.4,17.4,63.4C3.5,69.4,-10.9,77.7,-24.1,76.4C-37.4,75.1,-49.5,64.3,-59.3,52C-69.1,39.6,-76.6,25.9,-75.7,12.7C-74.9,-0.5,-65.7,-13.2,-58.4,-25.7C-51.2,-38.3,-45.9,-50.7,-36.5,-59.7C-27.1,-68.7,-13.5,-74.3,-1.6,-71.7C10.2,-69.1,20.5,-58.4,35.1,-51.8Z";

export const LogoBlob = ({
  hasBlob,
  isDark,
  isAnimated = false,
  showTagline = false,
  animateLetters = true
}: any) => {
  const [open, toggle] = useState(false);
  const [active, setActive] = useState(false);

  const { x } = useSpring({
    config: {
      duration: 16000
    },
    x: active ? 1 : 0
  });

  useEffect(() => {
    const id = setTimeout(() => {
      setActive(!active);
    }, 16000);

    return () => clearTimeout(id);
  }, [active]);

  useEffect(() => {
    setActive(true);
  }, []);

  const logoPath = process.env.NEXT_PUBLIC_LOGO_PATH || "";

  if (isAnimated) {
    return (
      <div className="relative flex items-center justify-center">
        {/* Blob behind the logo — absolutely centered via inset-0 + m-auto */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="rounded-full animate-blob-breathe"
            style={{
              filter: "blur(6px)"
            }}
          >
            <animated.svg
              style={{ position: "relative", display: "block" }}
              xmlns="http://www.w3.org/2000/svg"
              fillRule="evenodd"
              clipRule="evenodd"
              imageRendering="optimizeQuality"
              shapeRendering="geometricPrecision"
              textRendering="geometricPrecision"
              version="1.1"
              viewBox="0 0 200 200"
              height="220px"
              width="220px"
              onClick={() => setActive(!active)}
              className="pointer-events-auto"
            >
              <g transform="translate(100 100)">
                <animated.path
                  stroke="#ff008a"
                  strokeWidth="10"
                  fill="#7c3aed"
                  d={x.to({
                    range: [0, 0.33, 0.66, 1],
                    output: [blob1, blob2, blob3, blob4]
                  })}
                  style={{
                    transform: "translate(100, 100)"
                  }}
                />
              </g>
            </animated.svg>
          </div>
        </div>
        {/* Logo on top — z-10 */}
        <div
          className="relative z-10 w-[90%] h-auto sm:w-auto sm:h-[160px] [&_svg]:w-full [&_svg]:h-auto sm:[&_svg]:w-auto sm:[&_svg]:h-[160px]"
          onClick={() => toggle(!open)}
        >
          <AnimatedLogo showTagline={showTagline} animate={animateLetters} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="absolute -mt-[100px] sm:-mt-[200px] rounded-full animate-blob-breathe"
        style={{ boxShadow: BLOB_BOX_SHADOW }}
      >
        <animated.svg
          style={{ position: "relative" }}
          xmlns="http://www.w3.org/2000/svg"
          fillRule="evenodd"
          clipRule="evenodd"
          imageRendering="optimizeQuality"
          shapeRendering="geometricPrecision"
          textRendering="geometricPrecision"
          version="1.1"
          viewBox="0 0 200 200"
          height="220px"
          width="220px"
          onClick={() => setActive(!active)}
        >
          <g transform="translate(100 100)">
            <animated.path
              stroke="#ff008a"
              strokeWidth="10"
              fill="#7c3aed"
              d={x.to({
                range: [0, 0.33, 0.66, 1],
                output: [blob1, blob2, blob3, blob4]
              })}
              style={{
                transform: "translate(100, 100)"
              }}
            />
          </g>
        </animated.svg>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="w-[90%] h-auto -mt-10 relative sm:w-auto sm:h-[160px]"
        src={logoPath}
        alt=""
        onClick={() => toggle(!open)}
      />
    </>
  );
};
