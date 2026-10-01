import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8 flex flex-col gap-4">
      {/* Top Header Row */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-9 rounded-xl shrink-0" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>

        {/* Mark All as Read Button Skeleton */}
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      {/* Tabs Filter Bar Skeleton */}
      <div className="flex items-center gap-2 py-1">
        <Skeleton className="h-8 w-14 rounded-full" />
        <Skeleton className="h-8 w-18 rounded-full" />
      </div>

      {/* Notification Items Skeleton List */}
      <div className="flex flex-col gap-2.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-3.5 shadow-2xs"
          >
            {/* Actor Avatar */}
            <Skeleton className="size-10 rounded-full shrink-0" />

            {/* Notification Text */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-4/5 sm:w-3/5 rounded-md" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>

            {/* Right-side Indicator / Thumbnail Placeholder */}
            {i % 2 === 0 ? (
              <Skeleton className="size-10 rounded-lg shrink-0" />
            ) : (
              <Skeleton className="size-2.5 rounded-full shrink-0 mr-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
