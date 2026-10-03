import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfileById } from '@/lib/services/auth.service'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'View your profile and posts on Wink.',
}

export default async function ProfilePage() {
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

  if (!profile.onboardedAt) {
    redirect('/onboarding')
  }

  redirect(`/profile/${profile.username}`)
}
