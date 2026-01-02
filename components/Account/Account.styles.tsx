import styled from "@emotion/styled";
import { pxPC } from "@utilities/device-sizes";
import { InputBase } from "@mui/material";
export const Content = styled.div`
  min-height: calc(100vh - 543px);
  position: relative;
`;
export const PageTitle = styled.div`
  position: absolute;
  left: ${pxPC(54)};
  top: ${pxPC(491)};
  font-size: 33px;
  line-height: 41px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-transform: uppercase;
  transform: rotate(-90deg);
  font-family: ${(p) => p.theme.typography.titleLG.fontFamily};
  &:after {
    position: absolute;
    content: "";
    left: 100%;
    width: ${pxPC(86)};
    height: 3px;
    background-color: ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
    top: 40%;
  }
`;
export const InputWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${pxPC(123)};
  margin-right: ${pxPC(58)};
`;
export const MyInput = styled(InputBase)`
  width: ${pxPC(312)};
  height: 24px;
  border-bottom: 2px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.white.primary
        : p.theme.colors.black.primary};
`;
export const MyInputLabel = styled.div`
  margin-left: ${pxPC(19)};
  font-size: 20px;
  line-height: 24px;
  height: 24px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-family: ${(p) => p.theme.typography.titleLG.fontFamily};
  text-transform: uppercase;
`;
export const PageBottom = styled.div`
  display: flex;
  margin-top: ${pxPC(121)};
  margin-bottom: ${pxPC(212)};
`;
export const AccountImg = styled.img`
  width: ${pxPC(262)};
  height: auto;
  margin-right: ${pxPC(114)};
  margin-left: ${pxPC(278)};
`;
export const FormWrapper = styled.div`
  display: flex;
  flex: 1;
`;
export const LeftCol = styled.div`
  width: ${pxPC(266)};
  display: flex;
  flex-direction: column;
  margin-right: ${pxPC(106)};
`;
export const RightCol = styled.div`
  width: ${pxPC(266)};
  flex-direction: column;
`;
export const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${pxPC(59)};
  height: ${pxPC(106)};
  &:last-child {
    margin-bottom: 0;
  }
`;
export const FormInput = styled(InputBase)`
  font-size: 14px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  border-bottom: 1px solid #707070;
  width: 100%;
`;
export const FormLabel = styled.div`
  font-size: 14px;
  line-height: 125%;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  margin-top: ${pxPC(13)};
  width: 100%;
`;