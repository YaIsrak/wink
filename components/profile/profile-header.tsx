'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarIcon,
  MapPinIcon,
  GlobeAltIcon,
  Cog6ToothIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/profile/follow-button'
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog'
import { FollowListDialog } from '@/components/profile/follow-list-dialog'
import { ProfileCompletionBanner } from '@/components/profile/profile-completion-banner'
import { calculateProfileCompletion } from '@/lib/services/user.service'
import type { UserProfileData } from '@/types/profile'
import { toast } from 'sonner'

interface ProfileHeaderProps {
  initialProfile: UserProfileData
  currentUserId: string
  isOwner: boolean
}

export function ProfileHeader({
  initialProfile,
  currentUserId,
  isOwner,
}: ProfileHeaderProps) {
  const [profile, setProfile] = React.useState(initialProfile)
  const [followersCount, setFollowersCount] = React.useState(
    initialProfile.stats.followersCount
  )
  const [followingCount, setFollowingCount] = React.useState(
    initialProfile.stats.followingCount
  )
  const [isFollowing, setIsFollowing] = React.useState(
    initialProfile.stats.isFollowing
  )

  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [followListOpen, setFollowListOpen] = React.useState(false)
  const [followListType, setFollowListType] = React.useState<'followers' | 'following'>('followers')
  const router = useRouter()

  const completionPercentage = React.useMemo(() => {
    return calculateProfileCompletion({
      displayName: profile.displayName,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      website: profile.website,
      location: profile.location,
    })
  }, [profile])

  const joinDate = new Date(profile.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Profile link copied to clipboard')
    } catch {
      toast.error('Unable to copy profile link')
    }
  }

  const openFollowers = () => {
    setFollowListType('followers')
    setFollowListOpen(true)
  }

  const openFollowing = () => {
    setFollowListType('following')
    setFollowListOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Gamified Profile Completion Milestone Banner for Owner */}
      {isOwner && (
        <ProfileCompletionBanner
          completionPercentage={completionPercentage}
          onEditClick={() => setEditDialogOpen(true)}
        />
      )}

      {/* 2. Main Profile Identity Card */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Banner Graphic Header */}
        <div className="relative h-36 sm:h-48 w-full bg-linear-to-r from-muted via-muted/70 to-card overflow-hidden">
          <div className="absolute inset-0 bg-radial from-foreground/5 to-transparent opacity-80" />
        </div>

        {/* Identity & Actions Bar */}
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 relative flex flex-col">
          {/* Avatar and Action Buttons Row */}
          <div className="flex items-end justify-between -mt-14 sm:-mt-18 mb-4">
            {/* Avatar with Online Beacon */}
            <div className="relative group">
              <div className="p-1 rounded-full bg-card ring-2 ring-border shadow-md">
                <Avatar
                  src={profile.avatarUrl ?? undefined}
                  fallback={
                    profile.displayName?.slice(0, 2) ||
                    profile.username?.slice(0, 2) ||
                    'WK'
                  }
                  size="xl"
                  status="online"
                  className="size-24 sm:size-28 text-2xl"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isOwner ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditDialogOpen(true)}
                    className="rounded-lg font-semibold text-xs gap-1.5 shadow-2xs"
                  >
                    <Cog6ToothIcon className="size-3.5" />
                    <span>Edit Profile</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleShare}
                    aria-label="Share profile"
                    className="size-8.5 rounded-lg shadow-2xs"
                  >
                    <ShareIcon className="size-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <FollowButton
                    targetUserId={profile.id}
                    initialIsFollowing={isFollowing}
                    onFollowChange={(nextFollowing, diff) => {
                      setIsFollowing(nextFollowing)
                      setFollowersCount((prev) => Math.max(0, prev + diff))
                    }}
                    size="default"
                    className="px-5"
                  />
                  {isFollowing && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push('/messages')}
                      className="rounded-lg font-semibold text-xs gap-1.5 shadow-2xs h-9 px-3"
                    >
                      <ChatBubbleLeftRightIcon className="size-3.5" />
                      <span>Message</span>
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleShare}
                    aria-label="Share profile"
                    className="size-9 rounded-lg shadow-2xs"
                  >
                    <ShareIcon className="size-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Name & Handle */}
          <div className="space-y-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {profile.displayName || profile.username}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                @{profile.username}
              </p>
            </div>

            {/* Bio */}
            {profile.bio ? (
              <p className="text-sm leading-relaxed text-foreground/90 max-w-xl whitespace-pre-line pt-1">
                {profile.bio}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic pt-0.5">
                No bio provided yet.
              </p>
            )}

            {/* Metadata Chips: Location, Website, Joined Date */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="size-3.5 text-muted-foreground/80 shrink-0" />
                  <span>{profile.location}</span>
                </span>
              )}

              {profile.website && (
                <a
                  href={
                    profile.website.startsWith('http://') ||
                    profile.website.startsWith('https://')
                      ? profile.website
                      : `https://${profile.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-foreground font-medium hover:underline hover:text-primary transition-colors"
                >
                  <GlobeAltIcon className="size-3.5 text-muted-foreground/80 shrink-0" />
                  <span className="truncate max-w-[220px]">
                    {profile.website.replace(/^https?:\/\//, '')}
                  </span>
                </a>
              )}

              <span className="flex items-center gap-1.5">
                <CalendarIcon className="size-3.5 text-muted-foreground/80 shrink-0" />
                <span>Joined {joinDate}</span>
              </span>
            </div>

            {/* Social Stats Counters: Followers, Following, Posts */}
            <div className="flex items-center gap-6 pt-3 text-sm">
              <button
                type="button"
                onClick={openFollowers}
                className="flex items-baseline gap-1.5 hover:underline cursor-pointer group"
              >
                <span className="font-bold text-foreground">
                  {followersCount}
                </span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {followersCount === 1 ? 'Follower' : 'Followers'}
                </span>
              </button>

              <button
                type="button"
                onClick={openFollowing}
                className="flex items-baseline gap-1.5 hover:underline cursor-pointer group"
              >
                <span className="font-bold text-foreground">
                  {followingCount}
                </span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  Following
                </span>
              </button>

              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-foreground">
                  {profile.stats.postsCount}
                </span>
                <span className="text-xs text-muted-foreground">
                  {profile.stats.postsCount === 1 ? 'Post' : 'Posts'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog Modal */}
      {isOwner && (
        <EditProfileDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          profile={{
            id: profile.id,
            displayName: profile.displayName,
            bio: profile.bio,
            location: profile.location,
            website: profile.website,
            avatarUrl: profile.avatarUrl,
          }}
          onProfileUpdated={(updated) => {
            setProfile((prev) => ({
              ...prev,
              ...updated,
            }))
          }}
        />
      )}

      {/* Followers / Following List Dialog Modal */}
      <FollowListDialog
        userId={profile.id}
        username={profile.username}
        type={followListType}
        open={followListOpen}
        onOpenChange={setFollowListOpen}
        currentUserId={currentUserId}
      />
    </div>
  )
}
