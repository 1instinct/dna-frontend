import styled from "@emotion/styled";

export const Wrapper = styled.div`
  max-width: 100%;
  background: ${(p) => p.theme.colors.gray.dark};
`;

export const HeroContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 0px;
  overflow: hidden;
  background-image: linear-gradient(
    to bottom right,
    ${(p) => p.theme.colors.brand.primary},
    ${(p) => p.theme.colors.brand.secondary}
  );
  padding: 40px;
`;

export const MainContent = styled.div`
  padding-top: 55px;
`;

export const ListTitle = styled.div`
  margin-left: 20px;
`;

export const HorizontalList = styled.div`
  width: 100%;
  height: 100%;
  white-space: nowrap !important;
  padding: 15px 15px 20px 15px;
  position: relative;
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
  white-space: nowrap;
  -webkit-transform: translate3d(0, 0, 0);
  -moz-transform: translate3d(0, 0, 0);
  -ms-transform: translate3d(0, 0, 0);
  -o-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
`;

export const SeeMoreLink = styled.a`
  width: 220px;
  height: 240px;
  margin: 0 5px;
  display: inline-table !important;
  background-size: cover;
  white-space: normal !important;
  font-size: 12px;
  vertical-align: bottom;
  text-align: center;

  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SeeMoreIconWrapper = styled.div`
  width: 30px;
  height: 30px;
`;
