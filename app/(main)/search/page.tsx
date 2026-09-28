import * as React from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Search } from 'lucide-react'

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:py-10">
      <Card className="p-6">
        <CardHeader className="p-0 flex flex-row items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <Search className="size-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Search</CardTitle>
            <CardDescription>
              Search users, tags, and posts across Wink. Arriving in Phase 3.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
