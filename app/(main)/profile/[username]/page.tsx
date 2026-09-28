import * as React from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getUserProfileById,
  getUserProfileByUsername,
} from '@/lib/services/auth.service'
import { getUserPosts } from '@/lib/services/post.service'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { PostCard } from '@/components/posts/post-card'
import { Calendar, MessageSquareDashed, ArrowLeft, Settings } from 'lucide-react'

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

  const targetProfile = await getUserProfileByUsername(username)
  if (!targetProfile) {
    notFound()
  }

  const posts = await getUserPosts(targetProfile.id)
  const isOwner = sessionUser.id === targetProfile.id

  const joinDate = new Date(targetProfile.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8 flex flex-col gap-6">
      {/* Back to feed header */}
      <div className="flex items-center gap-2">
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Profile Card Header */}
      <Card className="p-6 border-border shadow-xs">
        <CardHeader className="p-0 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar
              src={targetProfile.avatarUrl}
              fallback={
                targetProfile.displayName?.slice(0, 2) ||
                targetProfile.username?.slice(0, 2) ||
                'WK'
              }
              size="xl"
              status="online"
            />
            <div className="min-w-0">
              <CardTitle className="text-2xl font-bold truncate">
                {targetProfile.displayName || targetProfile.username}
              </CardTitle>
              <CardDescription className="text-sm mt-0.5">
                @{targetProfile.username}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isOwner ? (
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-lg gap-1.5">
                  <Settings className="size-3.5" />
                  <span>Edit Profile</span>
                </Button>
              </Link>
            ) : (
              <Button size="sm" className="w-full sm:w-auto rounded-lg font-semibold">
                Follow
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-4 flex flex-col gap-4">
          {targetProfile.bio ? (
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
              {targetProfile.bio}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No bio provided yet.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <span>Joined {joinDate}</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">{posts.length}</span>{' '}
              <span>{posts.length === 1 ? 'post' : 'posts'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User's Posts Feed */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-foreground px-1">
          {isOwner ? 'Your Posts' : `Posts by @${targetProfile.username}`}
        </h2>

        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={sessionUser.id}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <MessageSquareDashed className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              No posts yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              {isOwner
                ? 'You have not published any posts yet. Start by sharing an update!'
                : `@${targetProfile.username} has not posted anything yet.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
