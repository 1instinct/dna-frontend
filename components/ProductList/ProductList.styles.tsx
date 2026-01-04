import styled from "@emotion/styled";

export const ProductsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
`;
export const ProductContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
export const MyImg = styled.img`
  height: 300px;
  width: 240px;
  object-fit: contain;
`;
export const MyH1 = styled.h1`
  font-size: 20px;
`;
export const MySection = styled.section`
  width: 100%;
  padding-bottom: 20px;
  margin-bottom: 20px;
`;
export const MyLi = styled.li`
  display: block;
  margin-bottom: 10px;
`;
export const MyDiv = styled.div`
  align-items: center;
  display: flex;
`;
