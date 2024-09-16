import styled from "@emotion/styled";
import { Field } from "formik";
import { TextField, Checkbox } from "@material-ui/core";

export const BasicField = styled(Field)`
  border-width: 2px;
  border-style: dashed;
  border-color: ${(props) =>
    props.invalid
      ? props.theme.colors.red.primary
      : props.theme.colors.gray.primary};
  border-radius: 5px;
  padding: 10px;
  font-size: ${(props) => props.theme.typography.bodyMD.fontSize};
  line-height: ${(props) => props.theme.typography.bodyMD.lineHeight};
  font-family: ${(props) => props.theme.typography.bodyMD.fontFamily};
  color: ${(props) =>
    props.theme.isDarkMode
      ? props.theme.colors.white.primary
      : props.theme.colors.black.primary};
  background-color: ${(props) =>
    props.theme.isDarkMode
      ? props.theme.colors.black.primary
      : props.theme.colors.white.primary};
  outline: none;
  transition: border-color 0.3s ease-in-out;

  &:focus {
    border-color: ${(props) => props.theme.colors.brand.primary};
  }
`;
export const Error = styled.div`
  margin: 5px 0 0 0;
  color: ${(p) => p.theme.colors.red.primary};
  font-size: ${(p) => p.theme.typography.bodySM.fontSize};
  line-height: ${(p) => p.theme.typography.bodySM.lineHeight};
  font-family: ${(p) => p.theme.typography.bodySMBold.fontFamily};
  text-align: left;
  font-weight: bold;
`;

export const HiddenInput = styled.div`
  display: none;
`;

export const SuggestionWrapper = styled.div`
  background: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.primary
      : p.theme.colors.gray.background};
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.gray.dark
      : p.theme.colors.black.primary};
  position: absolute;
  margin-top: 54px;
  margin-left: 0px;
  align-items: flex-start;
  justify-content: center;
  flex-flow: column nowrap;
  min-width: 250px;
  width: 100%;
  max-width: 500px;
  max-height: 200px;
  overflow: scroll;
  z-index: 1;
  display: flex;
  box-shadow: 1px 3px 30px rgba(0, 0, 0, 0.23);
  border-radius: 4px;
  border: 2px dashed
    ${(p: any) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.medium
        : p.theme.colors.black.primary};
  transition: all 0.3s ease-in-out;

  @media (max-width: ${(p: any) => p.theme.breakpoints.values.sm}px) {
    padding: 20px 0 60px 0;
    justify-content: top;
  }
`;

export const SuggestionLoader = styled.div`
  margin: 0 auto;
`;

export const SuggestionItem = styled.div`
  align-self: flex-start;
  padding: 5px 10px;
  width: 100%;
  text-align: left;
  background: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.primary
      : p.theme.colors.gray.background};
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.gray.medium
      : p.theme.colors.black.primary};
  &.active {
    cursor: pointer;
    color: ${(p: any) => p.theme.colors.brand.primary};
    background: ${(p: any) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.dark
        : p.theme.colors.gray.background};
  }
`;

interface TermsCheckboxType {
  accepted: boolean;
  theme: any;
}

export const TermsCheckbox = styled(Checkbox)<TermsCheckboxType>`
  flex-basis: 5%;

  > .checkbox-label {
    color: ${(p: any) =>
      p.accepted ? p.theme.colors.brand.dark : p.theme.colors.red.primary};
  }

  .checkbox-style {
    border-color: ${(p: any) =>
      p.accepted ? p.theme.colors.brand.dark : p.theme.colors.red.primary};
    stroke: ${(p: any) =>
      p.accepted ? p.theme.colors.brand.dark : p.theme.colors.red.primary};
  }
`;

export const Wrapper = styled.div`
  padding: 15px;
`;
