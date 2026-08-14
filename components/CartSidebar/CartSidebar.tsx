import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "react-query";
import { ShoppingCart, Minus, Plus, X, Trash2 } from "lucide-react";
import { cn } from "@lib/utils";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  ScrollArea,
  Button
} from "@components/ui";
import { Loading } from "../Loading";
import {
  useCart,
  updateItemQuantity,
  removeItemFromCart
} from "../../hooks/useCart";
import { useProducts } from "../../hooks";
import { QueryKeys } from "../../hooks/queryKeys";
import { useAuth } from "../../config/auth";
import {
  IProduct,
  IProducts
} from "@spree/storefront-api-v2-sdk/types/interfaces/Product";

interface Props {
  isVisible: boolean;
  toggle: () => void;
}

export const CartSidebar = ({ isVisible, toggle }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { user } = useAuth();

  const {
    data: cartData,
    isLoading: cartIsLoading,
    isError: cartHasError,
    refetch: refetchCart
  } = useCart();

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
        setQuantities((prev) => {
          const newQuantities = { ...prev };
          delete newQuantities[itemId];
          return newQuantities;
        });
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

  const handleUpdateItemQuantity = (itemId: string, newQuantity: number) => {
    const quantity = Math.max(0, newQuantity);
    updateQuantityMutation.mutate({ itemId, quantity });
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

  const renderCartItems = () => {
    if (!Array.isArray(cartData?.included) || !productsData) return null;

    return cartData?.included
      .filter((item) => item.type === "line_item")
      .map((lineItem) => {
        const product = foundProduct(
          lineItem.relationships.variant.data.id,
          productsData
        );

        const lineItemId = lineItem.id;
        const quantity = quantities[lineItemId] || lineItem.attributes.quantity;

        return (
          <div
            key={`cart-item-${lineItemId}`}
            className="glass-panel mb-2 flex items-center justify-between px-4 py-3"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-title text-xs text-white">
                {product?.attributes?.name}
              </span>
              <span className="font-ds-digital text-sm tracking-wider text-neon-cyan">
                ${product?.attributes?.price}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  handleUpdateItemQuantity(lineItemId, quantity - 1)
                }
                className="glass-panel flex h-6 w-6 items-center justify-center !rounded text-white transition-colors hover:text-neon-cyan"
              >
                <Minus className="h-3 w-3" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e: any) => {
                  const newQty = parseInt(e.target.value) || 1;
                  if (newQty > 0) {
                    handleUpdateItemQuantity(lineItemId, newQty);
                  }
                }}
                className="w-8 border-none bg-transparent text-center font-digital7 text-sm text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                onClick={() =>
                  handleUpdateItemQuantity(lineItemId, quantity + 1)
                }
                className="glass-panel flex h-6 w-6 items-center justify-center !rounded text-white transition-colors hover:text-neon-cyan"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                onClick={() => handleRemoveItem(lineItemId)}
                className="ml-1 flex h-6 w-6 items-center justify-center rounded border-none bg-transparent text-white/40 transition-colors hover:text-neon-pink"
                title="Remove item"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        );
      });
  };

  const {
    item_count = 0,
    display_item_total,
    included_tax_total,
    display_total
  } = cartData?.data?.attributes || {};

  return (
    <Sheet open={isVisible} onOpenChange={toggle}>
      <SheetTrigger asChild>
        <button
          className="cursor-pointer border-none bg-transparent p-1 text-white transition-colors hover:text-neon-cyan outline-none"
          aria-label="Open cart"
        >
          <ShoppingCart className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[360px] max-w-[90vw] border-l border-glass-border p-0"
        style={{
          background: "rgba(10, 0, 32, 0.95)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow:
            "-8px 0 60px rgba(76, 29, 149, 0.4), -4px 0 30px rgba(76, 29, 149, 0.25)"
        }}
      >
        <SheetHeader className="border-b border-glass-border px-6 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="neon-text-cyan font-pressstart text-xs">
              Cart
            </SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="px-4 py-4">
            {cartIsLoading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <Loading />
              </div>
            ) : cartHasError ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
                <p className="text-center font-title text-sm text-white/40">
                  Couldn&apos;t load cart
                </p>
                <button
                  onClick={() => refetchCart()}
                  className="neon-btn text-xs"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* Item count & empty cart */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-micro5 text-xs text-white/50">
                    {item_count} {item_count > 1 ? "items" : "item"} in your
                    cart
                  </span>
                  {item_count > 0 && (
                    <button
                      onClick={handleEmptyCart}
                      className="flex items-center gap-1 rounded border border-neon-pink/30 bg-transparent px-2 py-1 font-title text-[10px] text-neon-pink transition-colors hover:bg-neon-pink/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      Empty
                    </button>
                  )}
                </div>

                {/* Cart Items */}
                <div>{renderCartItems()}</div>

                {/* Totals */}
                <div className="glass-panel mt-4 space-y-2 p-4">
                  <div className="flex justify-between font-title text-xs">
                    <span className="text-white/50">Subtotal:</span>
                    <span className="font-ds-digital text-sm tracking-wider text-white">
                      {display_item_total}
                    </span>
                  </div>
                  <div className="flex justify-between font-title text-xs">
                    <span className="text-white/50">Tax:</span>
                    <span className="font-ds-digital text-sm tracking-wider text-white">
                      {included_tax_total}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-glass-border pt-2 font-title text-sm font-bold">
                    <span className="text-white">Total:</span>
                    <span className="font-ds-digital text-base tracking-wider text-neon-cyan">
                      {display_total}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-2">
                  <button
                    className="neon-btn w-full text-center text-xs"
                    onClick={() => {
                      toggle();
                      router.push("/cart");
                    }}
                  >
                    View Cart
                  </button>
                  {user ? (
                    <button
                      className="neon-btn w-full text-center text-xs"
                      onClick={() => {
                        toggle();
                        router.push("/checkout");
                      }}
                    >
                      Checkout
                    </button>
                  ) : (
                    <>
                      <button
                        className="neon-btn w-full text-center text-xs"
                        onClick={() => {
                          toggle();
                          router.push("/checkout");
                        }}
                      >
                        Checkout as Guest
                      </button>
                      <button
                        className="neon-btn w-full text-center text-xs"
                        onClick={() => {
                          toggle();
                          router.push("/login");
                        }}
                      >
                        Login
                      </button>
                      <button
                        className="neon-btn w-full text-center text-xs"
                        onClick={() => {
                          toggle();
                          router.push("/signup");
                        }}
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
