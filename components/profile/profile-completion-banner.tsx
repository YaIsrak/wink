'use client'

import * as React from 'react'
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProfileCompletionBannerProps {
  completionPercentage: number
  onEditClick: () => void
  className?: string
}

export function ProfileCompletionBanner({
  completionPercentage,
  onEditClick,
  className,
}: ProfileCompletionBannerProps) {
  if (completionPercentage >= 100) {
    return null
  }

  const missingSuggestions = () => {
    if (completionPercentage < 40) {
      return 'Add a profile photo, display name, and bio to get discovered.'
    }
    if (completionPercentage < 80) {
      return 'Add your bio and location to connect with people around you.'
    }
    return 'Add your website or location to reach 100% and complete your profile.'
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card/60 p-4 sm:p-5 shadow-xs transition-all',
        className
      )}
    >
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-foreground text-background">
              <SparklesIcon className="size-3" />
              <span>Milestone</span>
            </span>
            <span className="text-sm font-semibold text-foreground">
              Profile {completionPercentage}% Complete
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {missingSuggestions()}
          </p>

          {/* Progress Bar Track */}
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-2 relative">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-700 ease-out"
              style={{ width: `${Math.max(5, completionPercentage)}%` }}
            />
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onEditClick}
          className="self-start sm:self-center shrink-0 rounded-lg text-xs font-semibold gap-1.5 shadow-xs hover:bg-muted"
        >
          <span>Complete Profile</span>
          <ArrowRightIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
