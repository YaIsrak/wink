import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header Bar Skeleton */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </header>

      {/* Main Form Skeleton */}
      <main className="flex-1 flex items-center justify-center p-4 py-8 sm:py-12">
        <Card className="w-full max-w-lg border border-border shadow-xs">
          <CardHeader className="text-center space-y-2 pb-6">
            <Skeleton className="h-7 w-48 rounded-md mx-auto" />
            <Skeleton className="h-4 w-72 rounded-md mx-auto" />
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Avatar upload placeholder */}
            <div className="flex flex-col items-center justify-center gap-3">
              <Skeleton className="size-24 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-9 w-24 rounded-lg mx-auto" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
