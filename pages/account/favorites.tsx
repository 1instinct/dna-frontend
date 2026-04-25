import React, { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@lib/utils";
import { Layout } from "../../components/Layout";
import { Loading } from "../../components/Loading";
import { Button } from "@components/ui";
import { useFavorites, useRemoveFavorite } from "@hooks/useFavorites";
import { useAuth } from "@config/auth";

const Favorites = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: favoritesData, isLoading, error } = useFavorites(currentPage);
  const removeFavorite = useRemoveFavorite();

  if (!user) {
    router.push("/login?redirect=/account/favorites");
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="section-container py-10">
          <h1 className="mb-6 font-title text-3xl font-bold uppercase tracking-wider text-foreground">
            My Favorites
          </h1>
          <div className="flex flex-col items-center justify-center rounded-xl bg-card px-5 py-20 text-center">
            <h2 className="mb-3 font-title text-lg text-foreground">
              Error Loading Favorites
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              There was an error loading your favorites. Please try again.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const favorites = favoritesData?.data || [];
  const meta = favoritesData?.meta || {};
  const totalPages = meta.total_pages || 1;

  const handleRemove = (favoriteId: string, e: React.MouseEvent | null) => {
    if (e) {
      e.stopPropagation();
    }
    removeFavorite.mutateAsync(favoriteId).catch((error) => {
      console.error("Failed to remove favorite:", error);
    });
  };

  const handleCardClick = (productSlug: string) => {
    router.push(`/${productSlug}`);
  };

  return (
    <Layout>
      <div className="section-container py-10">
        <h1 className="mb-6 font-title text-3xl font-bold uppercase tracking-wider text-foreground">
          My Favorites
          {meta.total_count > 0 && (
            <span className="ml-3 text-lg font-normal text-muted-foreground">
              ({meta.total_count})
            </span>
          )}
        </h1>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-card px-5 py-20 text-center">
            <Heart className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h2 className="mb-3 font-title text-lg text-foreground">
              No Favorites Yet
            </h2>
            <p className="mb-6 font-body text-sm text-muted-foreground">
              Start adding products to your favorites to see them here!
            </p>
            <Button onClick={() => router.push("/")}>Shop Now</Button>
          </div>
        ) : (
          <>
            <div className="product-grid-comfortable">
              {favorites.map((favorite: any) => {
                const variant =
                  favorite?.attributes?.variant || favorite?.variant;
                const product =
                  variant?.product || variant?.attributes?.product;
                const imageUrl =
                  variant?.images?.[0]?.url ||
                  variant?.attributes?.images?.[0]?.url;

                return (
                  <div
                    key={favorite.id}
                    onClick={() =>
                      handleCardClick(
                        product?.slug || product?.attributes?.slug
                      )
                    }
                    className="group cursor-pointer overflow-hidden rounded-xl border border-border/30 bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-square bg-muted">
                      {imageUrl && (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_SPREE_API_URL}${imageUrl}`}
                          alt={
                            product?.name ||
                            product?.attributes?.name ||
                            "Product"
                          }
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="mb-1 font-title text-sm font-semibold text-foreground">
                        {product?.name ||
                          product?.attributes?.name ||
                          "Unknown Product"}
                      </h3>
                      <p className="mb-3 font-title text-sm font-bold text-brand">
                        {variant?.display_price ||
                          variant?.attributes?.display_price ||
                          "$0.00"}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(favorite.id, null as any);
                        }}
                        disabled={removeFavorite.isLoading}
                        className="w-full cursor-pointer rounded-lg border-none bg-destructive/10 px-4 py-2.5 font-title text-xs font-semibold uppercase tracking-wider text-destructive transition-colors hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {removeFavorite.isLoading ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "flex h-9 min-w-[36px] cursor-pointer items-center justify-center rounded-lg border px-3 font-body text-sm transition-colors",
                        page === currentPage
                          ? "border-brand bg-brand font-semibold text-white"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      )}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
