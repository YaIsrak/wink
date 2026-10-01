import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function FeedLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8 space-y-6">
      {/* Feed Tabs Skeleton */}
      <div className="border-b border-border/40 pb-1">
        <div className="flex items-center gap-8">
          <div className="relative pb-2.5">
            <Skeleton className="h-5 w-18 rounded-md" />
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/40 rounded-t-full" />
          </div>
          <div className="pb-2.5">
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        </div>
      </div>

      {/* Top Post Composer Trigger Skeleton */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full shrink-0" />
          <Skeleton className="h-10 flex-1 rounded-full" />
        </div>
      </div>

      {/* Feed Posts Skeleton List */}
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4"
          >
            {/* Author Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              </div>
              <Skeleton className="size-8 rounded-full" />
            </div>

            {/* Post Content */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>

            {/* Post Media Placeholder (simulated for alternating cards) */}
            {i !== 2 && (
              <Skeleton className="h-64 sm:h-80 w-full rounded-lg" />
            )}

            {/* Post Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-14 rounded-full" />
                <Skeleton className="h-8 w-14 rounded-full" />
                <Skeleton className="size-8 rounded-full" />
              </div>
              <Skeleton className="size-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
