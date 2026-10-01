import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8 space-y-6">
      {/* Search Bar Input Skeleton */}
      <div className="relative">
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>

      {/* Tabs Filter Bar Skeleton */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-18 rounded-full" />
      </div>

      {/* Results / Suggested Creators Section */}
      <div className="space-y-4">
        <div className="space-y-1">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-3.5 w-60 rounded-md" />
        </div>

        {/* Creator / Result Cards */}
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="size-11 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
