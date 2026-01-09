import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  useUserProfile,
  useFollowUser,
  useUnfollowUser
} from "@hooks/useUserProfile";
import { Loading } from "@components/Loading";
import { UserProfileProps } from "./types";
import {
  ProfileWrapper,
  ProfileHeader,
  Avatar,
  ProfileInfo,
  Username,
  Bio,
  Stats,
  Stat,
  StatValue,
  StatLabel,
  ContentSection,
  SectionTitle,
  StreamGrid,
  StreamCard,
  StreamThumbnail,
  LiveBadge,
  StreamInfo,
  StreamTitle,
  StreamMeta,
  EmptyState
} from "./UserProfile.styles";

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
      <ProfileWrapper>
        <Loading />
      </ProfileWrapper>
    );
  }

  if (error || !userData) {
    return (
      <ProfileWrapper>
        <EmptyState>User not found</EmptyState>
      </ProfileWrapper>
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
    <ProfileWrapper>
      <ProfileHeader>
        <Avatar>{getInitials(displayName)}</Avatar>
        <ProfileInfo>
          <Username>{displayName}</Username>
          <Bio>{userData.email}</Bio>
          <Stats>
            <Stat>
              <StatValue>
                {userData.followers_count?.toLocaleString()}
              </StatValue>
              <StatLabel>Followers</StatLabel>
            </Stat>
            <Stat>
              <StatValue>
                {userData.following_count?.toLocaleString()}
              </StatValue>
              <StatLabel>Following</StatLabel>
            </Stat>
          </Stats>
        </ProfileInfo>
      </ProfileHeader>

      <ContentSection>
        <SectionTitle>Public Favorites</SectionTitle>
        {userData.public_favorites && userData.public_favorites.length > 0 ? (
          <StreamGrid>
            {userData.public_favorites.map((favorite) => (
              <StreamCard
                key={favorite.id}
                onClick={() => router.push(`/${favorite.slug}`)}
              >
                <StreamThumbnail />
                <StreamInfo>
                  <StreamTitle>{favorite.name}</StreamTitle>
                  <StreamMeta>${favorite.price}</StreamMeta>
                </StreamInfo>
              </StreamCard>
            ))}
          </StreamGrid>
        ) : (
          <EmptyState>No public favorites</EmptyState>
        )}
      </ContentSection>
    </ProfileWrapper>
  );
};
