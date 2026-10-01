'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { NavItem } from '@/components/layout/nav-item'
import { UserNavCard } from '@/components/layout/user-nav-card'
import { useUiStore } from '@/lib/store/ui-store'
import { useNotificationStore } from '@/lib/store/notification-store'

export interface DesktopSidebarProps {
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string | null
  }
}

export function DesktopSidebar({ user }: DesktopSidebarProps) {
  const pathname = usePathname()
  const setActiveModal = useUiStore((state) => state.setActiveModal)
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  const unreadMessagesCount = useNotificationStore(
    (state) => state.unreadMessagesCount
  )

  const navItems = [
    {
      href: '/feed',
      label: 'Home',
      icon: HomeIcon,
      isActive: pathname === '/feed' || pathname === '/',
    },
    {
      href: '/search',
      label: 'Search',
      icon: MagnifyingGlassIcon,
      isActive: pathname.startsWith('/search'),
    },
    {
      href: '/messages',
      label: 'Messages',
      icon: ChatBubbleLeftRightIcon,
      isActive: pathname.startsWith('/messages'),
      badge: unreadMessagesCount,
    },
    {
      href: '/notifications',
      label: 'Notifications',
      icon: BellIcon,
      isActive: pathname.startsWith('/notifications'),
      badge: unreadCount,
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: UserIcon,
      isActive: pathname.startsWith('/profile'),
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Cog6ToothIcon,
      isActive: pathname.startsWith('/settings'),
    },
  ]

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[260px] flex-col justify-between border-r border-border bg-background p-4 select-none">
      <div className="flex flex-col gap-6">
        {/* Logo and Wordmark */}
        <div className="px-2 pt-2">
          <Link
            href="/feed"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <Logo size={34} />
            <span className="text-xl font-bold tracking-tight text-foreground">
              Wink
            </span>
          </Link>
        </div>

        {/* Primary Navigation */}
        <nav className="flex flex-col gap-1" aria-label="Main Navigation">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={item.isActive}
              badge={item.badge}
            />
          ))}
        </nav>

        {/* Create Post Action Button */}
        <div className="pt-2 px-1">
          <Button
            size="lg"
            onClick={() => setActiveModal('create-post')}
            className="w-full gap-2 rounded-xl py-6 font-semibold shadow-xs transition-transform active:scale-[0.98] cursor-pointer"
          >
            <PlusIcon className="size-5 stroke-[2.5]" />
            <span>Create Post</span>
          </Button>
        </div>
      </div>

      {/* User Section with Account Dropdown & Logout */}
      <div className="border-t border-border pt-3">
        <UserNavCard user={user} />
      </div>
    </aside>
  )
}
