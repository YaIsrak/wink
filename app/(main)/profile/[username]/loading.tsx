import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8 flex flex-col gap-6">
      {/* Back to feed link skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-24 rounded-md" />
      </div>

      {/* Profile Header Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
        {/* Top: Avatar and Actions */}
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="size-20 sm:size-24 rounded-full shrink-0 ring-4 ring-background" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-9 w-24 sm:w-28 rounded-lg" />
            <Skeleton className="size-9 rounded-lg" />
          </div>
        </div>

        {/* Identity: Name, Username, Bio */}
        <div className="space-y-2.5">
          <div className="space-y-1">
            <Skeleton className="h-6 w-44 rounded-md" />
            <Skeleton className="h-3.5 w-28 rounded-md" />
          </div>

          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
          </div>

          {/* Metadata Chips (Location, Website) */}
          <div className="flex items-center gap-4 pt-1.5">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
        </div>

        {/* Stats Row: Posts, Followers, Following */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/40 text-center">
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-5 w-8 rounded-md" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-5 w-8 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-5 w-8 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        </div>
      </div>

      {/* Profile Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-around border-b border-border/40 pb-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>

        {/* Post Grid Placeholder */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton
              key={i}
              className="aspect-square w-full rounded-md sm:rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
