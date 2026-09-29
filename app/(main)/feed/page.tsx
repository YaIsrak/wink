import * as React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfileById } from '@/lib/services/auth.service'
import { getFeedPosts } from '@/lib/services/post.service'
import { getSuggestedUsers } from '@/lib/services/follow.service'
import { FeedView } from '@/components/posts/feed-view'

export default async function FeedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getUserProfileById(user.id)

  if (!profile?.onboardedAt) {
    redirect('/onboarding')
  }

  const [{ posts, nextCursor }, suggestedUsers] = await Promise.all([
    getFeedPosts({
      limit: 10,
      currentUserId: user.id,
      filter: 'all',
    }),
    getSuggestedUsers(user.id, 5),
  ])

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
      <FeedView
        user={{
          id: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
        }}
        initialPosts={posts}
        initialCursor={nextCursor}
        suggestedUsers={suggestedUsers}
        initialFilter="all"
      />
    </div>
  )
}
