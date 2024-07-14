import styled from "@emotion/styled";
import { Modal } from "@material-ui/core";

export const QuestionWrapper = styled.div`
  color: ${(props) => props.theme.colors.brand.primary};
  ${"" /* width: 100%; */}
  margin: 15px 0 15px 0;
`;

interface GenericThemeType {
  theme?: any;
}

export const InputGroupWrapper = styled.div<GenericThemeType>`
  ${
    "" /* background: ${props => props.theme.colors.white.primary};
  color: ${props => props.theme.colors.brand.primary};
  box-shadow: 1px 3px 8px rgba(0,0,0,0.123);
  width: 100%;
  margin: 15px 15px 0 0px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px; */
  }
  margin: -50px 15px 15px 15px;
  text-align: center;
  @media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
    margin: 0 auto;
    padding: 30px 0px 0px 0px;
  }
  & [data-qa="title"] {
    color: ${(props) => props.theme.colors.brand.primary};
    font-size: 1.6rem;
  }
  & .carousel .thumbs-wrapper {
    display: none;
  }
  & .carousel .slide {
    background: transparent;
    padding-bottom: 20px;
  }
  & .carousel .control-dots {
    padding: 0;
  }
  & .carousel .control-dots .dot {
    width: 5px;
    height: 5px;
    background: ${(props) => props.theme.colors.gray.primary};
    box-shadow: none;
    &:focus {
      outline: none;
    }
  }
  & .carousel .control-dots .dot.selected {
    background: ${(props) => props.theme.colors.white.primary};
    box-shadow: 0 0 0 7px ${(props) => props.theme.colors.brand.primary};
  }
`;

export const InputWrapper = styled.div<GenericThemeType>`
  text-align: left;
  margin: 10px 25px;

  & .MuiFormControl-root.MuiTextField-root {
    width: 100%;
  }
`;

export const Title = styled.h1<GenericThemeType>`
  margin: 5px 15px;
  color: ${(props) => props.theme.colors.brand.primary};
`;

export const Subtitle = styled.h3<GenericThemeType>`
  margin: 5px 15px;
  color: ${(props) => props.theme.colors.brand.primary};
`;

export const Description = styled.p`
  margin: 5px 15px 25px 15px;
  color: ${(props) => props.theme.colors.gray.medium};
`;

export const LinkOut = styled.a`
  & button {
    margin: 0 auto;
  }
`;

export const TermsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: start;
  padding: 0 25px;
  overflow: hidden;
`;

export const Term = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
`;

interface TermsStatementType {
  accepted: boolean;
  theme?: any;
}

export const TermsStatement = styled.p<TermsStatementType>`
  font-size: 0.7rem;
  text-align: left;
  flex-basis: 100%;
  color: ${(props) =>
    props.accepted
      ? props.theme.colors.brand.primary
      : props.theme.colors.red.primary};
  height: auto;
  overflow-y: scroll;
  margin: 0;
  max-width: 420px;

  & button {
    cursor: pointer;
    display: contents;
    font-weight: 700;
    text-decoration: underline;
    color: ${(props) =>
      props.accepted
        ? props.theme.colors.brand.primary
        : props.theme.colors.red.primary};
  }

  @media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
    flex-basis: 50%;
  }
`;

export const StyledModalContent = styled.div`
  ${"" /* Modal Header Container */}
  max-width: 50%;
  overflow-y: scroll;
  background: ${(p) => p.theme.colors.white.primary};
`;

// export const StyledModalHeader = styled(ModalHeader)`
//   z-index: 1052;
//   &
// `;
