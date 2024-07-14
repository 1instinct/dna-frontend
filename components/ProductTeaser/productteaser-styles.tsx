import styled from "@emotion/styled";

export const ProductsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
`;
export const ProductContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
export const ProductImg = styled.img`
  height: 300px;
  width: 240px;
  object-fit: contain;
  cursor: pointer;
`;
export const ProductTitle = styled.p`
  font-size: 20px;
  font-family: ${(p: any) => p.theme.typography.bodyXS.fontFamily};
  font-weight: ${(p: any) => p.theme.typography.bodyXS.fontWeight};
  font-size: ${(p: any) => p.theme.typography.bodyXS.fontSize};
  line-height: ${(p: any) => p.theme.typography.bodyXS.lineHeight};
  color: ${(p: any) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;
export const ProductSection = styled.section`
  width: 100%;
  padding-bottom: 20px;
`;

export const MyDiv = styled.div`
  align-items: center;
  display: flex;
`;
