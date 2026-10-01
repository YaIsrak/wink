'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  UserIcon,
  UsersIcon,
  PhotoIcon as ImageIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/button'
import { useUiStore } from '@/lib/store/ui-store'
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog'
import { dismissChecklistAction } from '@/actions/checklist'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { ChecklistProgress, ChecklistStepId } from '@/types/checklist'

export interface GettingStartedChecklistProps {
  initialProgress: ChecklistProgress
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string | null
    bio?: string | null
    location?: string | null
    website?: string | null
  }
  className?: string
}

export function GettingStartedChecklist({
  initialProgress,
  user,
  className,
}: GettingStartedChecklistProps) {
  const router = useRouter()
  const [progress, setProgress] = React.useState<ChecklistProgress>(initialProgress)
  const [isDismissing, setIsDismissing] = React.useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false)

  const isChecklistCollapsed = useUiStore((state) => state.isChecklistCollapsed)
  const toggleChecklistCollapsed = useUiStore(
    (state) => state.toggleChecklistCollapsed
  )
  const setActiveModal = useUiStore((state) => state.setActiveModal)

  if (progress.isDismissed) {
    return null
  }

  const percentage = Math.round(
    (progress.completedCount / progress.totalCount) * 100
  )

  const handleStepAction = (stepId: ChecklistStepId) => {
    switch (stepId) {
      case 'profile':
        setIsEditProfileOpen(true)
        break
      case 'follow': {
        const suggestedSection = document.getElementById('suggested-creators-card')
        if (suggestedSection) {
          suggestedSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
          suggestedSection.classList.add('ring-2', 'ring-primary', 'transition-all')
          setTimeout(() => {
            suggestedSection.classList.remove('ring-2', 'ring-primary')
          }, 2000)
        } else {
          router.push('/search')
        }
        break
      }
      case 'post':
        setActiveModal('create-post')
        break
      case 'message':
        router.push('/messages')
        break
    }
  }

  const handleDismiss = async () => {
    if (!progress.allCompleted || isDismissing) return

    setIsDismissing(true)
    // Optimistic hide
    setProgress((prev) => ({ ...prev, isDismissed: true }))

    try {
      const res = await dismissChecklistAction()
      if (res.error) {
        // Rollback
        setProgress((prev) => ({ ...prev, isDismissed: false }))
        toast.error(res.error)
      } else {
        toast.success('Checklist completed and dismissed!')
      }
    } catch {
      setProgress((prev) => ({ ...prev, isDismissed: false }))
      toast.error('Failed to dismiss checklist. Please try again.')
    } finally {
      setIsDismissing(false)
    }
  }

  const getStepIcon = (id: ChecklistStepId) => {
    switch (id) {
      case 'profile':
        return UserIcon
      case 'follow':
        return UsersIcon
      case 'post':
        return ImageIcon
      case 'message':
        return ChatBubbleLeftRightIcon
    }
  }

  return (
    <>
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-all mb-6',
          className
        )}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SparklesIcon className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Getting Started
                </h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {progress.completedCount}/{progress.totalCount} completed
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {progress.allCompleted
                  ? 'All tasks completed! You are fully set up on Wink.'
                  : 'Complete these quick steps to get the most out of Wink.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={toggleChecklistCollapsed}
              className="text-muted-foreground hover:text-foreground"
              aria-label={
                isChecklistCollapsed ? 'Expand checklist' : 'Collapse checklist'
              }
            >
              {isChecklistCollapsed ? (
                <ChevronDownIcon className="size-4" />
              ) : (
                <ChevronUpIcon className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress bar track */}
        <div className="h-1.5 w-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${Math.max(5, percentage)}%` }}
          />
        </div>

        {/* Collapsible checklist items */}
        {!isChecklistCollapsed && (
          <div className="p-4 sm:p-5 pt-3 sm:pt-4 space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {progress.steps.map((step) => {
                const IconComponent = getStepIcon(step.id)

                return (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border transition-all text-left gap-3',
                      step.isCompleted
                        ? 'border-border/50 bg-muted/30 text-muted-foreground'
                        : 'border-border bg-card/70 hover:border-primary/40 hover:bg-muted/40'
                    )}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {step.isCompleted ? (
                          <CheckCircleIconSolid className="size-4 text-emerald-500" />
                        ) : (
                          <svg
                            className="size-4 text-muted-foreground"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <circle cx="12" cy="12" r="8" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <IconComponent className="size-3.5 text-muted-foreground shrink-0" />
                          <p
                            className={cn(
                              'text-xs font-medium truncate',
                              step.isCompleted && 'line-through text-muted-foreground'
                            )}
                          >
                            {step.title}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {!step.isCompleted && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleStepAction(step.id)}
                        className="shrink-0 h-7 px-2.5 text-[11px] font-medium gap-1 rounded-md"
                      >
                        <span>{step.actionText}</span>
                        <ArrowRightIcon className="size-3" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Bottom completion banner & dismiss button */}
            {progress.allCompleted && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-foreground">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <SparklesIcon className="size-4 text-emerald-500 shrink-0" />
                  <span>
                    Congratulations! You have completed all getting started steps.
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleDismiss}
                  disabled={isDismissing}
                  className="w-full sm:w-auto h-7 px-3 text-xs font-semibold shrink-0"
                >
                  {isDismissing ? (
                    <ArrowPathIcon className="size-3.5 animate-spin" />
                  ) : (
                    <span>Dismiss Checklist</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        profile={{
          id: user.id,
          displayName: user.displayName,
          bio: user.bio ?? null,
          location: user.location ?? null,
          website: user.website ?? null,
          avatarUrl: user.avatarUrl ?? null,
        }}
        onProfileUpdated={(updated) => {
          router.refresh()
        }}
      />
    </>
  )
}
