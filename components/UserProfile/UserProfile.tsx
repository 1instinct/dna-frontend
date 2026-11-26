import React from "react";
import Link from "next/link";
import {
  useUserProfile,
  useFollowUser,
  useUnfollowUser
} from "@hooks/useUserProfile";
import { Loading } from "@components/Loading";
import { UserProfileProps } from "./types";

export const UserProfile: React.FC<UserProfileProps> = ({ username }) => {
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
        <h1 className="flex flex-col items-center justify-center rounded-xl bg-card px-5 py-20 text-center text-muted-foreground">
          User not found
        </h1>
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
      <div className="mb-8 flex items-center gap-6 rounded-xl border border-border/30 bg-card p-6">
        <div
          aria-hidden
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand/10 font-title text-2xl font-bold text-brand"
        >
          {getInitials(displayName)}
        </div>
        <div>
          <h1 className="font-title text-xl font-bold text-foreground">
            {displayName}
          </h1>
          <p className="mt-0.5 font-body text-sm text-muted-foreground">
            {userData.email}
          </p>
          <div className="mt-3 flex items-center gap-6">
            <div className="text-center">
              <span className="block font-title text-lg font-bold text-foreground">
                {userData.followers_count?.toLocaleString()}
              </span>
              <span className="font-body text-xs text-muted-foreground">
                Followers
              </span>
            </div>
            <div className="text-center">
              <span className="block font-title text-lg font-bold text-foreground">
                {userData.following_count?.toLocaleString()}
              </span>
              <span className="font-body text-xs text-muted-foreground">
                Following
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Public Favorites */}
      <div>
        <h2 className="mb-4 font-title text-lg font-semibold uppercase tracking-wider text-foreground">
          Public Favorites
        </h2>
        {userData.public_favorites && userData.public_favorites.length > 0 ? (
          <div className="product-grid-comfortable">
            {userData.public_favorites.map((favorite: any) => (
              <Link
                key={favorite.id}
                href={`/${favorite.slug}`}
                className="group block overflow-hidden rounded-xl border border-border/30 bg-card no-underline transition-all hover:-translate-y-0.5 hover:shadow-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="aspect-square bg-muted" />
                <div className="p-4">
                  <h3 className="font-title text-sm font-semibold text-foreground">
                    {favorite.name}
                  </h3>
                  <p className="mt-1 font-body text-sm text-muted-foreground">
                    ${favorite.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl bg-card px-5 py-20 text-center text-muted-foreground">
            No public favorites
          </div>
        )}
      </div>
    </div>
  );
};
