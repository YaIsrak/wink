import * as React from 'react'
import { Logo } from '@/components/shared/logo'

export default function RootLoading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground gap-4">
      <div className="relative animate-pulse flex items-center justify-center">
        <Logo size={48} priority />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="size-2 rounded-full bg-primary animate-bounce" />
      </div>
    </div>
  )
}
