'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowPathIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AvatarUpload } from '@/components/onboarding/avatar-upload'
import {
  completeOnboardingAction,
  skipOnboardingAction,
} from '@/actions/onboarding'

interface OnboardingFormProps {
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string | null
    bio?: string | null
  }
}

export function OnboardingForm({ user }: OnboardingFormProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = React.useState(user.displayName || '')
  const [bio, setBio] = React.useState(user.bio || '')
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    user.avatarUrl || null
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSkipping, setIsSkipping] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = displayName.trim()
    if (trimmedName.length < 2) {
      toast.error('Display name must be at least 2 characters.')
      return
    }

    if (trimmedName.length > 50) {
      toast.error('Display name cannot exceed 50 characters.')
      return
    }

    if (bio.length > 160) {
      toast.error('Bio cannot exceed 160 characters.')
      return
    }

    try {
      setIsSubmitting(true)
      const result = await completeOnboardingAction({
        displayName: trimmedName,
        bio: bio.trim(),
        avatarUrl,
      })

      if (result.error) {
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      toast.success('Welcome to Wink! Your profile is ready.')
      router.push(result.redirectTo || '/feed')
      router.refresh()
    } catch (err) {
      console.error('Submission error:', err)
      toast.error('Failed to save profile. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    try {
      setIsSkipping(true)
      const result = await skipOnboardingAction()

      if (result.error) {
        toast.error(result.error)
        setIsSkipping(false)
        return
      }

      toast.info('You can complete your profile anytime in settings.')
      router.push(result.redirectTo || '/feed')
      router.refresh()
    } catch (err) {
      console.error('Skip error:', err)
      toast.error('Failed to skip onboarding. Please try again.')
      setIsSkipping(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card className="border border-border bg-card shadow-sm rounded-xl p-6 sm:p-8">
        <CardHeader className="p-0 pb-6 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Complete your profile
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1.5">
            Add a photo and tell the community a little about yourself.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <CardContent className="p-0 space-y-6">
            <AvatarUpload
              userId={user.id}
              displayName={displayName || user.displayName}
              currentAvatarUrl={avatarUrl}
              onAvatarChange={setAvatarUrl}
            />

            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                  @
                </span>
                <Input
                  id="username"
                  type="text"
                  value={user.username}
                  disabled
                  readOnly
                  className="pl-8 bg-muted/50 cursor-not-allowed text-muted-foreground"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Your username was registered with your account and cannot be changed here.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="displayName"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Display Name
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {displayName.length}/50
                </span>
              </div>
              <Input
                id="displayName"
                type="text"
                placeholder="What should people call you?"
                value={displayName}
                maxLength={50}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={isSubmitting || isSkipping}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="bio"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Bio
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {bio.length}/160
                </span>
              </div>
              <Textarea
                id="bio"
                placeholder="Share a short bio or what interests you..."
                value={bio}
                maxLength={160}
                rows={3}
                onChange={(e) => setBio(e.target.value)}
                disabled={isSubmitting || isSkipping}
                className="resize-none"
              />
            </div>
          </CardContent>

          <CardFooter className="p-0 pt-2 flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium rounded-lg"
              disabled={isSubmitting || isSkipping}
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="mr-2 size-4 animate-spin" />
                  Saving profile...
                </>
              ) : (
                <>
                  Complete Profile
                  <ArrowRightIcon className="ml-2 size-4" />
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting || isSkipping}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 py-1"
            >
              {isSkipping ? (
                <span className="inline-flex items-center gap-1.5">
                  <ArrowPathIcon className="size-3.5 animate-spin" />
                  Skipping...
                </span>
              ) : (
                'Skip for now'
              )}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
