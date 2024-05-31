import styled from "@emotion/styled";
export const Container = styled.div`
  background: ${(p) => p.theme.colors.black.primary};
  padding-top: 41px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  padding-bottom: 68px;
  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    padding-top: 14px;
  }
`;
export const LogoDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const Grid = styled.div`
  display: grid;
  padding: 20px 260px;
  justify-content: space-between;
  grid-template-columns: 111px 148px 67px 173px;
  justify-items: center;
  font-family: "Bebas Neue";
  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    display: flex;
    flex-direction: column;
    padding: 40px 20px;
    justify-content: start;
    grid-template-columns: [a]29.6vw 36.5vw;
    justify-content: space-between;
    row-gap: 11.2vw;
    justify-items: start;
  }
`;
export const IconLinksMo = styled.div`
  justify-content: center;
  align-items: center;
  margin-top: 68px;
  display: none;
  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    display: flex;
  }
  @media (max-width: 750px) {
    display: flex;
  }
`;
export const MobileIconLink = styled.a``;
export const Column = styled.div`
  display: flex;
  flex-direction: column;
`;
export const ColumnTitle = styled.div`
  font-family: "Bebas Neue";
  font-size: 14px;
  line-height: 17px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  font-weight: 400;
  margin-bottom: 22px;
  white-space: nowrap;
  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    margin-bottom: 9px;
    font-size: 20px;
    line-height: 24px;
    color: ${(p) => p.theme.colors.gray.medium};
  }
`;
export const ColumnSubTitle = styled.div`
  font-family: "Bebas Neue";
`;
export const LinkItem = styled.a`
  font-size: 14px;
  line-height: 150%;
  color: ${(p) => p.theme.colors.gray.medium};
  font-weight: 400;
  font-family: "Bebas Neue";
`;
export const Description = styled.div`
  color: ${(p) => p.theme.colors.gray.medium};
  font-size: 14px;
  line-height: 150%;
  font-weight: 400;
  margin-bottom: 5px;
  font-family: "Bebas Neue";
`;
export const IconLink = styled.a``;
export const IconLinkWrapper = styled.div`
  @media (max-width: ${(p) => p.theme.breakpoints.values.xs}px) {
    display: none;
  }
  @media (max-width: 750px) {
    display: none;
  }
`;

export const CameraIcon = styled.img`
  width: 11px;
  height: auto;
  margin-right: 3.88px;
  @media (max-width: 375px) {
    width: 20.71px;
    height: auto;
    margin-right: 7.76px;
  }
`;
export const FacebookIcon = styled.img`
  width: 6.81px;
  height: auto;
  margin-right: 3.88px;
  @media (max-width: 375px) {
    width: 13.63px;
    height: auto;
    margin-right: 7.76px;
  }
`;
export const PlayIcon = styled.img`
  width: 12.29px;
  height: auto;
  margin-right: 3.88px;
  @media (max-width: 375px) {
    width: 24.59px;
    height: auto;
    margin-right: 7.76px;
  }
`;
export const CircleIcon = styled.img`
  width: 10.35px;
  height: auto;
  @media (max-width: 375px) {
    width: 20.71px;
    height: auto;
  }
`;
