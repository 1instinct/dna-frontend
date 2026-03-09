import { useState, useEffect, useRef } from "react";
import { useSpring, animated } from "@react-spring/web";

import { AnimatedLogo } from "../Logo/AnimatedLogo";

// 8 unique SVG blob paths — wilder asymmetry, spiky tendrils, deep concavities
const blobs = [
  // spiky star-like
  "M43.3,-69.7C51.1,-62.3,49,-41.9,53.7,-26.1C58.4,-10.4,69.9,0.6,68.8,10.1C67.8,19.6,54.4,27.5,43.4,34.4C32.4,41.2,24,46.9,14.5,50.1C5,53.4,-5.6,54,-19.9,55.4C-34.2,56.8,-52.3,58.9,-58.2,51C-64.1,43.1,-57.9,25.3,-58.1,9.7C-58.3,-6,-65,-19.4,-65,-34C-65,-48.6,-58.4,-64.5,-46.4,-70C-34.4,-75.6,-17.2,-70.8,0.3,-71.2C17.7,-71.6,35.5,-77.2,43.3,-69.7Z",
  // stretched amoeba
  "M40.8,-63.9C54.3,-54.8,67.7,-45.9,76.2,-33.1C84.6,-20.3,88.1,-3.6,82,9C75.9,21.6,60.1,30,48.3,39.5C36.4,49,28.5,59.6,18.1,63.3C7.8,67,-5,63.9,-19.6,61.8C-34.1,59.7,-50.3,58.7,-59.9,50.4C-69.5,42.1,-72.5,26.5,-73.4,11.4C-74.3,-3.7,-73.2,-18.3,-65.9,-28.3C-58.6,-38.3,-45.1,-43.8,-33.1,-53.6C-21.1,-63.4,-10.5,-77.5,1.6,-80C13.7,-82.4,27.3,-73.1,40.8,-63.9Z",
  // tendril reaching right
  "M36.4,-58.3C45.7,-50.6,51,-38.1,58.4,-25.6C65.9,-13,75.5,-0.4,76.7,13.1C77.9,26.5,70.8,40.9,59.4,48.4C48.1,55.9,32.5,56.7,18.3,59.4C4.2,62.2,-8.5,67.1,-21.3,66.2C-34.1,65.3,-47.1,58.7,-58.1,48.8C-69.1,38.9,-78,25.7,-82.2,10.5C-86.5,-4.7,-85.9,-21.8,-77.9,-34C-69.8,-46.1,-54.3,-53.2,-40.1,-58.7C-25.8,-64.3,-12.9,-68.3,0.3,-68.7C13.5,-69.2,27,-66.1,36.4,-58.3Z",
  // deep concavity bottom
  "M35.1,-51.8C49.7,-45.2,68.6,-42.6,72.9,-33.3C77.3,-23.9,67,-7.9,62,7.1C57,22.1,57.4,36.1,50.9,44.9C44.4,53.7,31.2,57.4,17.4,63.4C3.5,69.4,-10.9,77.7,-24.1,76.4C-37.4,75.1,-49.5,64.3,-59.3,52C-69.1,39.6,-76.6,25.9,-75.7,12.7C-74.9,-0.5,-65.7,-13.2,-58.4,-25.7C-51.2,-38.3,-45.9,-50.7,-36.5,-59.7C-27.1,-68.7,-13.5,-74.3,-1.6,-71.7C10.2,-69.1,20.5,-58.4,35.1,-51.8Z",
  // pinched hourglass
  "M29.3,-48.1C38.6,-39.7,47.3,-33.3,55.5,-23.9C63.8,-14.5,71.7,-2.2,71.7,10.7C71.6,23.5,63.5,36.9,52.2,44.7C41,52.5,26.6,54.8,12.4,59.1C-1.8,63.4,-15.8,69.7,-28.5,67.2C-41.3,64.6,-52.8,53.2,-62.2,40.1C-71.7,27,-79,12.2,-78.1,-1.8C-77.3,-15.8,-68.2,-29.1,-56.9,-38.1C-45.7,-47,-32.2,-51.6,-20.1,-58.2C-8,-64.7,2.6,-73.3,13.1,-72.5C23.5,-71.7,33.7,-61.5,29.3,-48.1Z",
  // wide flat amoeba
  "M44.2,-72.5C55.3,-61.7,61.3,-46.2,67.7,-31.3C74.1,-16.4,80.9,-2,79.5,11.6C78.1,25.2,68.5,38,57,47.8C45.5,57.6,32.2,64.4,17.8,69.2C3.3,74,-12.3,76.8,-25.7,72.3C-39.1,67.8,-50.3,56,-60,43C-69.8,30.1,-78,16,-79.7,0.6C-81.3,-14.7,-76.4,-31.1,-66.2,-42.8C-56.1,-54.5,-40.6,-61.4,-26.3,-70.6C-12,-79.8,1.2,-91.2,14.4,-90C27.5,-88.8,33.1,-83.3,44.2,-72.5Z",
  // spiky cactus
  "M38.9,-66C49.2,-56.4,55.7,-43.8,62.9,-30.9C70.1,-18,77.8,-4.9,77.2,7.8C76.6,20.5,67.5,32.9,56.8,42.2C46.1,51.5,33.7,57.8,20.5,62.4C7.4,67.1,-6.5,70.2,-20.4,68.9C-34.3,67.6,-48.3,61.8,-56.4,51.1C-64.5,40.3,-66.7,24.7,-69.9,8.8C-73.2,-7.1,-77.5,-23.3,-72.3,-36C-67.1,-48.8,-52.4,-58.1,-38,-65.8C-23.6,-73.5,-9.4,-79.5,3.1,-84.5C15.5,-89.4,28.6,-75.6,38.9,-66Z",
  // alien/organic
  "M42.7,-73.1C53.1,-63.5,57.8,-47.7,64.8,-33.1C71.7,-18.5,80.8,-5.1,81.1,8.9C81.4,23,72.9,37.7,61.3,47.5C49.8,57.3,35.2,62.3,20.8,66.6C6.3,70.9,-8,74.6,-22.3,72.4C-36.7,70.3,-51,62.3,-60,50.2C-68.9,38,-72.5,21.7,-72.8,5.6C-73.2,-10.5,-70.3,-26.3,-62.1,-38.1C-53.9,-49.9,-40.5,-57.6,-27.5,-66C-14.4,-74.4,-1.8,-83.5,10.2,-83.2C22.2,-82.8,32.4,-82.7,42.7,-73.1Z"
];

