import React from "react";
import styled from "@emotion/styled";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "react-query";
import { addItemToCart } from "@hooks/useCart";
import { QueryKeys } from "@hooks/queryKeys";

const CardWrapper = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px;
  background: ${(p) =>
    p.theme.isDarkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.9)"};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  border: 1px solid
    ${(p) =>
      p.theme.isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const ProductImage = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: ${(p) => p.theme.colors.gray.light};
`;

const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
`;

const ProductName = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ProductPrice = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: ${(p) => p.theme.colors.brand.primary};
  margin: 4px 0;
`;

const AddToCartBtn = styled.button`
  padding: 6px 12px;
  background: ${(p) => p.theme.colors.brand.primary};
  color: ${(p) => p.theme.colors.white.primary};
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    background: ${(p) => p.theme.colors.brand.dark};
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface ProductMiniCardProps {
  product: any;
}

export const ProductMiniCard: React.FC<ProductMiniCardProps> = ({
  product
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const addToCart = useMutation(addItemToCart, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.CART);
    }
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const variantId = product.relationships?.default_variant?.data?.id;
    if (variantId) {
      addToCart.mutate({ variant_id: variantId, quantity: 1 });
    }
  };

  const handleClick = () => {
    router.push(`/${product.attributes.slug}`);
  };

  const imageUrl = product.attributes.images?.[0]?.url;

  return (
    <CardWrapper onClick={handleClick}>
      <ProductImage>
        {imageUrl && (
          <Image
            src={`${process.env.NEXT_PUBLIC_SPREE_API_URL}${imageUrl}`}
            alt={product.attributes.name}
            fill
            style={{ objectFit: "cover" }}
          />
        )}
      </ProductImage>
      <ProductInfo>
        <ProductName>{product.attributes.name}</ProductName>
        <ProductPrice>${product.attributes.price}</ProductPrice>
        <AddToCartBtn onClick={handleAddToCart} disabled={addToCart.isLoading}>
          {addToCart.isLoading ? "Adding..." : "Add to Cart"}
        </AddToCartBtn>
      </ProductInfo>
    </CardWrapper>
  );
};
