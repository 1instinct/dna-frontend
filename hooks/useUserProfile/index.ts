import { useQuery, useMutation, useQueryClient } from "react-query";
import { QueryKeys } from "@hooks/queryKeys";

// API base URL - adjust if needed
const API_BASE =
  process.env.NEXT_PUBLIC_SPREE_API_URL || "http://localhost:3001";

export interface UserProfileData {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  public_favorites: Array<{
    id: number;
    variant_id: number;
    product_id: number;
    name: string;
    slug: string;
    price: string;
  }>;
}

export interface UserProfileResponse {
  response_code: number;
  response_message: string;
  response_data: UserProfileData;
}

// Fetch user profile
export const fetchUserProfile = async (
  userId: string
): Promise<UserProfileData> => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json"
  };

  if (token?.access_token) {
    headers["Authorization"] = `Bearer ${token.access_token}`;
  }

  const response = await fetch(`${API_BASE}/api/v1/users/${userId}/profile`, {
    headers
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  const data: UserProfileResponse = await response.json();
  return data.response_data;
};

// Follow user
export const followUser = async (userId: string) => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();

  if (!token?.access_token) {
    throw new Error("Must be logged in to follow users");
  }

  const response = await fetch(`${API_BASE}/api/v1/users/${userId}/follow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.access_token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to follow user");
  }

  return response.json();
};

// Unfollow user
export const unfollowUser = async (userId: string) => {
  const storage = (await import("../../config/storage")).default;
  const token = await storage.getToken();

  if (!token?.access_token) {
    throw new Error("Must be logged in to unfollow users");
  }

  const response = await fetch(`${API_BASE}/api/v1/users/${userId}/unfollow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.access_token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to unfollow user");
  }

  return response.json();
};

// Hook to get user profile
export const useUserProfile = (userId: string) => {
  return useQuery(
    [QueryKeys.USER_PROFILE, userId],
    () => fetchUserProfile(userId),
    {
      enabled: !!userId && userId !== "undefined" && userId !== "null",
      staleTime: 30000,
      retry: false
    }
  );
};

// Hook to follow user
export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation(followUser, {
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries([QueryKeys.USER_PROFILE, userId]);
    }
  });
};

// Hook to unfollow user
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation(unfollowUser, {
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries([QueryKeys.USER_PROFILE, userId]);
    }
  });
};
