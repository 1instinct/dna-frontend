import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQueryClient, useMutation } from "react-query";
import { Heart, ImageIcon, ShoppingCart } from "lucide-react";
import { QueryKeys } from "@hooks/queryKeys";
import { AddItem } from "@spree/storefront-api-v2-sdk/types/interfaces/endpoints/CartClass";
import { addItemToCart } from "@hooks/useCart";
import { useToggleFavorite, useCheckFavorite } from "@hooks/useFavorites";
import { useAuth } from "@config/auth";
import { cn } from "@lib/utils";
import constants from "@utilities/constants";
import { MediaItem, staticMedia } from "@lib/productMedia";
import { ProductMedia } from "@components/ProductMedia";

// Shown when a product has no media at all.
export const CardMediaPlaceholder: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-muted">
    <ImageIcon className="h-8 w-8 text-muted-foreground/40" aria-hidden />
  </div>
);

interface ProductCardProps {
  item: any;
  opts?: any[];
  /** Grid media from pickGridMedia (lib/productMedia). */
  media?: MediaItem | null;
  /** Legacy: a plain image URL, used when `media` is not given. */
  imgSrc?: string;
}

export const ProductCard = ({
  imgSrc,
  item,
  opts,
  media
}: ProductCardProps) => {
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
    e.stopPropagation();
    if (!user) {
      const redirectUrl = encodeURIComponent(`/${product.attributes.slug}`);
      router.push(`/login?redirect=${redirectUrl}`);
      return;
    }
    toggleFavorite.mutate(variantId);
  };

  const isFavorited = !!favoriteCheck?.is_favorited;
  const name: string = item.attributes.name;
  // Swatches are colour only; screen readers get the option names instead.
  const colorNames = (opts || [])
    .map((opt: { attributes?: { name?: string } }) => opt?.attributes?.name)
    .filter((n): n is string => !!n);

  return (
    // The product name is the card's link; its ::after stretches over the
    // whole card, so the card is clickable and opens in a new tab, while the
    // favorite and add-to-cart buttons sit above it (z-10) and stay separate.
    <div className="group relative mt-4 cursor-pointer rounded-lg ring-offset-background has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
        <div className="h-full w-full">
          <ProductMedia
            media={
              media !== undefined
                ? media
                : staticMedia(imgSrc, item.attributes.name)
            }
            surface="grid"
            className="h-full w-full overflow-hidden"
            mediaClassName="h-full w-full object-cover transition-transform duration-500 ease-expo-out group-hover:scale-105"
            placeholder={<CardMediaPlaceholder />}
          />
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => handleToggleFavorite(e, item)}
          className={cn(
            "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-none backdrop-blur-sm transition-all duration-200",
            "hover:scale-110 active:scale-95",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isFavorited
              ? "bg-brand/90 text-white"
              : "bg-background/80 text-muted-foreground hover:bg-background/95 hover:text-brand"
          )}
          aria-label={`Favorite ${name}`}
          aria-pressed={isFavorited}
        >
          <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
        </button>

        {/* Quick Add Overlay: shown on hover, and on keyboard focus too */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 transition-transform duration-300 ease-expo-out group-focus-within:translate-y-0 group-hover:translate-y-0">
          <button
            type="button"
            onClick={() =>
              handleAddToCart({
                variant_id: item.relationships.default_variant.data.id,
                quantity: 1
              })
            }
            className="flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2.5 font-title text-sm font-medium text-white transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart<span className="sr-only">: {name}</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-title text-sm text-foreground">
            <Link
              href={`/${item.attributes.slug}`}
              className="text-inherit no-underline after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none"
            >
              {name}
            </Link>
          </h3>
          {/* Color Swatches */}
          {opts && opts.length > 0 && (
            <div
              className="mt-1.5 flex flex-wrap items-center gap-1.5"
              aria-hidden={colorNames.length > 0 ? undefined : true}
            >
              {colorNames.length > 0 && (
                <span className="sr-only">Colors: {colorNames.join(", ")}</span>
              )}
              {opts.map((opt: any, index: number) => (
                <span
                  key={`color-${index}`}
                  aria-hidden
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
    </div>
  );
};
