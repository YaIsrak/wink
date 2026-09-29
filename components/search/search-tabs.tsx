'use client'

import * as React from 'react'
import type { SearchTab } from '@/types/search'
import { Sparkles, Users, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchTabsProps {
  activeTab: SearchTab
  onTabChange: (tab: SearchTab) => void
  usersCount?: number
  postsCount?: number
  className?: string
}

interface TabItem {
  id: SearchTab
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const TABS: TabItem[] = [
  { id: 'top', label: 'Top', icon: Sparkles },
  { id: 'accounts', label: 'Accounts', icon: Users },
  { id: 'posts', label: 'Posts', icon: ImageIcon },
]

export function SearchTabs({
  activeTab,
  onTabChange,
  usersCount,
  postsCount,
  className,
}: SearchTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Search categories"
      className={cn(
        'flex items-center gap-1 border-b border-border w-full px-1',
        className
      )}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 py-3 px-4 text-sm font-medium transition-all select-none',
              isActive
                ? 'text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-t-lg'
            )}
          >
            <Icon className={cn('size-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
            <span>{tab.label}</span>

            {tab.id === 'accounts' && typeof usersCount === 'number' && usersCount > 0 ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground font-normal">
                {usersCount}
              </span>
            ) : null}

            {tab.id === 'posts' && typeof postsCount === 'number' && postsCount > 0 ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground font-normal">
                {postsCount}
              </span>
            ) : null}

            {isActive ? (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
