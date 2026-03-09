import React, { useId } from "react";

interface AnimatedLogoProps {
  showTagline?: boolean;
  className?: string;
  animate?: boolean;
  variant?: "default" | "outline";
}

// Per-letter bob stagger — each letter bobs at a slightly different speed/delay
const letterBobConfig = [
  { duration: 1900, delay: 0 },
  { duration: 2100, delay: 150 },
  { duration: 2300, delay: 300 },
  { duration: 2000, delay: 100 },
  { duration: 2200, delay: 250 },
  { duration: 1800, delay: 400 }
];

// Filled letter paths only (construction guide lines excluded for clean rendering)
const letterPaths = [
  {
    d: "M142.8,69c2.9-2.4,5.7-4.8,4.7-8.2c-4.3-15.2-20.1-24.1-35.3-19.8C97,45.3,88.1,61.1,92.4,76.3c4.3,15.2,20.1,24.1,35.3,19.8c9.3-2.6,23.1-6.5,10.1-21.2C138.6,72.5,140.7,70.7,142.8,69z M122.8,57.1c-1.8,0.5-3.7-0.6-4.2-2.5s0.5-3.8,2.3-4.3c1.8-0.5,3.7,0.6,4.2,2.5C125.7,54.7,124.6,56.6,122.8,57.1z"
  },
  {
    d: "M98.9,65.9c-2.2-7.2-14-12.4-22.5-9.7c19.8-6.1,11-34.6-22-24.4c-18.2,5.6-28.4,25-22.8,43.3s25,28.6,43.2,22.9C93,92.4,104.5,84.2,98.9,65.9z M63.7,47.7c0.7,2.3,3,3.6,5.2,2.9c2.2-0.7,3.4-3.1,2.7-5.3c-0.7-2.3-3-3.6-5.2-2.9C64.2,43.1,63,45.4,63.7,47.7z M77,76.8c-2.2,0.7-4.5-0.5-5.1-2.7c-0.7-2.2,0.5-4.5,2.7-5.1c2.2-0.7,4.5,0.5,5.1,2.7C80.4,73.9,79.2,76.2,77,76.8z"
  },
  {
    d: "M192.9,55.9c1.9-3.2,3.8-6.4,1.8-9.3c-9-13-26.8-16.2-39.8-7.2s-16.2,26.8-7.2,39.8s26.8,16.2,39.8,7.2c7.9-5.5,19.7-13.7,2.6-23.4C190.1,60.6,191.5,58.2,192.9,55.9z M170.1,51.2c-1.5,1.1-3.7,0.6-4.8-1c-1.1-1.6-0.8-3.8,0.8-4.9c1.5-1.1,3.7-0.6,4.8,1C172,48,171.7,50.1,170.1,51.2z"
  },
  {
    d: "M288.9,76.1c3.6-1.2,7.1-2.3,7.4-5.9c1.6-15.7-9.8-29.8-25.5-31.4c-15.7-1.6-29.8,9.8-31.4,25.5s9.8,29.8,25.5,31.4c9.6,1,23.9,2.5,17.2-16C283.7,77.9,286.3,77,288.9,76.1z M274.7,57.7c-1.9-0.2-3.2-1.9-3-3.9c0.2-2,1.9-3.4,3.7-3.2c1.9,0.2,3.2,1.9,3,3.9S276.5,57.9,274.7,57.7z"
  },
  {
    d: "M194.5,78c2.3,15.6,13.3,26.9,22.3,25.5c13.3-2,12.1-11.5,11.3-18c-0.4-3.4-0.8-6.1,1.2-6.4c8.5-1.3,20.5-9.4,18.8-20.7S234,43.2,218.4,45.5C202.9,47.8,192.2,62.4,194.5,78z M229.1,62.4c-1.9,0.3-3.6-1-3.9-2.9c-0.3-1.9,1-3.6,2.9-3.9c1.9-0.3,3.6,1,3.9,2.9C232.3,60.3,231,62.1,229.1,62.4z"
  },
  {
    d: "M341.4,60.8c2.3-4.7,5.1-10.5,0.1-17.4c-9.3-12.8-24.8-9.6-37.6-0.4s-15.6,27.1-6.4,39.9c6.7,9.3,25.4,17.7,33.3,12c3.1-2.2,2.1-5.1,1.3-7.6c-0.7-2-1.3-3.8,0.3-4.9c1.5-1.1,3.5-0.5,5.8,0.2c3.2,0.9,6.9,1.9,10.7-0.8c7.4-5.3-3.7-12.9-9.5-15.1C339.3,65.1,340.3,63.1,341.4,60.8z M327,54.4c-1.5,1.1-3.7,0.7-4.8-0.9c-1.1-1.6-0.8-3.8,0.7-4.9s3.7-0.7,4.8,0.9C328.9,51.1,328.6,53.3,327,54.4z"
  }
];

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  showTagline = false,
  className,
  animate = true,
  variant = "default"
}) => {
  const isOutline = variant === "outline";
  const viewBox = "-20 -10 425 185";
  // Unique gradient ID per instance to avoid conflicts when multiple logos render
  const gradientId = useId().replace(/:/g, "_");

  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox={viewBox}
      style={{ enableBackground: `new ${viewBox}` } as any}
      xmlSpace="preserve"
      className={className}
    >
      <defs>
        {/* Single horizontal gradient spanning the full SVG width — shared across all letters */}
        <linearGradient
          id={`logoGrad_${gradientId}`}
          x1="0"
          y1="65"
          x2="385"
          y2="65"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#fffb00" />
          <stop offset="100%" stopColor="#ffb300" />
        </linearGradient>
        {/* Big soft pink glow — applied to the background copy only */}
        <filter
          id={`pinkGlow_${gradientId}`}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feFlood floodColor="#FF1493" floodOpacity="0.7" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
          </feMerge>
        </filter>
      </defs>

      {/* Background glow layer — all letters rendered as a single blurred pink group */}
      {!isOutline && (
        <g filter={`url(#pinkGlow_${gradientId})`}>
          {letterPaths.map((letter, index) => {
            const bobConfig = letterBobConfig[index] || {
              duration: 2000,
              delay: 0
            };
            return (
              <path
                key={`glow-${index}`}
                d={letter.d}
                fill={`url(#logoGrad_${gradientId})`}
                fillRule="evenodd"
                clipRule="evenodd"
                style={
                  animate
                    ? {
                        animation: `letter-bob ${bobConfig.duration}ms ease-in-out ${bobConfig.delay}ms infinite both`
                      }
                    : undefined
                }
              />
            );
          })}
        </g>
      )}

      {/* Foreground letter paths — crisp, no filter */}
      {letterPaths.map((letter, index) => {
        const bobConfig = letterBobConfig[index] || {
          duration: 2000,
          delay: 0
        };

        if (isOutline) {
          return (
            <path
              key={index}
              d={letter.d}
              fill="none"
              stroke="white"
              strokeWidth="1"
              fillRule="evenodd"
              clipRule="evenodd"
              vectorEffect="non-scaling-stroke"
            />
          );
        }

        return (
          <path
            key={index}
            d={letter.d}
            fill={`url(#logoGrad_${gradientId})`}
            stroke="#4c1d95"
            strokeWidth="3"
            strokeDasharray="56 5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fillRule="evenodd"
            clipRule="evenodd"
            style={
              animate
                ? {
                    animation: `letter-bob ${bobConfig.duration}ms ease-in-out ${bobConfig.delay}ms infinite both`
                  }
                : undefined
            }
          />
        );
      })}

      {/* Tagline "PLAY WITH MUSIC" */}
      {showTagline && (
        <text
          x="192.5"
          y="118"
          textAnchor="middle"
          fill="white"
          fontFamily="'IBM Plex Mono', 'ibmplexmono_body_mono_semibold', monospace"
          fontSize="12"
          letterSpacing="0.15em"
          style={{ textTransform: "uppercase" } as any}
        >
          PLAY WITH MUSIC
        </text>
      )}
    </svg>
  );
};
