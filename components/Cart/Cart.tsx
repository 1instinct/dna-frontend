import React, { useState, useEffect } from "react";
import { IProducts } from "@spree/storefront-api-v2-sdk/types/interfaces/Product";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "react-query";
import { Minus, Plus, X, Trash2 } from "lucide-react";
import { Button } from "@components/ui";
import {
  useCart,
  updateItemQuantity,
  removeItemFromCart
} from "../../hooks/useCart";
import { useProducts } from "../../hooks";
import { Layout } from "../Layout";
import { Loading } from "../Loading";
import { QueryKeys } from "../../hooks/queryKeys";
import { useAuth } from "../../config/auth";

export const Cart = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { user } = useAuth();

  const { data: cartData, isLoading, isError, error } = useCart();
  const { data: productsData } = useProducts(1);

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

  const removeFromCartMutation = useMutation(
    (itemId: string) => removeItemFromCart(itemId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKeys.CART);
      },
      onError: (error: any) => {
        console.error("Failed to remove item:", error);
      }
    }
  );

  const updateQuantityMutation = useMutation(
    ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateItemQuantity(itemId, quantity),
    {
      onMutate: async ({ itemId, quantity }) => {
        setQuantities((prev) => ({ ...prev, [itemId]: quantity }));
      },
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKeys.CART);
      },
      onError: (error: any, { itemId }) => {
        console.error("Failed to update quantity:", error);
        queryClient.invalidateQueries(QueryKeys.CART);
      }
    }
  );

  const foundProduct = (productId: string, productsData: IProducts) => {
    if (!productsData || !Array.isArray(productsData.data)) return null;
    for (const product of productsData.data) {
      if (
        product.relationships?.variants &&
        Array.isArray(product.relationships.variants.data)
      ) {
        const variant = product.relationships.variants.data.find(
          (variant) => variant.id === productId
        );
        if (variant) return product;
      }
    }
    return null;
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCartMutation.mutate(itemId);
  };

  const handleEmptyCart = () => {
    if (window.confirm("Are you sure you want to empty your cart?")) {
      const lineItems =
        cartData?.included?.filter((item) => item.type === "line_item") || [];
      lineItems.forEach((item: any) => {
        removeFromCartMutation.mutate(item.id);
      });
    }
  };

  const handleUpdateItemQuantity = (itemId: string, newQuantity: number) => {
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
            <div
              key={`cart-item-${lineItemId}`}
              className="flex items-center justify-between border-b border-border/30 py-4"
            >
              <span className="flex-1 font-body text-sm text-foreground">
                {product?.attributes?.name} - ${product?.attributes?.price}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleUpdateItemQuantity(lineItemId, quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-transparent text-foreground transition-colors hover:bg-muted"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center font-body text-sm text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => handleUpdateItemQuantity(lineItemId, quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-transparent text-foreground transition-colors hover:bg-muted"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleRemoveItem(lineItemId)}
                  className="ml-2 flex h-8 w-8 items-center justify-center rounded-md border-none bg-transparent text-destructive transition-colors hover:bg-destructive/10"
                  title="Remove item"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        });
    }
    return null;
  };

  if (isLoading) return <Loading />;
  if (isError) return <p className="p-8 text-center text-destructive">Error: {(error as any).message}</p>;

  const {
    item_count = 0,
    display_item_total,
    included_tax_total,
    display_total
  } = cartData?.data?.attributes || {};

  if (cartData !== undefined) {
    return (
      <div className="section-container py-8 font-title">
        <h2 className="mb-6 text-2xl font-semibold text-foreground">Cart</h2>

        <div className="mb-4 flex items-center justify-between">
          <span className="font-body text-sm text-muted-foreground">
            {item_count} {item_count > 1 ? "items" : "item"} in your cart
          </span>
          {item_count > 0 && (
            <Button variant="outline" size="sm" onClick={handleEmptyCart}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Empty Cart
            </Button>
          )}
        </div>

        <div>{renderCartItems()}</div>

        {/* Totals */}
        <div className="mt-6 space-y-2 border-t border-border/30 pt-6">
          <div className="flex justify-between font-body text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-semibold text-foreground">{display_item_total}</span>
          </div>
          <div className="flex justify-between font-body text-sm">
            <span className="text-muted-foreground">Tax:</span>
            <span className="text-foreground">{included_tax_total}</span>
          </div>
          <div className="flex justify-between font-title text-lg font-bold text-foreground">
            <span>Total:</span>
            <span>{display_total}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          {user ? (
            <Button onClick={() => router.push("/checkout")}>
              Checkout
            </Button>
          ) : (
            <>
              <Button onClick={() => router.push("/checkout")}>
                Checkout as Guest
              </Button>
              <Button variant="outline" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button variant="outline" onClick={() => router.push("/signup")}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }
  return null;
};