const BLOB_BOX_SHADOW = [
  "0 0 30px rgba(124, 58, 237, 0.6)",
  "0 0 20px rgba(124, 58, 237, 0.7)",
  "0 0 12px rgba(255, 0, 138, 0.6)",
  "0 0 8px rgba(255, 0, 138, 0.7)",
  "0 0 25px rgba(0, 255, 255, 0.4)",
  "0 0 15px rgba(0, 255, 255, 0.3)"
].join(", ");

function pickRandom(exclude: number) {
  let next;
  do {
    next = Math.floor(Math.random() * blobs.length);
  } while (next === exclude);
  return next;
}

export const LogoBlob = ({
  hasBlob,
  isDark,
  isAnimated = false,
  showTagline = false,
  animateLetters = true
}: any) => {
  const [open, toggle] = useState(false);
  const [active, setActive] = useState(false);
  const shapeRef = useRef(0);
  const nextRef = useRef(1);

  const { x } = useSpring({
    config: { duration: 7000 },
    x: active ? 1 : 0
  });

  useEffect(() => {
    const id = setTimeout(() => {
      const nextNext = pickRandom(nextRef.current);
      shapeRef.current = nextRef.current;
      nextRef.current = nextNext;
      setActive((a) => !a);
    }, 7000);
    return () => clearTimeout(id);
  }, [active]);

  useEffect(() => {
    setActive(true);
  }, []);

  const logoPath = process.env.NEXT_PUBLIC_LOGO_PATH || "";

  const blobSvg = (filterId: string, onClick?: () => void) => (
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
      onClick={onClick}
      className={onClick ? "pointer-events-auto" : undefined}
    >
      <defs>
        <filter id={filterId}>
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`} transform="translate(100 100)">
        <animated.path
          stroke="#ff008a"
          strokeWidth="10"
          fill="#7c3aed"
          d={x.to([0, 1], [blobs[shapeRef.current], blobs[nextRef.current]])}
          style={{
            transform: "translate(100, 100)",
            opacity: x.to([0, 0.5, 1], [0.4, 0.28, 0.4]),
            fill: x.to([0, 0.5, 1], ["#7c3aed", "#ff008a", "#7c3aed"])
          }}
        />
      </g>
    </animated.svg>
  );

  if (isAnimated) {
    return (
      <div className="relative flex items-center justify-center">
        {/* Blob behind the logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="rounded-full animate-blob-breathe"
            style={{ filter: "blur(6px)" }}
          >
            {blobSvg("blur-animated", () => setActive((a) => !a))}
          </div>
        </div>
        {/* Logo on top */}
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
        {blobSvg("blur-default", () => setActive((a) => !a))}
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
