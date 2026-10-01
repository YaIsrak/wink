import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function MessagesLoading() {
  return (
    <div className="w-full h-[calc(100dvh-8.5rem)] lg:h-[calc(100dvh-2rem)] p-2 lg:p-4">
      <div className="h-full w-full flex bg-background rounded-none lg:rounded-2xl border-0 lg:border lg:border-border/40 overflow-hidden shadow-xs">
        {/* Left List Pane Skeleton */}
        <div className="w-full lg:w-[360px] xl:w-[400px] h-full shrink-0 border-r border-border/40 flex flex-col">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-border/30">
            <Skeleton className="h-6 w-28 rounded-md" />
            <Skeleton className="size-8 rounded-lg" />
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-border/20">
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/20">
            <Skeleton className="h-7 w-14 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>

          {/* Conversations Skeleton List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-border/30"
              >
                <Skeleton className="size-11 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-3 w-10 rounded-md" />
                  </div>
                  <Skeleton className="h-3 w-4/5 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chat Pane Preview Skeleton (Desktop) */}
        <div className="flex-1 h-full min-w-0 hidden lg:flex flex-col items-center justify-center p-8 bg-muted/5 text-center">
          <Skeleton className="size-14 rounded-2xl mb-4" />
          <Skeleton className="h-5 w-40 rounded-md mb-2" />
          <Skeleton className="h-3.5 w-64 rounded-md" />
        </div>
      </div>
    </div>
  )
}
