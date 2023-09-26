import styled from '@emotion/styled';

export const MainContent = styled.div`
  max-width: 100%;
  background: ${(p) => p.theme.colors.gray.dark};
  padding: 0 15px;
`;

export const HeroContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 0px;
  overflow: hidden;
  background-image: linear-gradient(to bottom right, ${(p) => p.theme.colors.brand.primary}, ${(p) => p.theme.colors.brand.secondary});
  padding: 40px;
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
  -webkit-transform: translate3d(0,0,0);
  -moz-transform: translate3d(0,0,0);
  -ms-transform: translate3d(0,0,0);
  -o-transform: translate3d(0,0,0);
  transform: translate3d(0,0,0);
`;