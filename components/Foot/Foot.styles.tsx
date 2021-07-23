import styled from "@emotion/styled";
export const Container = styled.div`
  padding-top: 41px;
  color: #fff;
  padding-bottom: 68px;
  @media (max-width: 375px) {
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
  padding-left: 260px;
  padding-right: 260px;
  justify-content: space-between;
  grid-template-columns: 111px 148px 67px 173px;
  justify-items: center;
  @media (max-width: 375px) {
    padding-left: 54px;
    padding-right: 13px;
    justify-content: start;
    grid-template-columns: [a]111px 137px;
    justify-content: space-between;
    row-gap: 42px;
  }
`;
export const IconLinksMo = styled.div`
  justify-content: center;
  align-items: center;
  margin-top: 68px;
  display: none;
  @media (max-width: 375px) {
    display: flex;
  }
`;
export const MobileIconLink = styled.a``;
export const Column = styled.div`
  display: flex;
  flex-direction: column;
`;
export const ColumnTitle = styled.div`
  font-size: 14px;
  line-height: 17px;
  color: #fff;
  font-weight: 400;
  margin-bottom: 22px;
  white-space: nowrap;
  @media (max-width: 375px) {
    margin-bottom: 9px;
    font-size: 20px;
    line-height: 24px;
    color: #eb8b8b;
  }
`;
export const ColumnSubTitle = styled.div``;
export const LinkItem = styled.a`
  font-size: 14px;
  line-height: 150%;
  color: #969696;
  font-weight: 400;
`;
export const Description = styled.div`
  color: #969696;
  font-size: 14px;
  line-height: 150%;
  font-weight: 400;
  margin-bottom: 5px;
`;
export const IconLink = styled.a`
  margin-right: 5.82px;
`;
export const IconLinkWrapper = styled.div`
  @media (max-width: 375px) {
    display: none;
  }
`;
