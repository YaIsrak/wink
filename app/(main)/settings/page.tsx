import * as React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { SignOutButton } from '@/components/auth/sign-out-button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your Wink account preferences, theme, and profile settings.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:py-10">
      <Card className="p-6">
        <CardHeader className="p-0 pb-4 border-b border-border">
          <CardTitle className="text-xl font-bold">Settings</CardTitle>
          <CardDescription>
            Manage your account preferences and display settings.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-4 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Theme Mode</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark visual themes</p>
            </div>
            <ThemeToggle />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Account Access</p>
              <p className="text-xs text-muted-foreground">Sign out of your active session on this device</p>
            </div>
            <SignOutButton size="sm" variant="outline" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
