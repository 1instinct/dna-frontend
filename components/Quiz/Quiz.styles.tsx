import styled from "@emotion/styled";

export const QuizContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  justify-content: center;
  width: auto;
  min-height: 100vh;
  background: url("/images/allrise/law-pattern.png"),
    linear-gradient(196.13deg, #ffda17 -16.74%, #f7be56 89.04%);
  background-attachment: fixed;
  padding: 40px 0;
`;

export const QuizWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  margin: 0 auto;
  padding: 0;
  max-width: 800px;
  background: white;
  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    width: 100%;
    height: auto;
    margin-bottom: -150px;
  }
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.11);
`;

export const Logo = styled.img`
  width: auto;
  margin: 0 auto;
  height: 85px;

  @media screen and (max-width: ${(p) => p.theme.breakpoints.values.sm}px) {
    width: 50%;
    height: auto;
  }
`;

export const LogoText = styled.div`
  font-family: ${(p: any) => p.theme.typography.titleLG.fontFamily};
  font-weight: ${(p: any) => p.theme.typography.titleLG.fontWeight};
  font-size: ${(p: any) => p.theme.typography.titleLG.fontSize};
  line-height: ${(p: any) => p.theme.typography.titleLG.lineHeight};
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  margin: 40px 0 20px 0;
`;

export const Tagline = styled.div`
  text-align: center;
  width: 425px;
  margin: 10px auto;
  font-family: ${(p: any) => p.theme.typography.titleMD.fontFamily};
  font-weight: ${(p: any) => p.theme.typography.titleMD.fontWeight};
  font-size: ${(p: any) => p.theme.typography.titleMD.fontSize};
  line-height: ${(p: any) => p.theme.typography.titleMD.lineHeight};
  text-transform: uppercase;
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const Text = styled.div`
  text-align: center;
  width: 425px;
  font-family: ${(p: any) => p.theme.typography.specialMD.fontFamily};
  font-weight: ${(p: any) => p.theme.typography.specialMD.fontWeight};
  font-size: ${(p: any) => p.theme.typography.specialMD.fontSize};
  line-height: ${(p: any) => p.theme.typography.specialMD.lineHeight};
  text-transform: uppercase;
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

export const QuizInfo = styled.div`
  margin-top: -25px;
  padding-bottom: 40px;
`;

export const QuizTitleWrapper = styled.div`
  background-color: black;
  margin: 0px 0px 5px 0px;
  transform: rotate(-2deg);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  box-shadow: 1px 6px 12px rgba(0, 0, 0, 0.66);
  border-bottom: 2px solid white;
  border-right: 2px solid white;
  border-radius: 6px;
  width: 100%;
  cursor: pointer;

  &:hover {
    box-shadow: 1px 6px 12px rgba(0, 0, 0, 0.66);
  }
`;

export const QuizTitle = styled.h2`
  color: white;
  padding: 10px;
  font-family: "Hitchcock", sans-serif;
  font-size: 20px;
  letter-spacing: 1px;
  text-align: center;
  text-transform: capitalize;
`;

export const QuizText = styled.p`
  color: black;
  padding: 0 16px;
  text-align: justify;
  margin-top: 20px;
  font-size: 14px;
  line-height: 18px;
  letter-spacing: 1px;
  font-family: "Special", sans-serif;
`;

export const QuizImageWrapper = styled.div`
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  margin-bottom: -21px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
  }
`;

export const QuizImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
`;

export const BackButton = styled.button`
  position: fixed;
  top: 50px;
  left: 10px;
  width: 36px;
  height: 36px;
  padding: 3px 5px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.11);
`;

export const RowOfOptions = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 16px;
  gap: 16px;
`;

export const YesButton = styled.button`
  background: ${(p) => p.theme.colors.developed.primary};
  color: black;
  font-family: "Hitchcock", sans-serif;
  font-size: 16px;
  letter-spacing: 1px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: ${(p) => p.theme.colors.developed.medium};
  }
`;

export const NoButton = styled.button`
  background: ${(p) => p.theme.colors.red.primary};
  color: white;
  font-family: "Hitchcock", sans-serif;
  font-size: 16px;
  letter-spacing: 1px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: ${(p) => p.theme.colors.red.medium};
  }
`;

export const CentralControl = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

export const CategoryWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

export const CategoryName = styled.h3`
  font-family: "Special", sans-serif;
  font-size: 16px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: black;
  margin: 0;
  padding: 0;
`;

export const ApiErrorText = styled.p`
  font-family: ${({ theme }: any) => theme.typography.bodySM.fontFamily};
  font-size: ${({ theme }: any) => theme.typography.bodySM.fontSize};
  font-weight: ${({ theme }: any) => theme.typography.bodySM.fontWeight};
  line-height: ${({ theme }: any) => theme.typography.bodySM.lineHeight};
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  text-align: center;
  margin-top: 20px;
`;