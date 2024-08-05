import styled from "@emotion/styled";
import { Form } from "formik";

interface GenericThemeType {
  theme?: any;
}

export const LoginWrapper = styled.div`
  width: 33%;
  margin: 40px auto;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0px 22px 33px rgba(0, 0, 0, 0.066);
  border-radius: 8px;

  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    width: auto;
    padding: 10px;
    margin: 0 16px;
  }
`;

export const FormWrapper = styled(Form)`
  width: 100%;
`;

export const Title = styled.h1`
  font-family: ${(p) => p.theme.typography.titleLG.fontFamily};
  font-size: ${(p) => p.theme.typography.titleLG.fontSize};
`;

export const InputWrapper = styled.div<GenericThemeType>`
  display: flex;
  flex-direction: column;
  text-align: left;
  margin: 10px 0;

  & .MuiFormControl-root.MuiTextField-root {
    width: 100%;
  }
`;

export const Subtext = styled.p`
  text-align: center;
`;
