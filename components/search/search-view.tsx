'use client'

import * as React from 'react'
import type {
  SearchTab,
  UserSearchResult,
  RecentSearchItem,
  SearchTopResult,
  SearchUsersResult,
  SearchPostsResult,
} from '@/types/search'
import type { PostWithAuthor } from '@/types/post'
import type { SuggestedUserItem } from '@/components/profile/suggested-users'
import { SearchInput } from './search-input'
import { SearchTabs } from './search-tabs'
import { RecentSearches } from './recent-searches'
import { UserSearchResultCard } from './user-search-result'
import { PostSearchResultCard } from './post-search-result'
import { SearchEmptyState } from './search-empty-state'
import { SuggestedUsers } from '@/components/profile/suggested-users'
import { InfiniteScrollSentinel } from '@/components/posts/infinite-scroll-sentinel'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  searchTopAction,
  searchUsersAction,
  searchPostsAction,
} from '@/actions/search'
import {
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from '@/lib/utils/search-history'
import { toast } from 'sonner'
import {
  ArrowRightIcon,
  ArrowPathIcon,
  UsersIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

interface SearchViewProps {
  initialQuery?: string
  initialTab?: SearchTab
  initialTopResult?: SearchTopResult | null
  initialUsersResult?: SearchUsersResult | null
  initialPostsResult?: SearchPostsResult | null
  suggestedUsers?: SuggestedUserItem[]
  currentUserId: string
}

export function SearchView({
  initialQuery = '',
  initialTab = 'top',
  initialTopResult = null,
  initialUsersResult = null,
  initialPostsResult = null,
  suggestedUsers = [],
  currentUserId,
}: SearchViewProps) {
  const [query, setQuery] = React.useState(initialQuery)
  const [activeTab, setActiveTab] = React.useState<SearchTab>(initialTab)

  // Recent searches state
  const [recentSearches, setRecentSearches] = React.useState<RecentSearchItem[]>([])

  // Search results state
  const [topResult, setTopResult] = React.useState<SearchTopResult | null>(initialTopResult)
  const [usersList, setUsersList] = React.useState<UserSearchResult[]>(
    initialUsersResult ? initialUsersResult.users : []
  )
  const [usersCursor, setUsersCursor] = React.useState<string | null>(
    initialUsersResult ? initialUsersResult.nextCursor : null
  )
  const [hasMoreUsers, setHasMoreUsers] = React.useState<boolean>(
    initialUsersResult ? initialUsersResult.hasMore : false
  )

  const [postsList, setPostsList] = React.useState<PostWithAuthor[]>(
    initialPostsResult ? initialPostsResult.posts : []
  )
  const [postsCursor, setPostsCursor] = React.useState<string | null>(
    initialPostsResult ? initialPostsResult.nextCursor : null
  )
  const [hasMorePosts, setHasMorePosts] = React.useState<boolean>(
    initialPostsResult ? initialPostsResult.hasMore : false
  )

  // Status flags
  const [isSearching, setIsSearching] = React.useState(false)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const [hasSearched, setHasSearched] = React.useState(Boolean(initialQuery.trim()))
  const [searchError, setSearchError] = React.useState<string | null>(null)
  const [paginationError, setPaginationError] = React.useState(false)

  // Initialize recent searches from localStorage on mount
  React.useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  // Sync URL query params without layout remounts
  const syncUrl = React.useCallback((q: string, tab: SearchTab) => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const clean = q.trim()

    if (clean) {
      url.searchParams.set('q', clean)
    } else {
      url.searchParams.delete('q')
    }

    if (tab && tab !== 'top') {
      url.searchParams.set('tab', tab)
    } else {
      url.searchParams.delete('tab')
    }

    window.history.replaceState(null, '', url.toString())
  }, [])

  // Execute primary search query
  const executeSearch = React.useCallback(
    async (searchQuery: string, targetTab: SearchTab) => {
      const clean = searchQuery.trim()
      if (!clean) {
        setTopResult(null)
        setUsersList([])
        setPostsList([])
        setHasSearched(false)
        setIsSearching(false)
        setSearchError(null)
        syncUrl('', targetTab)
        return
      }

      setIsSearching(true)
      setSearchError(null)
      setHasSearched(true)
      syncUrl(clean, targetTab)

      // Save to recent searches
      const updatedHistory = addRecentSearch(clean)
      setRecentSearches(updatedHistory)

      try {
        if (targetTab === 'top') {
          const res = await searchTopAction(clean)
          if (res.error || !res.success) {
            setSearchError(res.error || 'Failed to search')
            toast.error(res.error || 'Failed to search')
          } else {
            setTopResult({
              users: res.users || [],
              posts: res.posts || [],
            })
          }
        } else if (targetTab === 'accounts') {
          const res = await searchUsersAction(clean, null, 10)
          if (res.error || !res.success) {
            setSearchError(res.error || 'Failed to search accounts')
            toast.error(res.error || 'Failed to search accounts')
          } else {
            setUsersList(res.users || [])
            setUsersCursor(res.nextCursor || null)
            setHasMoreUsers(Boolean(res.hasMore))
          }
        } else if (targetTab === 'posts') {
          const res = await searchPostsAction(clean, null, 10)
          if (res.error || !res.success) {
            setSearchError(res.error || 'Failed to search posts')
            toast.error(res.error || 'Failed to search posts')
          } else {
            setPostsList(res.posts || [])
            setPostsCursor(res.nextCursor || null)
            setHasMorePosts(Boolean(res.hasMore))
          }
        }
      } catch {
        setSearchError('Network error while searching. Please try again.')
        toast.error('Network error while searching')
      } finally {
        setIsSearching(false)
      }
    },
    [syncUrl]
  )

  // Debounced input handler (300ms)
  React.useEffect(() => {
    // If the input matches what we already have and already searched, skip initial trigger
    if (query === initialQuery && hasSearched) {
      return
    }

    if (!query.trim()) {
      setTopResult(null)
      setUsersList([])
      setPostsList([])
      setHasSearched(false)
      setIsSearching(false)
      syncUrl('', activeTab)
      return
    }

    const timer = setTimeout(() => {
      executeSearch(query, activeTab)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, activeTab, executeSearch, initialQuery, hasSearched, syncUrl])

  // Tab switch handler
  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab)
    if (query.trim()) {
      executeSearch(query, tab)
    } else {
      syncUrl('', tab)
    }
  }

  // Load more accounts
  const handleLoadMoreUsers = async () => {
    if (isLoadingMore || !hasMoreUsers || !usersCursor || !query.trim()) return

    setIsLoadingMore(true)
    setPaginationError(false)

    try {
      const res = await searchUsersAction(query.trim(), usersCursor, 10)
      if (res.error || !res.success) {
        setPaginationError(true)
        toast.error(res.error || 'Failed to load more accounts')
      } else {
        setUsersList((prev) => [...prev, ...(res.users || [])])
        setUsersCursor(res.nextCursor || null)
        setHasMoreUsers(Boolean(res.hasMore))
      }
    } catch {
      setPaginationError(true)
      toast.error('Network error loading more accounts')
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Load more posts
  const handleLoadMorePosts = async () => {
    if (isLoadingMore || !hasMorePosts || !postsCursor || !query.trim()) return

    setIsLoadingMore(true)
    setPaginationError(false)

    try {
      const res = await searchPostsAction(query.trim(), postsCursor, 10)
      if (res.error || !res.success) {
        setPaginationError(true)
        toast.error(res.error || 'Failed to load more posts')
      } else {
        setPostsList((prev) => [...prev, ...(res.posts || [])])
        setPostsCursor(res.nextCursor || null)
        setHasMorePosts(Boolean(res.hasMore))
      }
    } catch {
      setPaginationError(true)
      toast.error('Network error loading more posts')
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Recent search actions
  const handleSelectRecentSearch = (selectedQuery: string) => {
    setQuery(selectedQuery)
    executeSearch(selectedQuery, activeTab)
  }

  const handleRemoveRecentSearch = (id: string) => {
    const updated = removeRecentSearch(id)
    setRecentSearches(updated)
  }

  const handleClearAllRecentSearches = () => {
    clearRecentSearches()
    setRecentSearches([])
  }

  // Helper counts
  const usersCount = topResult ? topResult.users.length : usersList.length
  const postsCount = topResult ? topResult.posts.length : postsList.length
  const isZeroResults =
    hasSearched &&
    !isSearching &&
    !searchError &&
    ((activeTab === 'top' && (topResult?.users.length ?? 0) === 0 && (topResult?.posts.length ?? 0) === 0) ||
      (activeTab === 'accounts' && usersList.length === 0) ||
      (activeTab === 'posts' && postsList.length === 0))

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8 space-y-6">
      {/* Search Bar Input */}
      <SearchInput
        value={query}
        onChange={setQuery}
        onClear={() => {
          setQuery('')
          setTopResult(null)
          setUsersList([])
          setPostsList([])
          setHasSearched(false)
        }}
        onSubmit={() => executeSearch(query, activeTab)}
        isLoading={isSearching}
        placeholder="Search creators, usernames, or post captions..."
        autoFocus={!initialQuery}
      />

      {/* When query is empty: show Recent Searches and Suggested Creators */}
      {!query.trim() && (
        <div className="space-y-6">
          <RecentSearches
            items={recentSearches}
            onSelect={handleSelectRecentRecentSearch => handleSelectRecentSearch(handleSelectRecentRecentSearch)}
            onRemove={handleRemoveRecentSearch}
            onClearAll={handleClearAllRecentSearches}
          />

          {suggestedUsers.length > 0 ? (
            <SuggestedUsers
              users={suggestedUsers}
              title="Suggested Creators"
              description="Explore popular members and creators across Wink"
            />
          ) : null}
        </div>
      )}

      {/* When query is present: show Tabs and Results */}
      {Boolean(query.trim()) && (
        <div className="space-y-6">
          <SearchTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            usersCount={usersCount > 0 ? usersCount : undefined}
            postsCount={postsCount > 0 ? postsCount : undefined}
          />

          {/* Search Loading Skeletons */}
          {isSearching && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          )}

          {/* Error State with Retry Button */}
          {searchError && !isSearching && (
            <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/5 text-center space-y-3">
              <p className="text-sm font-medium text-destructive">{searchError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => executeSearch(query, activeTab)}
                className="gap-2 text-xs"
              >
                <ArrowPathIcon className="size-3.5" />
                <span>Try again</span>
              </Button>
            </div>
          )}

          {/* Zero Results State */}
          {isZeroResults && (
            <SearchEmptyState
              query={query}
              suggestedUsers={suggestedUsers}
            />
          )}

          {/* Top Tab View */}
          {activeTab === 'top' && !isSearching && !isZeroResults && topResult && (
            <div className="space-y-6">
              {/* Accounts slice */}
              {topResult.users.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <UsersIcon className="size-4 text-primary" />
                      <span>Accounts</span>
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTabChange('accounts')}
                      className="h-7 px-2 text-xs text-primary hover:text-primary gap-1"
                    >
                      <span>View all</span>
                      <ArrowRightIcon className="size-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {topResult.users.map((user) => (
                      <UserSearchResultCard
                        key={user.id}
                        user={user}
                        onSelect={() => addRecentSearch(user.displayName)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Posts slice */}
              {topResult.posts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <DocumentTextIcon className="size-4 text-primary" />
                      <span>Posts</span>
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTabChange('posts')}
                      className="h-7 px-2 text-xs text-primary hover:text-primary gap-1"
                    >
                      <span>View all</span>
                      <ArrowRightIcon className="size-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {topResult.posts.map((post) => (
                      <PostSearchResultCard
                        key={post.id}
                        post={post}
                        currentUserId={currentUserId}
                        searchQuery={query}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Accounts Tab View */}
          {activeTab === 'accounts' && !isSearching && !isZeroResults && (
            <div className="space-y-3">
              <div className="space-y-2">
                {usersList.map((user) => (
                  <UserSearchResultCard
                    key={user.id}
                    user={user}
                    onSelect={() => addRecentSearch(user.displayName)}
                  />
                ))}
              </div>

              <InfiniteScrollSentinel
                hasMore={hasMoreUsers}
                isLoading={isLoadingMore}
                isError={paginationError}
                onLoadMore={handleLoadMoreUsers}
                onRetry={handleLoadMoreUsers}
                endMessage="All matching accounts loaded"
              />
            </div>
          )}

          {/* Posts Tab View */}
          {activeTab === 'posts' && !isSearching && !isZeroResults && (
            <div className="space-y-4">
              {postsList.map((post) => (
                <PostSearchResultCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  searchQuery={query}
                />
              ))}

              <InfiniteScrollSentinel
                hasMore={hasMorePosts}
                isLoading={isLoadingMore}
                isError={paginationError}
                onLoadMore={handleLoadMorePosts}
                onRetry={handleLoadMorePosts}
                endMessage="All matching posts loaded"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
