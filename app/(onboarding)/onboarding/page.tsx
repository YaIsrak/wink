import * as React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfileById } from '@/lib/services/auth.service'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Logo } from '@/components/shared/logo'
import type { Metadata } from 'next'
import { OnboardingForm } from '@/components/onboarding/onboarding-form'

export const metadata: Metadata = {
  title: 'Complete Profile',
  description: 'Set up your avatar, bio, and display name to start exploring Wink.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getUserProfileById(user.id)

  if (!profile) {
    redirect('/login')
  }

  // AC-8: If user has already completed or skipped onboarding, redirect to feed
  if (profile.onboardedAt) {
    redirect('/feed')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
        <Link
          href="/feed"
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity"
        >
          <Logo size={28} />
          <span>Wink</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <SignOutButton size="sm" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-8 sm:py-12">
        <OnboardingForm
          user={{
            id: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            bio: profile.bio,
          }}
        />
      </main>
    </div>
  )
}
