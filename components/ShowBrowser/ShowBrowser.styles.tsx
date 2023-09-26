import styled from "@emotion/styled";

export const ShowPic = styled.div`
  padding-top: 15px;
  padding-bottom: 15px;
`;

export const ShowPicImg = styled.img`
  min-height: 160px;
  background: ${(p) => p.theme.colors.gray.medium};
`;

export const ShowBoxPic = styled.div`
  margin-top: 15px;
`;

export const ShowBoxDetails = styled.div`
  background: ${(p) => p.theme.colors.white.primary};
  padding: 5px 10px;
`;

export const BoxDetails = styled.div`
  background: ${(p) => p.theme.colors.white.primary};
  padding: 5px 10px;
`;

export const MainContent = styled.div`
  background: ${(p) => p.theme.colors.gray.medium};
  padding: 15px 0 0 0;
`;

export const HeroContainer = styled.div`
  border: 0px;
  overflow: hidden;
  background-image: linear-gradient(
    to bottom right,
    ${(p) => p.theme.colors.brand.primary},
    ${(p) => p.theme.colors.brand.secondary}
  );
  padding: 40px;
`;
