import * as React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfileById } from '@/lib/services/auth.service'
import { Avatar } from '@/components/ui/avatar'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:py-10">
      <Card className="p-6 shadow-xs border-border">
        <CardHeader className="p-0 pb-4 flex flex-row items-center gap-4">
          <Avatar
            src={profile.avatarUrl}
            fallback={profile.displayName ? profile.displayName.slice(0, 2) : 'WK'}
            size="lg"
            status="online"
          />
          <div className="min-w-0">
            <CardTitle className="text-2xl font-bold tracking-tight truncate">
              Welcome to your Feed, {profile.displayName}!
            </CardTitle>
            <CardDescription className="text-sm mt-0.5">
              Signed in as{' '}
              <span className="font-semibold text-foreground">
                @{profile.username}
              </span>
            </CardDescription>
          </div>
        </CardHeader>

        {profile.bio && (
          <p className="text-sm text-muted-foreground pb-4 border-b border-border">
            &ldquo;{profile.bio}&rdquo;
          </p>
        )}

        <CardContent className="p-0 pt-4">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/theme"
              className="inline-flex h-9 items-center rounded-lg border border-border bg-secondary px-3.5 text-xs font-medium text-secondary-foreground hover:bg-muted transition-colors"
            >
              View Design System (/theme)
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
