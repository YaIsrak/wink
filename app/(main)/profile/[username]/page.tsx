import * as React from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfileById } from '@/lib/services/auth.service'
import { getFullUserProfileByUsername } from '@/lib/services/user.service'
import { getUserPosts } from '@/lib/services/post.service'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  const supabase = await createClient()
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser()

  if (!sessionUser) {
    redirect('/login')
  }

  const viewerProfile = await getUserProfileById(sessionUser.id)
  if (!viewerProfile?.onboardedAt) {
    redirect('/onboarding')
  }

  const targetProfile = await getFullUserProfileByUsername(username, sessionUser.id)
  if (!targetProfile) {
    notFound()
  }

  const posts = await getUserPosts(targetProfile.id, sessionUser.id)
  const isOwner = sessionUser.id === targetProfile.id

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8 flex flex-col gap-6">
      {/* Back to feed header */}
      <div className="flex items-center gap-2">
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
        >
          <ArrowLeftIcon className="size-4" />
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Profile Header with Identity, Stats, Follow and Edit Actions */}
      <ProfileHeader
        initialProfile={targetProfile}
        currentUserId={sessionUser.id}
        isOwner={isOwner}
      />

      {/* Profile Tabs: Posts (Feed & Grid), Media gallery, Replies and Saved */}
      <ProfileTabs
        posts={posts}
        currentUserId={sessionUser.id}
        currentUserProfile={viewerProfile}
        isOwner={isOwner}
        username={targetProfile.username}
      />
    </div>
  )
}
