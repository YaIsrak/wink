import * as React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SearchView } from '@/components/search/search-view'
import { getSuggestedUsers } from '@/lib/services/follow.service'
import {
  searchTopSummary,
  searchUsers,
  searchPosts,
} from '@/lib/services/search.service'
import type { SearchTab } from '@/types/search'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    tab?: string
  }>
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search creators, accounts, and posts across Wink.',
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const rawQuery = resolvedParams.q?.trim() || ''
  const validTabs: SearchTab[] = ['top', 'accounts', 'posts']
  const rawTab = resolvedParams.tab as SearchTab
  const activeTab: SearchTab = validTabs.includes(rawTab) ? rawTab : 'top'

  // Pre-fetch initial data on server based on query
  let initialTopResult = null
  let initialUsersResult = null
  let initialPostsResult = null

  if (rawQuery) {
    if (activeTab === 'accounts') {
      initialUsersResult = await searchUsers(user.id, rawQuery, null, 10)
    } else if (activeTab === 'posts') {
      initialPostsResult = await searchPosts(user.id, rawQuery, null, 10)
    } else {
      initialTopResult = await searchTopSummary(user.id, rawQuery)
    }
  }

  // Fetch suggested users for zero query and empty state
  const suggestedUsers = await getSuggestedUsers(user.id, 5)

  return (
    <SearchView
      initialQuery={rawQuery}
      initialTab={activeTab}
      initialTopResult={initialTopResult}
      initialUsersResult={initialUsersResult}
      initialPostsResult={initialPostsResult}
      suggestedUsers={suggestedUsers}
      currentUserId={user.id}
    />
  )
}
