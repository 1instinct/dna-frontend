export interface UserProfileProps {
  username: string;
}

export interface UserProfileData {
  id: string;
  username: string;
  bio?: string;
  avatar?: string;
  followerCount?: number;
  followingCount?: number;
  streamCount?: number;
}
