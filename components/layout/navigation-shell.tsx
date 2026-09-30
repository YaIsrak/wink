'use client'

import * as React from 'react'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { MobileHeader } from '@/components/layout/mobile-header'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { CreatePostDialog } from '@/components/layout/create-post-dialog'
import { useNotificationSubscription } from '@/lib/hooks/use-notification-subscription'
import { useInboxSubscription } from '@/lib/hooks/use-inbox-subscription'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface NavigationShellProps {
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string | null
  }
  children: React.ReactNode
}

export function NavigationShell({ user, children }: NavigationShellProps) {
  const pathname = usePathname()
  const isConversationPage = pathname.startsWith('/messages/') && pathname !== '/messages'

  // Listen to realtime notifications and maintain unread counter
  useNotificationSubscription(user.id)
  // Listen to realtime direct messages and maintain inbox counter
  useInboxSubscription(user.id)
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      {/* Desktop Left Rail Sidebar */}
      <DesktopSidebar user={user} />

      {/* Mobile Top Header */}
      <MobileHeader />

      {/* Main Content Viewport */}
      <main
        className={cn(
          'min-h-screen lg:pl-[260px] pb-20 lg:pb-8 transition-all',
          isConversationPage && 'pb-0 min-h-dvh h-dvh overflow-hidden'
        )}
      >
        {children}
      </main>

      {/* Mobile Bottom Fixed Navigation */}
      <MobileBottomNav user={user} />

      {/* Global Post Creation Dialog Modal */}
      <CreatePostDialog user={user} />
    </div>
  )
}
