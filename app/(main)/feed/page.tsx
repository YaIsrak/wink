import * as React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfileById } from '@/lib/services/auth.service'
import { getFeedPosts } from '@/lib/services/post.service'
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

  const { posts, nextCursor } = await getFeedPosts({ limit: 20 })

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
      />
    </div>
  )
}
