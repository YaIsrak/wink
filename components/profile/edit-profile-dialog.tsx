'use client'

import * as React from 'react'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AvatarUpload } from '@/components/onboarding/avatar-upload'
import { updateProfileDetailsAction } from '@/actions/profile'
import { toast } from 'sonner'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: {
    id: string
    displayName: string
    bio: string | null
    location: string | null
    website: string | null
    avatarUrl: string | null
  }
  onProfileUpdated?: (updated: {
    displayName: string
    bio: string | null
    location: string | null
    website: string | null
    avatarUrl: string | null
  }) => void
}

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onProfileUpdated,
}: EditProfileDialogProps) {
  const [displayName, setDisplayName] = React.useState(profile.displayName || '')
  const [bio, setBio] = React.useState(profile.bio || '')
  const [location, setLocation] = React.useState(profile.location || '')
  const [website, setWebsite] = React.useState(profile.website || '')
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(profile.avatarUrl)

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[] | undefined>>({})

  // Keep state synced with incoming profile
  React.useEffect(() => {
    if (open) {
      setDisplayName(profile.displayName || '')
      setBio(profile.bio || '')
      setLocation(profile.location || '')
      setWebsite(profile.website || '')
      setAvatarUrl(profile.avatarUrl)
      setFieldErrors({})
    }
  }, [open, profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setFieldErrors({})

    try {
      const res = await updateProfileDetailsAction({
        displayName,
        bio,
        location,
        website,
        avatarUrl,
      })

      if (!res.success || res.error) {
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors)
        }
        toast.error(res.error || 'Failed to update profile')
        return
      }

      toast.success('Profile updated successfully')
      onProfileUpdated?.({
        displayName: displayName.trim(),
        bio: bio.trim() ? bio.trim() : null,
        location: location.trim() ? location.trim() : null,
        website: website.trim() ? website.trim() : null,
        avatarUrl,
      })
      onOpenChange(false)
    } catch {
      toast.error('An unexpected error occurred while saving your profile.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogDescription>
          Update your public profile details and information
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-2">
        {/* Avatar Upload */}
        <AvatarUpload
          userId={profile.id}
          displayName={displayName || 'User'}
          currentAvatarUrl={avatarUrl}
          onAvatarChange={(newUrl) => setAvatarUrl(newUrl)}
        />

        {/* Display Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="displayName"
            className="text-xs font-semibold text-foreground"
          >
            Display Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            maxLength={50}
            required
            className="rounded-lg"
          />
          {fieldErrors.displayName && (
            <p className="text-xs text-destructive">
              {fieldErrors.displayName[0]}
            </p>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="bio"
              className="text-xs font-semibold text-foreground"
            >
              Bio
            </label>
            <span className="text-[11px] text-muted-foreground">
              {bio.length} / 160
            </span>
          </div>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell everyone a little bit about yourself..."
            rows={3}
            maxLength={160}
            className="rounded-lg resize-none"
          />
          {fieldErrors.bio && (
            <p className="text-xs text-destructive">{fieldErrors.bio[0]}</p>
          )}
        </div>

        {/* Location & Website in two-column grid on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="location"
              className="text-xs font-semibold text-foreground"
            >
              Location
            </label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              maxLength={100}
              className="rounded-lg"
            />
            {fieldErrors.location && (
              <p className="text-xs text-destructive">
                {fieldErrors.location[0]}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="website"
              className="text-xs font-semibold text-foreground"
            >
              Website
            </label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g. yourname.com"
              maxLength={255}
              className="rounded-lg"
            />
            {fieldErrors.website && (
              <p className="text-xs text-destructive">
                {fieldErrors.website[0]}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !displayName.trim()}
            className="rounded-lg font-semibold"
          >
            {isSubmitting ? (
              <>
                <ArrowPathIcon className="size-4 animate-spin mr-1.5" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
