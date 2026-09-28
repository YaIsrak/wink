import * as React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfileById } from '@/lib/services/auth.service'
import { NavigationShell } from '@/components/layout/navigation-shell'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getUserProfileById(user.id)

  // Enforce onboarding gate before rendering main navigation
  if (!profile?.onboardedAt) {
    redirect('/onboarding')
  }

  return (
    <NavigationShell
      user={{
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        avatarUrl: profile.avatarUrl,
      }}
    >
      {children}
    </NavigationShell>
  )
}
