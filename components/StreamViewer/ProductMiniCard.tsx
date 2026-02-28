import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "react-query";
import { addItemToCart } from "@hooks/useCart";
import { QueryKeys } from "@hooks/queryKeys";
import { cn } from "@lib/utils";

interface ProductMiniCardProps {
  product: any;
  variant?: "default" | "compact";
}

export const ProductMiniCard: React.FC<ProductMiniCardProps> = ({
  product,
  variant = "default"
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

  // ── Compact variant: vertical card for mobile horizontal scroll ──
  if (variant === "compact") {
    return (
      <div
        onClick={handleClick}
        className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] transition-all active:scale-[0.97]"
      >
        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-white/[0.04]">
          {imageUrl && (
            <Image
              src={`${process.env.NEXT_PUBLIC_SPREE_API_URL}${imageUrl}`}
              alt={product.attributes.name}
              fill
              className="object-cover transition-transform duration-500 ease-expo-out group-hover:scale-105"
            />
          )}
          {/* Quick add overlay */}
          <button
            onClick={handleAddToCart}
            disabled={addToCart.isLoading}
            className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-brand/90 py-1.5 font-mono-semibold text-[9px] uppercase tracking-widest text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 active:bg-brand disabled:opacity-50"
          >
            {addToCart.isLoading ? "..." : "+ Add"}
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-0.5 p-2.5">
          <h4 className="m-0 line-clamp-1 font-body text-[11px] leading-tight text-white/70">
            {product.attributes.name}
          </h4>
          <span className="font-mono-bold text-[13px] text-brand">
            ${product.attributes.price}
          </span>
        </div>
      </div>
    );
  }

  // ── Default variant: horizontal row card ──
  return (
    <div
      onClick={handleClick}
      className="group flex cursor-pointer gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 transition-all hover:border-white/[0.12] hover:bg-white/[0.05] active:scale-[0.98]"
    >
      {/* Thumbnail */}
      <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
        {imageUrl && (
          <Image
            src={`${process.env.NEXT_PUBLIC_SPREE_API_URL}${imageUrl}`}
            alt={product.attributes.name}
            fill
            className="object-cover transition-transform duration-500 ease-expo-out group-hover:scale-105"
          />
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h4 className="m-0 line-clamp-2 font-body text-[13px] leading-tight text-white/80">
            {product.attributes.name}
          </h4>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono-bold text-[14px] text-brand">
            ${product.attributes.price}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={addToCart.isLoading}
            className={cn(
              "rounded-full px-3 py-1 font-mono-semibold text-[10px] uppercase tracking-wider transition-all active:scale-90",
              addToCart.isLoading
                ? "bg-white/10 text-white/30"
                : "bg-brand/15 text-brand hover:bg-brand/25"
            )}
          >
            {addToCart.isLoading ? "..." : "+ Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};
