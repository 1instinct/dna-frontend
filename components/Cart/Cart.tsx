import React, { useState, useEffect } from "react";
import { IProducts } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import { Button } from "../shared";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "react-query";
import {
  useCart,
  removeItemFromCart,
  updateItemQuantity
} from "../../hooks/useCart";
import { useProducts } from "../../hooks";
import { Layout, Loading } from "../components";
import { QueryKeys } from "../../hooks/queryKeys";
import { useAuth } from "../../config/auth";

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
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { user } = useAuth();

  const { data: cartData, isLoading, isError, error } = useCart();

  const { data: productsData } = useProducts(1);

  // Initialize quantities from line_items when cart loads
  useEffect(() => {
    if (Array.isArray(cartData?.included)) {
      const lineItems = cartData?.included.filter(
        (item) => item.type === "line_item"
      );
      const initialQuantities: Record<string, number> = {};
      lineItems?.forEach((item: any) => {
        initialQuantities[item.id] = item.attributes.quantity || 1;
      });
      setQuantities(initialQuantities);
    }
  }, [cartData?.included]);

  const updateQuantityMutation = useMutation(
    ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateItemQuantity(itemId, quantity),
    {
      onMutate: async ({ itemId, quantity }) => {
        // Optimistically update local state
        setQuantities((prev) => ({ ...prev, [itemId]: quantity }));
      },
      onSuccess: () => {
        console.log("Quantity updated successfully");
        queryClient.invalidateQueries(QueryKeys.CART);
      },
      onError: (error: any, { itemId }) => {
        console.error("Failed to update quantity:", error);
        // Revert on error - refetch to get correct state
        queryClient.invalidateQueries(QueryKeys.CART);
      }
    }
  );

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
    console.log("Removing item:", itemId);
    updateQuantityMutation.mutate({ itemId, quantity: 0 });
  };

  const handleUpdateItemQuantity = (itemId: string, newQuantity: number) => {
    console.log("Updating item:", itemId, "to quantity:", newQuantity);
    const quantity = Math.max(0, newQuantity);
    updateQuantityMutation.mutate({ itemId, quantity });
  };

  const renderCartItems = () => {
    if (Array.isArray(cartData?.included) && productsData) {
      return cartData?.included
        .filter((includedItem) => includedItem.type === "line_item")
        .map((lineItem) => {
          const product = foundProduct(
            lineItem.relationships.variant.data.id,
            productsData
          );

          const lineItemId = lineItem.id;
          const quantity =
            quantities[lineItemId] || lineItem.attributes.quantity;

          return (
            <CartItem key={`cart-item-${lineItemId}`}>
              <CartItemDescription>
                {product?.attributes?.name} - ${product?.attributes?.price}
              </CartItemDescription>
              <QuantityAdjusterWrapper>
                <QuantityAdjuster
                  onClick={() =>
                    handleUpdateItemQuantity(lineItemId, quantity - 1)
                  }
                >
                  -
                </QuantityAdjuster>
                <QuantitySelector value={quantity} readOnly />
                <QuantityAdjuster
                  onClick={() =>
                    handleUpdateItemQuantity(lineItemId, quantity + 1)
                  }
                >
                  +
                </QuantityAdjuster>
              </QuantityAdjusterWrapper>
            </CartItem>
          );
        });
    }
    return null;
  };

  if (isLoading) return <Loading />;
  if (isError) return <p>Error: {error.message}</p>;

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
        {user ? (
          <Button onClick={() => router.push("/checkout")}>Checkout</Button>
        ) : (
          <>
            <Button onClick={() => router.push("/checkout")}>
              Checkout as Guest
            </Button>
            <Button variant="outline" onClick={() => router.push("/login")}>
              Login
            </Button>
            <Button variant="outline" onClick={() => router.push("/signup")}>
              Signup
            </Button>
          </>
        )}
      </CartWrapper>
    );
  }
  return null;
};
