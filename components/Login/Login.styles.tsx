import styled from "@emotion/styled";
import { Form } from "formik";

interface GenericThemeType {
  theme?: any;
}

export const LoginWrapper = styled.div`
  width: 33%;
  min-height: 60vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    width: auto;
    margin: 0 16px;
  }
`;

export const FormWrapper = styled(Form)`
  width: 100%;
`;

export const InputWrapper = styled.div<GenericThemeType>`
  display: flex;
  text-align: left;
  margin: 10px 0;

  & .MuiFormControl-root.MuiTextField-root {
    width: 100%;
  }
`;

export const Subtext = styled.p`
  text-align: center;
`;
