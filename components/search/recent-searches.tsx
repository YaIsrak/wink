'use client'

import * as React from 'react'
import type { RecentSearchItem } from '@/types/search'
import { ClockIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RecentSearchesProps {
  items: RecentSearchItem[]
  onSelect: (query: string) => void
  onRemove: (id: string) => void
  onClearAll: () => void
  className?: string
}

export function RecentSearches({
  items,
  onSelect,
  onRemove,
  onClearAll,
  className,
}: RecentSearchesProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ClockIcon className="size-4 text-muted-foreground" />
          <span>Recent Searches</span>
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive transition-colors gap-1.5"
        >
          <TrashIcon className="size-3.5" />
          <span>Clear all</span>
        </Button>
      </div>

      <div className="flex flex-col divide-y divide-border/40 rounded-xl border border-border/60 bg-card/40 backdrop-blur-xs overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/40 transition-colors group cursor-pointer"
            onClick={() => onSelect(item.query)}
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <ClockIcon className="size-4 text-muted-foreground/70 shrink-0" />
              <span className="text-sm text-foreground truncate font-medium">
                {item.query}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(item.id)
              }}
              className="p-1 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors opacity-80 group-hover:opacity-100"
              aria-label={`Remove search ${item.query}`}
            >
              <XMarkIcon className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
