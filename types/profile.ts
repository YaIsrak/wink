export interface FollowUserItem {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  isFollowing: boolean
  isFollowedBy: boolean
  createdAt: Date
}

export interface ProfileStats {
  postsCount: number
  followersCount: number
  followingCount: number
  isFollowing: boolean
  isFollowedBy: boolean
  completionPercentage: number
}

export interface UserProfileData {
  id: string
  email: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  website: string | null
  location: string | null
  onboardedAt: Date | null
  createdAt: Date
  updatedAt: Date
  stats: ProfileStats
}
