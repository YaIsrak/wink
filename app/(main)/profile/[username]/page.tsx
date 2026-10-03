import * as React from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfileById } from '@/lib/services/auth.service'
import { getFullUserProfileByUsername } from '@/lib/services/user.service'
import { getUserPosts } from '@/lib/services/post.service'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      displayName: true,
      username: true,
      bio: true,
    },
  })

  if (!user) {
    return {
      title: 'User Not Found',
      description: 'The requested profile could not be found on Wink.',
    }
  }

  const title = `${user.displayName} (@${user.username})`
  const description =
    user.bio && user.bio.trim().length > 0
      ? user.bio
      : `Check out ${user.displayName}'s profile and posts on Wink.`

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Wink`,
      description,
      url: `/profile/${user.username}`,
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Wink`,
      description,
    },
  }
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
