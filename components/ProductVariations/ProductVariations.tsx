import React from "react";
import { ProductVariationsProps } from "./types";
import styled from "@emotion/styled";
import { ColorCell } from "./ColorCell";
import { PackQtyCell } from "./PackQtyCell";
import { PieceQtyCell } from "./PieceQtyCell";
import { PackPriceCell } from "./PackPriceCell";

const ProductVariationsWrapper = styled.div`
  label: ProductVariationsWrapper;
  display: grid;
  grid-template-columns: 3fr 2fr 2fr 2fr;
  grid-template-rows: 42px 42px 42px 42px;
  //   gap: 10px 10px;
  //   grid-template-areas:
  //     ". . . ."
  //     ". . . ."
  //     ". . . ."
  //     ". . . .";
`;

const Header = styled.div`
  label: Header;
  background-color: ${(props) => props.theme.colors.brand.primary};
  font-family: "Bebas Neue";
  font-size: 20.11px;
  line-height: 24.13px;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const updatePackQty = (delta: number) => {
  console.log("update some state here", delta);
};

export const ProductVariations: React.FC<ProductVariationsProps> = () => {
  return (
    <ProductVariationsWrapper>
      <Header>COLORS</Header>
      <Header>PACK QTY</Header>
      <Header>PIECE QTY</Header>
      <Header>PACK PRICE</Header>

      <ColorCell colorName="Yellow Rod" colorValue="#F8CF51" />
      <PackQtyCell
        packQty={3}
        updatePackQty={(delta) => updatePackQty(delta)}
      />
      <PieceQtyCell pieceQty={12} />
      <PackPriceCell packPrice={1000} />

      <ColorCell colorName="Carnelion" colorValue="#B22C31" />
      <PackQtyCell
        packQty={5}
        updatePackQty={(delta) => updatePackQty(delta)}
      />
      <PieceQtyCell pieceQty={48} />
      <PackPriceCell packPrice={4000} />

      <ColorCell colorName="Grey Blue" colorValue="#3C8CBC" />
      <PackQtyCell
        packQty={8}
        updatePackQty={(delta) => updatePackQty(delta)}
      />
      <PieceQtyCell pieceQty={24} />
      <PackPriceCell packPrice={2000} />
    </ProductVariationsWrapper>
  );
};
