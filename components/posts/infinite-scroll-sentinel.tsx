'use client'

import * as React from 'react'
import { ArrowUpIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface InfiniteScrollSentinelProps {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void | Promise<void>
  isError?: boolean
  onRetry?: () => void
  rootMargin?: string
  endMessage?: string
  className?: string
}

export function InfiniteScrollSentinel({
  hasMore,
  isLoading,
  onLoadMore,
  isError = false,
  onRetry,
  rootMargin = '250px',
  endMessage = 'You are all caught up!',
  className,
}: InfiniteScrollSentinelProps) {
  const sentinelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !isLoading && !isError) {
          onLoadMore()
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0.1,
      }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoading, isError, onLoadMore, rootMargin])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={cn('w-full flex flex-col items-center py-4', className)}>
      {/* Invisible observer sentinel target */}
      <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />

      {/* Loading Skeleton state */}
      {isLoading && (
        <div className="w-full flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-md" />
            <div className="flex gap-4 pt-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
        </div>
      )}

      {/* Error state with retry action */}
      {isError && (
        <div className="w-full rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm text-destructive font-medium">
            <ArrowPathIcon className="size-4 shrink-0" />
            <span>Could not load the next batch of posts.</span>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowPathIcon className="size-3.5" />
              <span>Retry</span>
            </Button>
          )}
        </div>
      )}

      {/* End of feed state */}
      {!hasMore && !isLoading && !isError && (
        <div className="w-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-6 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground mb-2">
            <CheckCircleIcon className="size-5" />
          </div>
          <p className="text-sm font-semibold text-foreground">{endMessage}</p>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
            You have explored all the latest community posts from across Wink.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            className="mt-3 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowUpIcon className="size-3.5" />
            <span>Back to top</span>
          </Button>
        </div>
      )}
    </div>
  )
}
