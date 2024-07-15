import React from "react";
import { IProducts } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import { Button } from "../shared";
import { useRouter } from "next/router";
import {
  useCart,
  removeItemFromCart,
  updateItemQuantity
} from "../../hooks/useCart";
import { useProducts } from "../../hooks";
import { Layout } from "../components";

import {
  CartWrapper,
  CartTitle,
  CartButton,
  CartItem,
  CartItemDescription,
  QuantityAdjusterWrapper,
  QuantitySelector,
  QuantityAdjuster,
  TotalLine,
  EmptyCartMessage
} from "./Cart.styles";

export const Cart = () => {
  const router = useRouter();
  const { data: cartData, isLoading } = useCart();

  const { data: productsData } = useProducts(1);

  const foundProduct = (productId: string, productsData: IProducts) => {
    // Check if productsData and productsData.data exist and are iterable
    if (!productsData || !Array.isArray(productsData.data)) {
      console.error("Invalid or missing productsData");
      return null;
    }

    for (const product of productsData.data) {
      // Also check if the relationships and variants exist and are iterable
      if (
        product.relationships &&
        product.relationships.variants &&
        Array.isArray(product.relationships.variants.data)
      ) {
        const variant = product.relationships.variants.data.find(
          (variant) => variant.id === productId
        );
        if (variant) {
          return product;
        }
      }
    }

    return null;
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItemFromCart(itemId);
      console.log("Item removed");
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleUpdateItem = async (itemId: string, quantity: number) => {
    try {
      await updateItemQuantity(itemId, quantity);
      console.log("Item quantity updated");
    } catch (error) {
      console.error("Failed to update item quantity:", error);
    }
  };

  const handleUpdateItemQuantity = async (
    itemId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) {
      await removeItemFromCart(itemId);
    } else {
      await updateItemQuantity(itemId, newQuantity);
    }
  };

  const renderCartItems = () => {
    if (Array.isArray(cartData?.data?.relationships?.variants?.data)) {
      return cartData?.data?.relationships?.variants?.data?.map(
        (item, index): any => {
          if (productsData !== undefined) {
            const itemCount = cartData?.data?.attributes?.item_count;
            const product = foundProduct(item.id, productsData);

            return (
              <CartItem key={`cart-item-${index}`}>
                <CartItemDescription>
                  {product?.attributes?.name} - ${product?.attributes?.price}
                </CartItemDescription>
                <QuantityAdjusterWrapper>
                  <QuantityAdjuster
                    onClick={() =>
                      handleUpdateItemQuantity(item.id, itemCount - 1)
                    }
                  >
                    -
                  </QuantityAdjuster>
                  <QuantitySelector value={itemCount} />
                  <QuantityAdjuster
                    onClick={() =>
                      handleUpdateItemQuantity(item.id, itemCount + 1)
                    }
                  >
                    +
                  </QuantityAdjuster>
                </QuantityAdjusterWrapper>
              </CartItem>
            );
          } else {
            console.error("productsData is undefined");
            return null;
          }
        }
      );
    }
    return null;
  };

  if (isLoading) return <p>Loading...</p>;

  const {
    item_count = 0,
    display_item_total,
    included_tax_total,
    display_total
  } = cartData?.data?.attributes || {};

  if (cartData !== undefined) {
    return (
      <CartWrapper>
        <CartTitle>Cart</CartTitle>
        <div>
          {item_count} {item_count > 1 ? "items" : "item"} in your cart
        </div>
        <div>{renderCartItems()}</div>
        <TotalLine>Subtotal: {display_item_total}</TotalLine>
        <TotalLine>Tax: {included_tax_total}</TotalLine>
        <TotalLine>Total: {display_total}</TotalLine>
        <Button onClick={() => router.push("/checkout")}>Checkout</Button>
      </CartWrapper>
    );
  }
  return null;
};
