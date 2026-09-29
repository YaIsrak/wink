'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { toggleFollowAction } from '@/actions/follow'
import { toast } from 'sonner'
import { Check, UserPlus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

import { usePostStore } from '@/lib/store'

interface FollowButtonProps {
  targetUserId: string
  initialIsFollowing: boolean
  onFollowChange?: (isFollowing: boolean, followersCountDiff: number) => void
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  onFollowChange,
  size = 'sm',
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = React.useState(initialIsFollowing)
  const [isPending, setIsPending] = React.useState(false)

  React.useEffect(() => {
    setIsFollowing(initialIsFollowing)
  }, [initialIsFollowing])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isPending) return

    const previousState = isFollowing
    const nextState = !previousState
    const diff = nextState ? 1 : -1

    // Optimistic update
    setIsFollowing(nextState)
    usePostStore.getState().updateAuthorFollowStatus(targetUserId, nextState)
    onFollowChange?.(nextState, diff)
    setIsPending(true)

    try {
      const res = await toggleFollowAction(targetUserId)
      if (!res.success || res.error) {
        // Rollback
        setIsFollowing(previousState)
        usePostStore.getState().updateAuthorFollowStatus(targetUserId, previousState)
        onFollowChange?.(previousState, -diff)
        toast.error(res.error || 'Failed to update follow status')
      }
    } catch {
      // Rollback
      setIsFollowing(previousState)
      usePostStore.getState().updateAuthorFollowStatus(targetUserId, previousState)
      onFollowChange?.(previousState, -diff)
      toast.error('Network error updating follow status')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      size={size}
      variant={isFollowing ? 'outline' : 'default'}
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        'rounded-lg font-semibold transition-all select-none',
        isFollowing
          ? 'hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
          : 'shadow-xs',
        className
      )}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : isFollowing ? (
        <>
          <Check className="size-3.5" />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className="size-3.5" />
          <span>Follow</span>
        </>
      )}
    </Button>
  )
}
