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
    isError: cartHasError
  } = useCart();

  const { data: productsData } = useProducts(1);

  useEffect(() => {
    if (
      cartData?.data?.attributes?.item_count &&
      cartData?.data?.relationships?.line_items?.data
    ) {
      const lineItems = cartData?.data.relationships.line_items.data;
      const itemCount = cartData?.data.attributes.item_count;
      const lineItemsArray = Array.isArray(lineItems) ? lineItems : [lineItems];
      const avgQty = Math.ceil(itemCount / lineItemsArray.length);

      const initialQuantities: Record<string, number> = {};
      lineItemsArray.forEach((item: any) => {
        if (!quantities[item.id]) {
          initialQuantities[item.id] = avgQty;
        }
      });

      if (Object.keys(initialQuantities).length > 0) {
        setQuantities((prev) => ({ ...prev, ...initialQuantities }));
      }
    }
  }, [
    cartData?.data?.attributes?.item_count,
    cartData?.data?.relationships?.line_items?.data
  ]);

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
      const lineItemRefs =
        cartData?.data?.relationships?.line_items?.data || [];
      const lineItemsArray = Array.isArray(lineItemRefs)
        ? lineItemRefs
        : [lineItemRefs];
      lineItemsArray.forEach((item: any) => {
        removeFromCartMutation.mutate(item.id);
      });
    }
  };

  const renderCartItems = () => {
    if (!productsData || !Array.isArray(productsData.data)) return null;

    const lineItemRefs = cartData?.data?.relationships?.line_items?.data || [];
    const variantRefs = cartData?.data?.relationships?.variants?.data || [];

    if (
      Array.isArray(variantRefs) &&
      variantRefs.length > 0 &&
      Array.isArray(lineItemRefs)
    ) {
      return variantRefs.map((variantRef, index): any => {
        const lineItemRef = lineItemRefs[index];
        if (!lineItemRef) return null;

        const quantity = quantities[lineItemRef.id] || 1;
        const product = foundProduct(variantRef.id, productsData);

        return (
          <div
            key={lineItemRef.id || `cart-item-${index}`}
            className="flex items-center justify-between border-b border-border/30 py-3"
          >
            <span className="flex-1 font-body text-sm text-foreground">
              {product?.attributes?.name} - ${product?.attributes?.price}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  handleUpdateItemQuantity(lineItemRef.id, quantity - 1)
                }
                className="flex h-7 w-7 items-center justify-center rounded border border-border bg-transparent text-foreground transition-colors hover:bg-muted"
              >
                <Minus className="h-3 w-3" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e: any) => {
                  const newQty = parseInt(e.target.value) || 1;
                  if (newQty > 0) {
                    handleUpdateItemQuantity(lineItemRef.id, newQty);
                  }
                }}
                className="w-10 border-none bg-transparent text-center font-body text-sm text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                onClick={() =>
                  handleUpdateItemQuantity(lineItemRef.id, quantity + 1)
                }
                className="flex h-7 w-7 items-center justify-center rounded border border-border bg-transparent text-foreground transition-colors hover:bg-muted"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                onClick={() => handleRemoveItem(lineItemRef.id)}
                className="ml-1 flex h-7 w-7 items-center justify-center rounded border-none bg-transparent text-destructive transition-colors hover:bg-destructive/10"
                title="Remove item"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        );
      });
    }
    return null;
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
          className="cursor-pointer border-none bg-transparent p-1 text-foreground transition-colors hover:text-brand outline-none"
          aria-label="Open cart"
        >
          <ShoppingCart className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[360px] max-w-[90vw] p-0">
        <SheetHeader className="border-b border-border/30 px-6 py-4">
          <SheetTitle className="font-title text-lg">Cart</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="px-6 py-4">
            {cartIsLoading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <Loading />
              </div>
            ) : cartHasError ? (
              <p className="text-center font-body text-sm text-muted-foreground">
                Cart Error
              </p>
            ) : (
              <>
                {/* Item count & empty cart */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-body text-sm text-muted-foreground">
                    {item_count} {item_count > 1 ? "items" : "item"} in your
                    cart
                  </span>
                  {item_count > 0 && (
                    <button
                      onClick={handleEmptyCart}
                      className="flex items-center gap-1 rounded border border-destructive/30 bg-transparent px-2.5 py-1 font-body text-xs text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      Empty
                    </button>
                  )}
                </div>

                {/* Cart Items */}
                <div>{renderCartItems()}</div>

                {/* Totals */}
                <div className="mt-4 space-y-2 border-t border-border/30 pt-4">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold text-foreground">
                      {display_item_total}
                    </span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="text-foreground">
                      {included_tax_total}
                    </span>
                  </div>
                  <div className="flex justify-between font-title text-base font-bold">
                    <span>Total:</span>
                    <span>{display_total}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      toggle();
                      router.push("/cart");
                    }}
                  >
                    View Cart
                  </Button>
                  {user ? (
                    <Button
                      className="w-full"
                      onClick={() => {
                        toggle();
                        router.push("/checkout");
                      }}
                    >
                      Checkout
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="w-full"
                        onClick={() => {
                          toggle();
                          router.push("/checkout");
                        }}
                      >
                        Checkout as Guest
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          toggle();
                          router.push("/login");
                        }}
                      >
                        Login
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          toggle();
                          router.push("/signup");
                        }}
                      >
                        Sign Up
                      </Button>
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
