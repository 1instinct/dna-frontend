import { Button } from "@components/shared/Button";
import styled from "@emotion/styled";
import { Form } from "formik";

interface GenericThemeType {
  theme?: any;
}

export const MainWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-flow: column nowrap;
  padding: 0 0 80px 0;
`;

export const InitialTitle = styled.div`
  box-sizing: border-box;
  color: ${(props) =>
    props.theme.isDarkMode
      ? props.theme.colors.white.primary
      : props.theme.colors.black.primary};
  font-size: 2rem;
  font-weight: 900;
  text-transform: uppercase;
  text-align: center;
  padding: 40px 0 15px;
  position: absolute;
  margin-top: -290px;
`;

export const Title = styled.div`
  box-sizing: border-box;
  color: ${(props) =>
    props.theme.isDarkMode
      ? props.theme.colors.white.primary
      : props.theme.colors.black.primary};
  font-size: 2rem;
  font-weight: 900;
  text-transform: uppercase;
  text-align: center;
  margin: 40px 0 20px 0;
`;

export const Subtitle = styled.div`
  box-sizing: border-box;
  color: ${(props) =>
    props.theme.isDarkMode
      ? props.theme.colors.white.primary
      : props.theme.colors.black.primary};
  font-size: 1.2rem;
  text-align: center;
  padding: 20px 0 15px;
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  margin: 0 10%;
  padding: 20px;

  @media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
    flex-flow: column nowrap;
    margin: 0 5%;
  }

  @media (min-width: ${(props) => props.theme.breakpoints.values.lg}px) {
  }
`;

interface SignupFormWrapperType {
  theme?: any;
}

export const SignupFormWrapper = styled(Form)<SignupFormWrapperType>`
  padding: 20px 15px;
  ${"" /* margin-top: 225px; */}
  background: ${(props) =>
    props.theme.isDarkMode
      ? props.theme.colors.black.light
      : props.theme.colors.white.primary};
  color: ${(props) =>
    props.theme.isDarkMode
      ? props.theme.colors.white.primary
      : props.theme.colors.black.primary};
  border-radius: 8px;
  box-shadow: 0px 22px 33px rgba(0, 0, 0, 0.066);
  width: 80%;
  & [data-qa="title"] {
    color: ${(props) => props.theme.colors.brand.primary};
    font-size: 1.6rem;
  }

  @media (max-width: ${(props) =>
      props.theme.breakpoints.values.sm}px) and (orientation: portrait) {
    margin-top: 225px;
  }

  /* iPad Mini 4 --------------- */
  @media only screen and (min-device-width: ${(props) =>
      props.theme.breakpoints.values.sm}px) and (max-device-width: ${(props) =>
      props.theme.breakpoints.values
        .md}px) and (orientation: portrait) and (-webkit-min-device-pixel-ratio: 1) {
    margin-top: 165px;
  }

  @media (min-width: ${(props) =>
      props.theme.breakpoints.values.sm}px) and (max-width: ${(props) =>
      props.theme.breakpoints.values.md}px) {
    margin-top: 165px;
  }

  @media (min-width: ${(props) => props.theme.breakpoints.values.md}px) {
    margin-top: 165px;
  }

  @media (min-width: ${(props) => props.theme.breakpoints.values.lg}px) {
    margin-top: 165px;
  }
`;

export const SignupActions = styled.div`
  margin: 0 10px 0 10px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  padding: 0 15px 5px 15px;
  text-align: center;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;

  & .BtcsS {
    display: none;
  }

  @media (min-width: ${(props) => props.theme.breakpoints.values.sm}px) {
    margin: 0 25px 0 25px;
  }
`;

interface PreviousButtonType {
  ghost?: boolean;
}

export const PreviousButton = styled(Button)<PreviousButtonType>`
  flex-basis: 30%;
  flex-grow: 1;
  margin-right: 0.5rem !important;
`;

export const NextButton = styled(Button)`
  background: ${(p) => p.theme.colors.brand.primary} !important;
  margin-left: 0.5rem !important;
  flex-basis: 70%;
  flex-grow: 2;
`;

export const SkipAction = styled.div<GenericThemeType>`
  margin: 7px 0 15px 0;
  padding: 0 15px 15px 15px;
  display: flex;
  justify-content: center;
  & button {
    width: 100%;
    color: ${(props) =>
      props.theme.isDarkMode
        ? props.theme.colors.white.primary
        : props.theme.colors.black.primary};
    text-transform: capitalize;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
  }
`;

export const LoginAction = styled.div<GenericThemeType>`
  margin: 7px 0 15px 0;
  padding: 0 15px 15px 15px;
  display: flex;
  justify-content: center;
  & button a {
    width: 100%;
    color: ${(props) =>
      props.theme.isDarkMode
        ? props.theme.colors.white.primary
        : props.theme.colors.black.primary};
    text-transform: capitalize;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
  }
`;

export const Disclaimer = styled.div`
  font-size: 0.7rem;
  text-align: center;
  padding: 15px 20px;
  color: ${(props) => props.theme.colors.gray.medium};
`;

export const CongratsWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px 15px;
  margin-top: 15px;
`;
