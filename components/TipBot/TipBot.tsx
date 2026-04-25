/* eslint-disable react/no-danger */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
// Vendor
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useMediaQuery } from "react-responsive";
import { useSpring, animated } from "react-spring";
import TypistModule from "react-typist";
const Typist = (TypistModule as any).default || TypistModule;
import parse from "html-react-parser";
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
    <div className="relative -top-[120px] left-0 sm:-top-[130px]">
      {isMobile ? (
        <div
          className={cn(
            "absolute bottom-[-90px] left-[68px] flex items-center justify-around bg-card text-foreground shadow-[5px_8px_20px_rgba(0,0,0,0.25)] transition-all duration-300 ease-in-out",
            "before:absolute before:bottom-0 before:left-[-6px] before:h-[16px] before:w-[16px] before:rounded-full before:bg-card before:content-['']",
            "after:absolute after:bottom-[-5px] after:left-[-18px] after:h-[8px] after:w-[8px] after:rounded-full after:bg-card after:content-['']",
            speechReady
              ? "h-auto w-auto rounded-[20px] px-3.5 py-2.5 text-sm"
              : "h-10 w-20 rounded-[36px]"
          )}
        >
          {speechReady ? (
            <animated.div
              style={speechProps}
              dangerouslySetInnerHTML={speech}
            />
          ) : (
            <>
              <div className="ml-3 h-3 w-3 animate-pulse rounded-full bg-muted-foreground" />
              <div className="h-3 w-3 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.25s]" />
              <div className="mr-3 h-3 w-3 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.5s]" />
            </>
          )}
        </div>
      ) : (
        <div className="relative mb-1 rounded-lg bg-muted/50 p-4 after:absolute after:-bottom-3 after:left-20 after:block after:h-0 after:w-0 after:border-x-[10px] after:border-t-[12px] after:border-x-transparent after:border-t-muted/50 after:content-['']">
          <div className="text-left text-base font-light text-foreground">
            <Typist
              avgTypingDelay={50}
              stdTypingDelay={80}
              startDelay={1100}
              onTypingDone={() => console.log("typed in")}
            >
              {parse(speech.__html)}
            </Typist>
          </div>
        </div>
      )}
      <div className="relative bottom-5 left-1/2 -ml-6 h-12 w-12 rounded-full bg-[url('/tip-bot.png')] bg-[length:48px_48px] bg-no-repeat shadow-[0px_2px_8px_rgba(0,0,0,0.33)] sm:absolute sm:bottom-[-100px] sm:left-10 sm:ml-0" />
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
