import * as React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserProfileById } from '@/lib/services/auth.service'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'

export default async function OnboardingPage() {
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

      <main className="mx-auto max-w-xl px-4 py-12">
        <Card className="p-6">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              Welcome to Wink, {profile?.displayName || 'there'}!
            </CardTitle>
            <CardDescription className="text-sm">
              Your account has been created with username{' '}
              <span className="font-semibold text-foreground">
                @{profile?.username}
              </span>
              . Full profile onboarding (avatar upload, bio setup) is coming in the next phase.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <Link href="/feed" className={buttonVariants()}>
              Continue to Feed
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
