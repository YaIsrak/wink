import * as React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserProfileById } from '@/lib/services/auth.service'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

export default async function FeedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = user ? await getUserProfileById(user.id) : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
        <Link
          href="/feed"
          className="text-xl font-bold tracking-tight text-foreground"
        >
          Wink
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <SignOutButton size="sm" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        <Card className="p-6">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              Welcome to your Feed, {profile?.displayName || 'Friend'}!
            </CardTitle>
            <CardDescription className="text-sm">
              You are successfully authenticated as{' '}
              <span className="font-semibold text-foreground">
                @{profile?.username || user?.email}
              </span>
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/theme"
                className="inline-flex h-9 items-center rounded-lg border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground hover:bg-muted transition-colors"
              >
                View Design System (/theme)
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
