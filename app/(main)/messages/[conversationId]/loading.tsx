import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function ConversationLoading() {
  return (
    <div className="w-full h-dvh lg:h-[calc(100dvh-2rem)] p-0 lg:p-4">
      <div className="h-full w-full flex bg-background rounded-none lg:rounded-2xl border-0 lg:border lg:border-border/40 overflow-hidden shadow-xs">
        {/* Left List Pane Skeleton (Desktop only when thread is active) */}
        <div className="hidden lg:flex w-[360px] xl:w-[400px] h-full shrink-0 border-r border-border/40 flex-col">
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
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl border border-transparent"
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

        {/* Right Active Chat Pane Skeleton */}
        <div className="flex-1 h-full min-w-0 flex flex-col bg-background">
          {/* Conversation Header */}
          <div className="h-16 px-4 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg lg:hidden" />
              <Skeleton className="size-10 rounded-full shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
            </div>
            <Skeleton className="size-8 rounded-lg" />
          </div>

          {/* Chat Messages Feed Skeleton */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Incoming bubble */}
            <div className="flex items-end gap-2 max-w-[75%]">
              <Skeleton className="size-7 rounded-full shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-12 w-48 rounded-2xl rounded-bl-xs" />
                <Skeleton className="h-2.5 w-12 rounded-md" />
              </div>
            </div>

            {/* Outgoing bubble */}
            <div className="flex flex-col items-end gap-1 ml-auto max-w-[75%]">
              <Skeleton className="h-10 w-40 rounded-2xl rounded-br-xs bg-muted" />
              <Skeleton className="h-2.5 w-12 rounded-md" />
            </div>

            {/* Incoming bubble */}
            <div className="flex items-end gap-2 max-w-[75%]">
              <Skeleton className="size-7 rounded-full shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-16 w-64 rounded-2xl rounded-bl-xs" />
                <Skeleton className="h-2.5 w-12 rounded-md" />
              </div>
            </div>

            {/* Outgoing bubble */}
            <div className="flex flex-col items-end gap-1 ml-auto max-w-[75%]">
              <Skeleton className="h-14 w-52 rounded-2xl rounded-br-xs bg-muted" />
              <Skeleton className="h-2.5 w-12 rounded-md" />
            </div>
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3 border-t border-border/40 bg-background/80 flex items-center gap-2">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="size-10 rounded-xl shrink-0" />
          </div>
        </div>
      </div>
    </div>
  )
}
