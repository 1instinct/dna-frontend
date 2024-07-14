/* eslint-disable react/no-danger */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
// Vendor
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useMediaQuery } from "react-responsive";
// import { useSpring, useTransition, config, animated } from 'react-spring';
import { useSpring, animated } from "react-spring";
import Typist from "react-typist";
import parse from "html-react-parser";

// Local
// import { FadeIn } from '../Animations';
import {
  TipBotWrapper,
  TipBotImage,
  BubbleWrapper,
  BubbleWrapperMobile,
  BubbleSpeech,
  BubbleDot
} from "./TipBot.styles";

const TipBot = ({ speech }: any) => {
  const [speechReady, setSpeechStatus] = useState(false);
  // const [show, set] = useState(false);

  const speechProps = useSpring({
    config: { duration: 800 },
    opacity: speechReady ? 1 : 0
  });

  // const bubbleProps = useTransition(show, null, {
  //   config: config.stiff,
  //   from: { opacity: 0 },
  //   enter: { opacity: 1 },
  //   leave: { opacity: 0 },
  // });

  const isMobile = useMediaQuery({
    // query: `(min-device-width: ${props => props.theme.breakpoints.values.lg}px)`
    query: `(max-device-width: 768px)`
  });

  useEffect(() => {
    // setTimeout(setSpeechStatus(s => !s), 1500);
    setTimeout(() => {
      setSpeechStatus(true);
    }, 1500);
  });

  return (
    <TipBotWrapper>
      {isMobile ? (
        <BubbleWrapperMobile speechReady={speechReady}>
          {speechReady ? (
            <animated.div
              style={speechProps}
              dangerouslySetInnerHTML={speech}
            />
          ) : (
            <>
              {/* <animated.div key={1} style={bubbleProps}>
                <BubbleDot />
              </animated.div> */}
              <BubbleDot />
              <BubbleDot />
              <BubbleDot />
            </>
          )}
        </BubbleWrapperMobile>
      ) : (
        <BubbleWrapper>
          <BubbleSpeech>
            <Typist
              avgTypingDelay={50}
              stdTypingDelay={80}
              startDelay={1100}
              onTypingDone={() => console.log("typed in")}
            >
              {parse(speech.__html)}
            </Typist>
          </BubbleSpeech>
        </BubbleWrapper>
      )}
      <TipBotImage />
    </TipBotWrapper>
  );
};

TipBot.propTypes = {
  speech: PropTypes.shape({ __html: PropTypes.string.isRequired })
};

TipBot.defaultProps = {
  speech: ""
};

export default TipBot;
