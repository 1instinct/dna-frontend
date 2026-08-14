import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useQueryClient, useMutation } from "react-query";
import { Heart, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { QueryKeys } from "@hooks/queryKeys";
import { AddItem } from "@spree/storefront-api-v2-sdk/types/interfaces/endpoints/CartClass";
import { addItemToCart } from "@hooks/useCart";
import { useToggleFavorite, useCheckFavorite } from "@hooks/useFavorites";
import { useAuth } from "@config/auth";
import { cn } from "@lib/utils";
import constants from "@utilities/constants";

// ──────────────────────────────────────────────
// Spree-powered ProductCard (original)
// ──────────────────────────────────────────────

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
      className="group mt-4 block cursor-pointer no-underline p-2"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface-deep transition-all duration-500 group-hover:shadow-[0_0_18px_rgba(0,255,255,0.25)]">
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
              ? "bg-neon-cyan/90 text-black"
              : "bg-surface-deep/80 text-white/50 hover:bg-surface-deep/95 hover:text-neon-cyan"
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
            className="flex w-full items-center justify-center gap-2 rounded-md bg-neon-cyan px-4 py-2.5 font-title text-sm font-medium text-black transition-colors hover:bg-neon-cyan/90"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 space-y-2">
        <h4 className="truncate font-title text-base font-medium text-white">
          {item.attributes.name}
        </h4>
        {/* Color Swatches */}
        {opts && opts.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {opts.map((opt: any, index: number) => (
              <span
                key={`color-${index}`}
                className="h-3 w-3 rounded-full border border-glass-border"
                style={{ backgroundColor: opt?.attributes?.presentation }}
              />
            ))}
          </div>
        )}
        <div className="inline-block rounded-md bg-surface-deep/80 px-2.5 py-1">
          <span className="font-ds-digital text-lg tracking-wider text-neon-cyan">
            ${item.attributes.price}
          </span>
        </div>
      </div>
    </Link>
  );
};

// ──────────────────────────────────────────────
// Placeholder Shop Card (static data, synthwave theme)
// ──────────────────────────────────────────────

export interface PlaceholderShopProduct {
  name: string;
  slug: string;
  price: string;
  category: string;
  preorder?: boolean;
  colors?: string[];
}

interface PlaceholderProductCardProps {
  product: PlaceholderShopProduct;
  index?: number;
}

export const PlaceholderProductCard: React.FC<PlaceholderProductCardProps> = ({
  product,
  index = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
    >
      <Link
        href={`/${product.slug}`}
        className="group block cursor-pointer no-underline p-2"
      >
        <div
          className={cn(
            "glass-panel relative overflow-hidden rounded-xl transition-all duration-500",
            "group-hover:-translate-y-1 group-hover:border-transparent group-hover:bg-white/[0.08]",
            "group-hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
          )}
        >
          {/* Image area (dark placeholder) */}
          <div className="relative aspect-[3/4] w-full bg-surface-deep">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neon-cyan/5 via-surface-deep to-neon-magenta/5">
              <span className="font-micro5-charted text-3xl text-white/10">
                {product.category === "Devices" && "\u0394"}
                {product.category === "Accessories" && "+"}
                {product.category === "Apparel" && "T"}
              </span>
            </div>

            {/* PRE-ORDER badge */}
            {product.preorder && (
              <div className="absolute left-3 top-3">
                <span className="badge-preorder">PRE-ORDER</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 space-y-2">
            <h4 className="truncate font-title text-base font-medium text-white">
              {product.name}
            </h4>
            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {product.colors.map((color, i) => (
                  <span
                    key={`swatch-${i}`}
                    className="h-3 w-3 rounded-full border border-glass-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
            <div className="inline-block rounded-md bg-surface-deep/80 px-2.5 py-1">
              <span className="font-ds-digital text-lg tracking-wider text-neon-cyan">
                {product.price}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
