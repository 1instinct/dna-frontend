import styled from "@emotion/styled";
import { Field } from "formik";
import { TextField, Checkbox } from "@material-ui/core";

export const BasicField = styled(Field)`
  width: 100%;
  border-width: 2px;
  border-style: dashed;
  border-color: ${(p: any) => p.theme.colors.gray.primary};
  border-radius: 5px;
  padding: 10px;
  font-size: 1em;
  color: ${(p: any) =>
    p.isDarkMode ? p.theme.colors.black.primary : p.theme.colors.white.primary};
  background: ${(p: any) =>
    p.isDarkMode ? p.theme.colors.white.primary : p.theme.colors.black.primary};
  outline: none;
  transition: all 0.3s ease-in-out;
  font-family: "Anonymous";
  &:focus {
    transition: all 0.3s ease-in-out;
    border: 2px solid ${(p: any) => p.theme.colors.brand.primary};
  }
`;

export const Error = styled.div`
  position: absolute;
  bottom: -20px;
  color: ${(p: any) => p.theme.colors.red.primary};
  font-size: 0.8em;
  text-align: left;
`;

export const HiddenInput = styled.div`
  display: none;
`;

export const SuggestionWrapper = styled.div`
  background: ${(p: any) => p.theme.colors.white.primary};
  position: relative;
  margin-top: 15px;
  align-items: flex-start;
  justify-content: center;
  flex-flow: column nowrap;
  min-width: 250px;
  max-width: 500px;
  max-height: 200px;
  overflow: scroll;
  z-index: 1;
  display: flex;
  box-shadow: 1px 3px 30px rgba(0, 0, 0, 0.23);
  margin-top: 15px;
  border-radius: 3px;
  border: 1px solid ${(p: any) => p.theme.colors.gray.light};
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
  color: ${(p: any) => p.theme.colors.gray.medium};
  &.active {
    cursor: pointer;
    color: ${(p: any) => p.theme.colors.brand.primary};
    background: ${(p: any) => p.theme.colors.gray.background};
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
