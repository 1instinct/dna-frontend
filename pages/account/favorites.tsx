import React, { useState } from "react";
import { useRouter } from "next/router";
import styled from "@emotion/styled";
import Image from "next/image";
import { Layout, Loading, Button } from "../../components";
import { useFavorites, useRemoveFavorite } from "@hooks/useFavorites";
import { useAuth } from "@config/auth";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 543px);
`;

const PageTitle = styled.h1`
  font-family: ${(p) => p.theme.typography.titleLG.fontFamily};
  font-size: 32px;
  margin-bottom: 30px;
  text-transform: uppercase;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

const FavoritesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 30px;
`;

const FavoriteCard = styled.div`
  border: 1px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.primary
        : p.theme.colors.gray.light};
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const FavoriteImage = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.gray.primary
      : p.theme.colors.gray.background};
`;

const FavoriteInfo = styled.div`
  padding: 20px;
`;

const FavoriteName = styled.h3`
  font-family: ${(p) => p.theme.typography.titleMD.fontFamily};
  font-size: 18px;
  margin-bottom: 10px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
`;

const FavoritePrice = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: ${(p) => p.theme.colors.brand.primary};
`;

const RemoveButton = styled.button`
  width: 100%;
  height: 48px;
  background: ${(p) => p.theme.colors.red.primary};
  color: ${(p) => p.theme.colors.white.primary};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: ${(p) => p.theme.typography.titleSM.fontFamily};
  font-size: ${(p) => p.theme.typography.titleSM.fontSize};
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${(p) =>
    p.theme.isDarkMode
      ? p.theme.colors.white.medium
      : p.theme.colors.black.medium};
`;

const EmptyTitle = styled.h2`
  font-family: ${(p) => p.theme.typography.titleMD.fontFamily};
  font-size: 24px;
  margin-bottom: 15px;
`;

const EmptyText = styled.p`
  font-size: 16px;
  margin-bottom: 30px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 40px;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 10px 20px;
  border: 1px solid
    ${(p) =>
      p.theme.isDarkMode
        ? p.theme.colors.gray.medium
        : p.theme.colors.gray.primary};
  background: ${(p) =>
    p.active
      ? p.theme.colors.brand.primary
      : p.theme.isDarkMode
      ? p.theme.colors.black.primary
      : p.theme.colors.white.primary};
  color: ${(p) =>
    p.active
      ? p.theme.colors.white.primary
      : p.theme.isDarkMode
      ? p.theme.colors.white.primary
      : p.theme.colors.black.primary};
  cursor: pointer;
  border-radius: 4px;
  font-family: ${(p) => p.theme.typography.bodyMD.fontFamily};

  &:hover {
    background: ${(p) =>
      p.active ? p.theme.colors.brand.primary : p.theme.colors.gray.light};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

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
        <Container>
          <PageTitle>My Favorites</PageTitle>
          <EmptyState>
            <EmptyTitle>Error Loading Favorites</EmptyTitle>
            <EmptyText>
              There was an error loading your favorites. Please try again.
            </EmptyText>
          </EmptyState>
        </Container>
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
      <Container>
        <PageTitle>My Favorites ({meta.total_count || 0})</PageTitle>

        {favorites.length === 0 ? (
          <EmptyState>
            <EmptyTitle>No Favorites Yet</EmptyTitle>
            <EmptyText>
              Start adding products to your favorites to see them here!
            </EmptyText>
            <Button onClick={() => router.push("/")}>Shop Now</Button>
          </EmptyState>
        ) : (
          <>
            <FavoritesGrid>
              {favorites.map((favorite: any) => {
                const variant =
                  favorite?.attributes?.variant || favorite?.variant;
                const product =
                  variant?.product || variant?.attributes?.product;
                const imageUrl =
                  variant?.images?.[0]?.url ||
                  variant?.attributes?.images?.[0]?.url;

                return (
                  <FavoriteCard
                    key={favorite.id}
                    onClick={() =>
                      handleCardClick(
                        product?.slug || product?.attributes?.slug
                      )
                    }
                  >
                    <FavoriteImage>
                      {imageUrl && (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_SPREE_API_URL}${imageUrl}`}
                          alt={
                            product?.name ||
                            product?.attributes?.name ||
                            "Product"
                          }
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      )}
                    </FavoriteImage>
                    <FavoriteInfo>
                      <FavoriteName>
                        {product?.name ||
                          product?.attributes?.name ||
                          "Unknown Product"}
                      </FavoriteName>
                      <FavoritePrice>
                        {variant?.display_price ||
                          variant?.attributes?.display_price ||
                          "$0.00"}
                      </FavoritePrice>
                      <RemoveButton
                        onClick={() => handleRemove(favorite.id, null as any)}
                        disabled={removeFavorite.isLoading}
                      >
                        {removeFavorite.isLoading ? "Removing..." : "Remove"}
                      </RemoveButton>
                    </FavoriteInfo>
                  </FavoriteCard>
                );
              })}
            </FavoritesGrid>

            {totalPages > 1 && (
              <Pagination>
                <PageButton
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </PageButton>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PageButton
                      key={page}
                      active={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PageButton>
                  )
                )}
                <PageButton
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </PageButton>
              </Pagination>
            )}
          </>
        )}
      </Container>
    </Layout>
  );
};

export default Favorites;
