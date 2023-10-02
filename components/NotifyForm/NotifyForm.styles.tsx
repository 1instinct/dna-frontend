import styled from "@emotion/styled";

export const NotifyFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 10;
  width: 95%;
  height: 175px;
`;

export const NotifyText = styled.div`
  text-align: center;
  width: 100%;
  font-family: ${(p: any) => p.theme.typography.bodySM.fontFamily};
  font-weight: ${(p: any) => p.theme.typography.bodySM.fontWeight};
  font-size: ${(p: any) => p.theme.typography.bodySM.fontSize};
  line-height: ${(p: any) => p.theme.typography.bodySM.lineHeight};
  margin: 10px auto;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

interface FormWrapperType {
  index: number;
}

export const FormWrapper = styled.div<FormWrapperType>`
  margin: 10px auto;
  width: 300px;
  display: block;
  overflow: hidden;
  & form {
    transition: 0.33s all ease-in-out;
    width: auto;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    overflow: hidden;
    justify-content: flex-start;
    margin-left: ${(p) => `-${300 * p.index}px`};
  }
`;

interface QuestionWrapperType {
  isVisible?: boolean;
}

export const QuestionWrapper = styled.div<QuestionWrapperType>`
  display: ${(p) => (p.isVisible ? "block" : "none")};
  width: 300px;
`;

export const EmailInput = styled.input`
  text-align: left;
  width: 300px;
  height: 36.15px;
  border: none;
  box-sizing: border-box;
  font-family: ${(p: any) => p.theme.typography.bodySM.fontFamily};
  font-weight: ${(p: any) => p.theme.typography.bodySM.fontWeight};
  font-size: ${(p: any) => p.theme.typography.bodySM.fontSize};
  line-height: ${(p: any) => p.theme.typography.bodySM.lineHeight};
  outline: none;
  padding: 8px 15px;
  background: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.black.primary
      : p.theme.colors.white.primary};
  transition: 0.33s all ease-in-out;
  &::placeholder {
    color: ${(p: any) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
  }
  &:focus {
    transition: 0.33s all ease-in-out;
    color: ${(p) => p.theme.colors.brand.primary};
    background: ${(p: any) =>
      p.theme.isDarkMode
        ? p.theme.colors.black.light
        : p.theme.colors.white.primary};
  }
  &:focus {
    transition: 0.33s all ease-in-out;
    color: ${(p) => p.theme.colors.blue.primary};
  }
  &:focus::placeholder {
    color: ${(p) => p.theme.colors.brand.primary};
  }
`;

export const Button = styled.button`
  padding: 0;
  margin: 0;
  transition: 0.33s all ease-in-out;
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-align: center;
  width: 201px;
  height: 36.15px;
  margin-left: -100px;
  background: ${(p: any) => p.theme.colors.brand.primary};
  border: none;
  box-sizing: border-box;
  position: relative;
  top: 0;
  right: 0;
  width: 75px;
  cursor: pointer;
  float: right;
  font-family: ${(p: any) => p.theme.typography.bodySM.fontFamily};
  font-weight: ${(p: any) => p.theme.typography.bodySM.fontWeight};
  font-size: ${(p: any) => p.theme.typography.bodySM.fontSize};
  line-height: ${(p: any) => p.theme.typography.bodySM.lineHeight};
  &:hover {
    transition: 0.33s all ease-in-out;
    opacity: 1;
  }
  &:active {
    background: ${(p) => p.theme.colors.black.primary};
    color: ${(p) => p.theme.colors.white.primary};
  }
  &:active {
    background: ${(p) => p.theme.colors.black.primary};
    color: ${(p) => p.theme.colors.white.primary};
  }
`;

export const MailTo = styled.a`
  text-decoration: none;
  text-align: center;
  font-family: ${(p: any) => p.theme.typography.bodySM.fontFamily};
  font-weight: ${(p: any) => p.theme.typography.bodySM.fontWeight};
  font-size: ${(p: any) => p.theme.typography.bodySM.fontSize};
  line-height: ${(p: any) => p.theme.typography.bodySM.lineHeight};
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  padding-top: 25px;
  bottom: 0;
  &:hover {
    color: ${(p: any) => p.theme.colors.brand.primary};
  }
`;
