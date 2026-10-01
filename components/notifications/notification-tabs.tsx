'use client'

import * as React from 'react'
import type { NotificationFilter } from '@/types/notification'
import { BellIcon, InboxIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface NotificationTabsProps {
  activeFilter: NotificationFilter
  onFilterChange: (filter: NotificationFilter) => void
  unreadCount?: number
  className?: string
}

export function NotificationTabs({
  activeFilter,
  onFilterChange,
  unreadCount = 0,
  className,
}: NotificationTabsProps) {
  const tabs = [
    { id: 'all' as NotificationFilter, label: 'All', icon: BellIcon },
    { id: 'unread' as NotificationFilter, label: 'Unread', icon: InboxIcon, count: unreadCount },
  ]

  return (
    <div
      role="tablist"
      aria-label="Notification filters"
      className={cn(
        'flex items-center gap-1 border-b border-border w-full select-none',
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeFilter === tab.id

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onFilterChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 py-3 px-4 text-sm font-medium transition-all cursor-pointer',
              isActive
                ? 'text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-t-lg'
            )}
          >
            <Icon className={cn('size-4', isActive ? 'text-foreground' : 'text-muted-foreground')} />
            <span>{tab.label}</span>

            {tab.id === 'unread' && typeof tab.count === 'number' && tab.count > 0 ? (
              <span className="rounded-full bg-destructive/15 text-destructive px-2 py-0.5 text-xs font-semibold">
                {tab.count}
              </span>
            ) : null}

            {isActive ? (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
