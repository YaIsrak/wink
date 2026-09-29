'use client'

import * as React from 'react'
import { SearchX, Lightbulb } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SuggestedUsers, type SuggestedUserItem } from '@/components/profile/suggested-users'
import { cn } from '@/lib/utils'

interface SearchEmptyStateProps {
  query: string
  suggestedUsers?: SuggestedUserItem[]
  className?: string
}

export function SearchEmptyState({
  query,
  suggestedUsers = [],
  className,
}: SearchEmptyStateProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <Card className="flex flex-col items-center justify-center p-8 text-center bg-card/60 backdrop-blur-xs border-border/80">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-4">
          <SearchX className="size-7" />
        </div>

        <h3 className="text-base font-semibold text-foreground">
          No results found for &ldquo;{query}&rdquo;
        </h3>

        <p className="text-sm text-muted-foreground max-w-sm mt-1.5">
          We could not find any accounts or posts matching your search.
        </p>

        <div className="flex items-start gap-2.5 mt-5 p-3 rounded-xl bg-secondary/50 border border-border/50 text-left text-xs text-muted-foreground max-w-md">
          <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-foreground">Search tips:</span>
            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground/90">
              <li>Check your spelling for any typos</li>
              <li>Try searching with broader or fewer keywords</li>
              <li>Search for exact usernames without the @ symbol</li>
            </ul>
          </div>
        </div>
      </Card>

      {suggestedUsers.length > 0 ? (
        <SuggestedUsers
          users={suggestedUsers}
          title="Discover People"
          description="Check out active creators from across the Wink community"
        />
      ) : null}
    </div>
  )
}
