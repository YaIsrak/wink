import * as React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfileById } from '@/lib/services/auth.service'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { SignOutButton } from '@/components/auth/sign-out-button'

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:py-10">
      <Card className="p-6">
        <CardHeader className="p-0 pb-6 flex flex-row items-center gap-4 border-b border-border">
          <Avatar
            src={profile.avatarUrl}
            fallback={profile.displayName?.slice(0, 2) || profile.username?.slice(0, 2) || 'WK'}
            size="lg"
            status="online"
          />
          <div className="min-w-0 flex-1">
            <CardTitle className="text-2xl font-bold truncate">
              {profile.displayName || profile.username}
            </CardTitle>
            <CardDescription className="text-sm mt-0.5">
              @{profile.username}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-4 flex flex-col gap-4">
          {profile.bio ? (
            <p className="text-sm text-foreground">{profile.bio}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No bio provided yet.</p>
          )}

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Session account</span>
            <SignOutButton size="sm" variant="outline" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
