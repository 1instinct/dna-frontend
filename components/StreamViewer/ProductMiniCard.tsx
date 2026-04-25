import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "react-query";
import { addItemToCart } from "@hooks/useCart";
import { QueryKeys } from "@hooks/queryKeys";

interface ProductMiniCardProps {
  product: any;
}

export const ProductMiniCard: React.FC<ProductMiniCardProps> = ({
  product
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

  return (
    <div
      onClick={handleClick}
      className="flex cursor-pointer gap-3 rounded-lg border border-white/10 bg-black/70 p-3 backdrop-blur-[10px] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-muted">
        {imageUrl && (
          <Image
            src={`${process.env.NEXT_PUBLIC_SPREE_API_URL}${imageUrl}`}
            alt={product.attributes.name}
            fill
            style={{ objectFit: "cover" }}
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <h4 className="m-0 line-clamp-2 text-sm font-semibold text-white">
          {product.attributes.name}
        </h4>
        <div className="my-1 text-base font-bold text-brand">
          ${product.attributes.price}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={addToCart.isLoading}
          className="w-full rounded bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {addToCart.isLoading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};
