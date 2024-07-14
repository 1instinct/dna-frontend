// Vendor
import React, { useCallback } from "react";
import styled from "@emotion/styled";
// import { Field, useFormikContext } from 'formik';
// import { useMediaQuery } from 'react-responsive';
import { Carousel } from "react-responsive-carousel";

// Local
import TipBot from "../../TipBot";
import {
  QuestionWrapper,
  InputGroupWrapper,
  Title,
  Description
} from "./Questions.styles";

interface GenericThemeType {
  theme?: any;
}

export const ColorizedFinance = styled.i<GenericThemeType>`
  ${"" /* transform: scale(2); */}
  & svg {
    width: 5rem;
    height: 5rem;
  }
  & svg g path:first-of-type {
    fill: ${(props) => props.theme.colors.brand.primary};
  }
`;

export const ColorizedCalendar = styled.i<GenericThemeType>`
  ${"" /* transform: scale(2); */}
  & svg {
    width: 5rem;
    height: 5rem;
  }
  & svg g path:first-of-type {
    fill: ${(props) => props.theme.colors.brand.primary};
  }
`;

export const ColorizedLoan = styled.i<GenericThemeType>`
  ${"" /* transform: scale(2); */}
  & svg {
    width: 5rem;
    height: 5rem;
  }
  & svg g path:first-of-type {
    fill: ${(props) => props.theme.colors.brand.primary};
  }
`;

export const ColorizedCart = styled.i<GenericThemeType>`
  ${"" /* transform: scale(2); */}
  & svg {
    width: 5rem;
    height: 5rem;
  }
  & svg g path:first-of-type {
    fill: ${(props) => props.theme.colors.brand.primary};
  }
`;

const partnerName = process.env.NEXT_PUBLIC_SITE_TITLE;

export const GetPreQualified = () => {
  // const { errors, touched } = useFormikContext();

  const speechMarkup = useCallback(() => {
    return {
      __html: `Welcome from <strong>${partnerName}</strong>!<br /> Create your account, and you'll be surfing the latest trends in no-time.`
    };
  }, []);

  return (
    <QuestionWrapper>
      <TipBot speech={speechMarkup()} />
      <InputGroupWrapper>
        <Carousel
          autoPlay
          swipeable
          infiniteLoop
          showArrows={false}
          showStatus={false}
          showThumbs={false}
        >
          <div>
            <ColorizedCalendar className="bts bt-calendar" />
            <Title>Free Shipping</Title>
            <Description>(On your first order)</Description>
          </div>
          <div>
            <ColorizedLoan className="bts bt-folder" />
            <Title>Keep Items Organized</Title>
            <Description>Save favorites!</Description>
          </div>
          <div>
            <ColorizedCart className="bts bt-shopping-cart" />
            <Title>Easy Checkout</Title>
            <Description>We accept all payment methods.</Description>
          </div>
        </Carousel>
      </InputGroupWrapper>
    </QuestionWrapper>
  );
};
