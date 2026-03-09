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
              className="glass-panel mb-3 flex items-center justify-between px-5 py-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-deep">
                  <span className="font-micro5-charted text-base text-neon-cyan/40">
                    IMG
                  </span>
                </div>
                <span className="truncate font-title text-sm text-white">
                  {product?.attributes?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      handleUpdateItemQuantity(lineItemId, quantity - 1)
                    }
                    className="glass-panel flex h-8 w-8 items-center justify-center !rounded-md text-white transition-colors hover:text-neon-cyan"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center font-digital7 text-lg text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleUpdateItemQuantity(lineItemId, quantity + 1)
                    }
                    className="glass-panel flex h-8 w-8 items-center justify-center !rounded-md text-white transition-colors hover:text-neon-cyan"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="ml-2 min-w-[60px] text-right font-ds-digital text-base tracking-wider text-neon-cyan">
                  ${product?.attributes?.price}
                </span>
                <button
                  onClick={() => handleRemoveItem(lineItemId)}
                  className="ml-1 flex h-8 w-8 items-center justify-center rounded-md border-none bg-transparent text-white/50 transition-colors hover:text-neon-pink"
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
  if (isError)
    return (
      <p className="p-8 text-center text-destructive">
        Error: {(error as any).message}
      </p>
    );

  const {
    item_count = 0,
    display_item_total,
    included_tax_total,
    display_total
  } = cartData?.data?.attributes || {};

  if (item_count === 0 && cartData !== undefined) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, #0A0020 0%, #1a0040 50%, #0A0020 100%)"
        }}
      >
        <p className="font-pressstart text-xs leading-relaxed text-white/40">
          Your cart is empty
        </p>
      </div>
    );
  }

  if (cartData !== undefined) {
    return (
      <div
        className="min-h-screen py-12"
        style={{
          background:
            "linear-gradient(180deg, #0A0020 0%, #1a0040 50%, #0A0020 100%)"
        }}
      >
        <div className="section-container">
          <h2 className="neon-text-cyan mb-8 font-pressstart text-lg">Cart</h2>

          <div className="mb-6 flex items-center justify-between">
            <span className="font-micro5 text-sm text-white/60">
              {item_count} {item_count > 1 ? "items" : "item"} in your cart
            </span>
            {item_count > 0 && (
              <button
                onClick={handleEmptyCart}
                className="glass-panel flex items-center gap-1.5 !rounded-lg px-3 py-1.5 font-title text-xs text-neon-pink transition-colors hover:text-neon-pink"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Empty Cart
              </button>
            )}
          </div>

          <div>{renderCartItems()}</div>

          {/* Totals */}
          <div className="glass-panel mt-8 space-y-3 p-6">
            <div className="flex justify-between font-title text-sm">
              <span className="text-white/60">Subtotal:</span>
              <span className="font-ds-digital text-base tracking-wider text-white">
                {display_item_total}
              </span>
            </div>
            <div className="flex justify-between font-title text-sm">
              <span className="text-white/60">Tax:</span>
              <span className="font-ds-digital text-base tracking-wider text-white">
                {included_tax_total}
              </span>
            </div>
            <div className="flex justify-between border-t border-glass-border pt-3 font-title text-lg font-bold">
              <span className="text-white">Total:</span>
              <span className="font-ds-digital text-xl tracking-wider text-neon-cyan">
                {display_total}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <button
                onClick={() => router.push("/checkout")}
                className="neon-btn"
              >
                Checkout
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push("/checkout")}
                  className="neon-btn"
                >
                  Checkout as Guest
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="neon-btn"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="neon-btn"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
};
