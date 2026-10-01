'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BellIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import {
  BellIcon as BellIconSolid,
  PaperAirplaneIcon as PaperAirplaneIconSolid,
} from '@heroicons/react/24/solid'
import { Logo } from '@/components/shared/logo'
import { useNotificationStore } from '@/lib/store/notification-store'
import { cn } from '@/lib/utils'

export function MobileHeader() {
  const pathname = usePathname()
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  const unreadMessagesCount = useNotificationStore(
    (state) => state.unreadMessagesCount
  )

  const isNotificationsActive = pathname.startsWith('/notifications')
  const isMessagesActive = pathname.startsWith('/messages')
  const isConversationPage = pathname.startsWith('/messages/') && pathname !== '/messages'

  if (isConversationPage) {
    return null
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md lg:hidden select-none">
      {/* Brand Logo */}
      <Link href="/feed" className="flex items-center gap-2">
        <Logo size={30} />
        <span className="text-lg font-bold tracking-tight text-foreground">
          Wink
        </span>
      </Link>

      {/* Right Quick Action Icons */}
      <div className="flex items-center gap-1">
        <Link
          href="/notifications"
          className={cn(
            'relative flex size-9 items-center justify-center rounded-lg transition-colors',
            isNotificationsActive
              ? 'text-foreground bg-muted'
              : 'text-foreground hover:bg-muted/70'
          )}
          aria-label="Notifications"
        >
          {isNotificationsActive ? (
            <BellIconSolid className="size-5 transition-transform duration-150" />
          ) : (
            <BellIcon className="size-5 transition-transform duration-150 stroke-[1.8]" />
          )}
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex size-2 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </Link>

        <Link
          href="/messages"
          className={cn(
            'relative flex size-9 items-center justify-center rounded-lg transition-colors',
            isMessagesActive
              ? 'text-foreground bg-muted'
              : 'text-foreground hover:bg-muted/70'
          )}
          aria-label="Direct Messages"
        >
          {isMessagesActive ? (
            <PaperAirplaneIconSolid className="size-5 -rotate-12 translate-x-0.5 transition-transform duration-150" />
          ) : (
            <PaperAirplaneIcon className="size-5 -rotate-12 translate-x-0.5 transition-transform duration-150 stroke-[1.8]" />
          )}
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background ring-2 ring-background">
              {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
