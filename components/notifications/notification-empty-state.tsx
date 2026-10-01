'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { CheckCircleIcon, BellSlashIcon } from '@heroicons/react/24/outline'
import type { NotificationFilter } from '@/types/notification'

interface NotificationEmptyStateProps {
  filter: NotificationFilter
}

export function NotificationEmptyState({ filter }: NotificationEmptyStateProps) {
  if (filter === 'unread') {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-foreground mb-4">
          <CheckCircleIcon className="size-7 stroke-[1.8]" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          You are all caught up
        </h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          No unread notifications right now. Check back when your friends like, comment, or follow you.
        </p>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-foreground mb-4">
        <BellSlashIcon className="size-7 stroke-[1.8]" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        No notifications yet
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        Activity across your posts and profile will show up here. Share a photo or follow creators to start engaging.
      </p>
    </Card>
  )
}
