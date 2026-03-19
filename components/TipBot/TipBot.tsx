/* eslint-disable react/no-danger */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useMediaQuery } from "react-responsive";
import { useSpring, animated } from "react-spring";
import TypistModule from "react-typist";
const Typist = (TypistModule as any).default || TypistModule;
import parse from "html-react-parser";
import { Bot } from "lucide-react";
import { cn } from "@lib/utils";

const TipBot = ({ speech }: any) => {
  const [speechReady, setSpeechStatus] = useState(false);

  const speechProps = useSpring({
    config: { duration: 800 },
    opacity: speechReady ? 1 : 0
  });

  const isMobile = useMediaQuery({
    query: `(max-device-width: 768px)`
  });

  useEffect(() => {
    setTimeout(() => {
      setSpeechStatus(true);
    }, 1500);
  });

  return (
    <div className="mb-4 flex flex-col items-center gap-3">
      {/* Avatar */}
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-neon-cyan/40 bg-surface-deep shadow-[0_0_12px_rgba(0,255,255,0.25)]">
        <div className="h-full w-full rounded-full bg-[url('/tip-bot.png')] bg-[length:56px_56px] bg-center bg-no-repeat" />
        <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-neon-cyan/60 bg-surface-deep">
          <Bot className="h-3 w-3 text-neon-cyan" />
        </div>
      </div>

      {/* Speech bubble */}
      {isMobile ? (
        <div
          className={cn(
            "relative glass-panel border-neon-cyan/20 text-white shadow-[0_0_10px_rgba(0,255,255,0.08)] transition-all duration-300 ease-in-out",
            speechReady
              ? "w-auto rounded-2xl px-4 py-3 text-sm"
              : "flex h-10 w-20 items-center justify-around rounded-[36px]"
          )}
        >
          {speechReady ? (
            <animated.div
              style={speechProps}
              className="text-center text-sm leading-relaxed text-white/90"
              dangerouslySetInnerHTML={speech}
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-neon-cyan/60" />
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-neon-cyan/60 [animation-delay:0.25s]" />
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-neon-cyan/60 [animation-delay:0.5s]" />
            </div>
          )}
          {/* Speech tail pointing up to avatar */}
          <div className="absolute -top-2 left-1/2 -ml-2 h-0 w-0 border-x-[8px] border-b-[8px] border-x-transparent border-b-[rgba(0,255,255,0.2)]" />
        </div>
      ) : (
        <div className="relative w-full glass-panel border-neon-cyan/20 p-4 shadow-[0_0_10px_rgba(0,255,255,0.08)]">
          <div className="text-center text-base font-light leading-relaxed text-white/90">
            <Typist
              avgTypingDelay={50}
              stdTypingDelay={80}
              startDelay={1100}
              onTypingDone={() => {}}
            >
              {parse(speech.__html)}
            </Typist>
          </div>
          {/* Speech tail pointing up to avatar */}
          <div className="absolute -top-2 left-1/2 -ml-2 h-0 w-0 border-x-[8px] border-b-[8px] border-x-transparent border-b-[rgba(0,255,255,0.2)]" />
        </div>
      )}
    </div>
  );
};

TipBot.propTypes = {
  speech: PropTypes.shape({ __html: PropTypes.string.isRequired })
};

TipBot.defaultProps = {
  speech: ""
};

export default TipBot;
