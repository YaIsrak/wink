'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
} from '@heroicons/react/24/solid'
import { Avatar } from '@/components/ui/avatar'
import { useUiStore } from '@/lib/store/ui-store'
import { useNotificationStore } from '@/lib/store/notification-store'
import { cn } from '@/lib/utils'

export interface MobileBottomNavProps {
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string | null
  }
}

export function MobileBottomNav({ user }: MobileBottomNavProps) {
  const pathname = usePathname()
  const setActiveModal = useUiStore((state) => state.setActiveModal)
  const unreadMessagesCount = useNotificationStore(
    (state) => state.unreadMessagesCount
  )

  const isHomeActive = pathname === '/feed' || pathname === '/'
  const isSearchActive = pathname.startsWith('/search')
  const isMessagesActive = pathname.startsWith('/messages')
  const isProfileActive = pathname.startsWith('/profile')
  const isConversationPage = pathname.startsWith('/messages/') && pathname !== '/messages'

  if (isConversationPage) {
    return null
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 flex h-16 items-center justify-around border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden select-none"
      aria-label="Mobile Bottom Navigation"
    >
      {/* 1. Home */}
      <Link
        href="/feed"
        className={cn(
          'flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors',
          isHomeActive
            ? 'text-foreground font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {isHomeActive ? (
          <HomeIconSolid className="size-5 transition-transform duration-150" />
        ) : (
          <HomeIcon className="size-5 transition-transform duration-150 stroke-[1.8]" />
        )}
        <span className="text-[10px] tracking-tight">Home</span>
      </Link>

      {/* 2. Search */}
      <Link
        href="/search"
        className={cn(
          'flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors',
          isSearchActive
            ? 'text-foreground font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {isSearchActive ? (
          <MagnifyingGlassIconSolid className="size-5 transition-transform duration-150" />
        ) : (
          <MagnifyingGlassIcon className="size-5 transition-transform duration-150 stroke-[2]" />
        )}
        <span className="text-[10px] tracking-tight">Search</span>
      </Link>

      {/* 3. Center Create Button */}
      <div className="flex flex-1 items-center justify-center">
        <button
          type="button"
          onClick={() => setActiveModal('create-post')}
          className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform active:scale-95 cursor-pointer hover:opacity-90"
          aria-label="Create Post"
        >
          <PlusIcon className="size-5 stroke-[2.5]" />
        </button>
      </div>

      {/* 4. Inbox / Messages */}
      <Link
        href="/messages"
        className={cn(
          'relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors',
          isMessagesActive
            ? 'text-foreground font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <div className="relative">
          {isMessagesActive ? (
            <EnvelopeIconSolid className="size-5 transition-transform duration-150" />
          ) : (
            <EnvelopeIcon className="size-5 transition-transform duration-150 stroke-[1.8]" />
          )}
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1.5 flex size-2 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </div>
        <span className="text-[10px] tracking-tight">Inbox</span>
      </Link>

      {/* 5. Profile */}
      <Link
        href="/profile"
        className={cn(
          'flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors',
          isProfileActive
            ? 'text-foreground font-semibold'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <div className={cn('rounded-full p-0.5', isProfileActive && 'ring-2 ring-foreground')}>
          <Avatar
            src={user.avatarUrl}
            fallback={user.displayName?.slice(0, 2) || user.username?.slice(0, 2) || 'WK'}
            size="sm"
            className="size-5.5 text-[10px]"
            status="online"
          />
        </div>
        <span className="text-[10px] tracking-tight">Profile</span>
      </Link>
    </nav>
  )
}
