import { useQuery, useMutation, useQueryClient } from "react-query";
import { QueryKeys } from "@hooks/queryKeys";
import constants from "@utilities/constants";

// Fetch user's favorites
export const fetchFavorites = async (page: number = 1) => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();
  const spreeToken = process.env.NEXT_PUBLIC_SPREE_ACCESS_TOKEN;

  if (!token?.access_token) {
    throw new Error("Not authenticated");
  }

  const apiUrl = process.env.NEXT_PUBLIC_SPREE_API_URL;
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json");
  requestHeaders.set("X-Spree-Token", `${spreeToken}`);
  requestHeaders.set("Authorization", `Bearer ${token.access_token}`);

  const response = await fetch(`${apiUrl}/api/v1/favorites?page=${page}`, {
    method: "GET",
    headers: requestHeaders
  });

  if (!response.ok) {
    throw new Error("Failed to fetch favorites");
  }

  return response.json();
};

// Toggle favorite (add or remove)
export const toggleFavorite = async (variantId: string) => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();
  const spreeToken = process.env.NEXT_PUBLIC_SPREE_ACCESS_TOKEN;

  if (!token?.access_token) {
    throw new Error("Not authenticated");
  }

  const apiUrl = process.env.NEXT_PUBLIC_SPREE_API_URL;
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json");
  requestHeaders.set("X-Spree-Token", `${spreeToken}`);
  requestHeaders.set("Authorization", `Bearer ${token.access_token}`);

  const response = await fetch(`${apiUrl}/api/v1/favorites/toggle`, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({ variant_id: variantId })
  });

  if (!response.ok) {
    throw new Error("Failed to toggle favorite");
  }

  return response.json();
};

// Remove favorite
export const removeFavorite = async (favoriteId: string) => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();
  const spreeToken = process.env.NEXT_PUBLIC_SPREE_ACCESS_TOKEN;

  if (!token?.access_token) {
    throw new Error("Not authenticated");
  }

  const apiUrl = process.env.NEXT_PUBLIC_SPREE_API_URL;
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json");
  requestHeaders.set("X-Spree-Token", `${spreeToken}`);
  requestHeaders.set("Authorization", `Bearer ${token.access_token}`);

  const response = await fetch(`${apiUrl}/api/v1/favorites/${favoriteId}`, {
    method: "DELETE",
    headers: requestHeaders
  });

  if (!response.ok) {
    throw new Error("Failed to remove favorite");
  }

  return response.json();
};

// Check if variant is favorited
export const checkFavorite = async (variantId: string) => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();
  const spreeToken = process.env.NEXT_PUBLIC_SPREE_ACCESS_TOKEN;

  if (!token?.access_token) {
    return { is_favorited: false };
  }

  const apiUrl = process.env.NEXT_PUBLIC_SPREE_API_URL;
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json");
  requestHeaders.set("X-Spree-Token", `${spreeToken}`);
  requestHeaders.set("Authorization", `Bearer ${token.access_token}`);

  const response = await fetch(
    `${apiUrl}/api/v1/favorites/check?variant_id=${variantId}`,
    {
      method: "GET",
      headers: requestHeaders
    }
  );

  if (!response.ok) {
    return { is_favorited: false };
  }

  return response.json();
};

// Hook to fetch favorites
export const useFavorites = (page: number = 1) => {
  return useQuery([QueryKeys.FAVORITES, page], () => fetchFavorites(page), {
    staleTime: 30000,
    retry: 1
  });
};

// Hook to toggle favorite
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation(toggleFavorite, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.FAVORITES);
      queryClient.invalidateQueries(QueryKeys.FAVORITE_CHECK);
    }
  });
};

// Hook to remove favorite
export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation(removeFavorite, {
    onSuccess: () => {
      queryClient.invalidateQueries(QueryKeys.FAVORITES);
      queryClient.invalidateQueries(QueryKeys.FAVORITE_CHECK);
    }
  });
};

// Hook to check if variant is favorited
export const useCheckFavorite = (
  variantId: string,
  enabled: boolean = true
) => {
  return useQuery(
    [QueryKeys.FAVORITE_CHECK, variantId],
    () => checkFavorite(variantId),
    {
      enabled: enabled && !!variantId,
      staleTime: 30000,
      retry: 1
    }
  );
};
