import React from "react";
import { useRouter } from "next/router";
import {
  useUserProfile,
  useFollowUser,
  useUnfollowUser
} from "@hooks/useUserProfile";
import { Loading } from "@components/Loading";
import { UserProfileProps } from "./types";

export const UserProfile: React.FC<UserProfileProps> = ({ username }) => {
  const router = useRouter();
  const { data: userData, isLoading, error } = useUserProfile(username);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleFollowToggle = () => {
    if (!userData) return;

    if (userData.is_following) {
      unfollowMutation.mutate(username);
    } else {
      followMutation.mutate(username);
    }
  };

  if (isLoading) {
    return (
      <div className="section-container py-10">
        <Loading />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="section-container py-10">
        <div className="flex flex-col items-center justify-center rounded-xl glass-panel px-5 py-20 text-center text-white/50">
          User not found
        </div>
      </div>
    );
  }

  const displayName =
    userData.first_name && userData.last_name
      ? `${userData.first_name} ${userData.last_name}`
      : userData.email;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="section-container py-10">
      {/* Profile Header */}
      <div className="mb-8 flex items-center gap-6 rounded-xl border border-glass-border glass-panel p-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-neon-cyan/10 font-title text-2xl font-bold text-neon-cyan">
          {getInitials(displayName)}
        </div>
        <div>
          <h1 className="font-title text-xl font-bold text-white">
            {displayName}
          </h1>
          <p className="mt-0.5 font-body text-sm text-white/50">
            {userData.email}
          </p>
          <div className="mt-3 flex items-center gap-6">
            <div className="text-center">
              <span className="block font-title text-lg font-bold text-white">
                {userData.followers_count?.toLocaleString()}
              </span>
              <span className="font-body text-xs text-white/50">Followers</span>
            </div>
            <div className="text-center">
              <span className="block font-title text-lg font-bold text-white">
                {userData.following_count?.toLocaleString()}
              </span>
              <span className="font-body text-xs text-white/50">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Public Favorites */}
      <div>
        <h2 className="mb-4 font-title text-lg font-semibold uppercase tracking-wider text-white">
          Public Favorites
        </h2>
        {userData.public_favorites && userData.public_favorites.length > 0 ? (
          <div className="product-grid-comfortable">
            {userData.public_favorites.map((favorite: any) => (
              <div
                key={favorite.id}
                onClick={() => router.push(`/${favorite.slug}`)}
                className="group cursor-pointer overflow-hidden rounded-xl border border-glass-border glass-panel transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-square bg-muted" />
                <div className="p-4">
                  <h3 className="font-title text-sm font-semibold text-white">
                    {favorite.name}
                  </h3>
                  <p className="mt-1 font-body text-sm text-white/50">
                    ${favorite.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl glass-panel px-5 py-20 text-center text-white/50">
            No public favorites
          </div>
        )}
      </div>
    </div>
  );
};
