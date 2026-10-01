import * as React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:py-10">
      <Card className="p-6">
        <CardHeader className="p-0 pb-4 border-b border-border">
          <Skeleton className="h-6 w-28 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md mt-1" />
        </CardHeader>

        <CardContent className="p-0 pt-4 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-3 w-56 rounded-md" />
            </div>
            <Skeleton className="size-9 rounded-lg" />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-64 rounded-md" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
