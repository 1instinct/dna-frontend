import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useQueryClient, useMutation } from "react-query";
import { Heart, ShoppingCart } from "lucide-react";
import { QueryKeys } from "@hooks/queryKeys";
import { AddItem } from "@spree/storefront-api-v2-sdk/types/interfaces/endpoints/CartClass";
import { addItemToCart } from "@hooks/useCart";
import { useToggleFavorite, useCheckFavorite } from "@hooks/useFavorites";
import { useAuth } from "@config/auth";
import { cn } from "@lib/utils";
import constants from "@utilities/constants";

export const ProductCard = ({ imgSrc, item, opts }: any) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const variantId = item.relationships.default_variant.data.id;

  const { data: favoriteCheck } = useCheckFavorite(variantId, !!user);
  const toggleFavorite = useToggleFavorite();

  const addToCart = useMutation(addItemToCart, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.CART);
      constants.IS_DEBUG && console.log("Item added to cart successfully");
    },
    onError: (error: any) => {
      console.error("Failed to add item to cart:", error);
    }
  });

  const handleAddToCart = (item: AddItem) => {
    constants.IS_DEBUG && console.log("Adding to cart:", item);
    addToCart.mutate(item);
  };

  const handleToggleFavorite = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      const redirectUrl = encodeURIComponent(`/${product.attributes.slug}`);
      router.push(`/login?redirect=${redirectUrl}`);
      return;
    }
    toggleFavorite.mutate(variantId);
  };

  const isFavorited = favoriteCheck?.is_favorited;

  return (
    <Link
      href={`/${item.attributes.slug}`}
      className="group mt-4 block cursor-pointer no-underline"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
        <img
          src={imgSrc}
          alt={item.attributes.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-expo-out group-hover:scale-105"
        />

        {/* Favorite Button */}
        <button
          onClick={(e) => handleToggleFavorite(e, item)}
          className={cn(
            "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-none backdrop-blur-sm transition-all duration-200",
            "hover:scale-110 active:scale-95",
            isFavorited
              ? "bg-brand/90 text-white"
              : "bg-background/80 text-muted-foreground hover:bg-background/95 hover:text-brand"
          )}
          aria-label={
            isFavorited ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 transition-transform duration-300 ease-expo-out group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart({
                variant_id: item.relationships.default_variant.data.id,
                quantity: 1
              });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2.5 font-title text-sm font-medium text-white transition-colors hover:bg-brand/90"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-title text-sm text-foreground">
            {item.attributes.name}
          </h4>
          {/* Color Swatches */}
          {opts && opts.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {opts.map((opt: any, index: number) => (
                <span
                  key={`color-${index}`}
                  className="h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: opt?.attributes?.presentation }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="font-title text-sm font-semibold text-foreground">
            ${item.attributes.price}
          </span>
        </div>
      </div>
    </Link>
  );
};
