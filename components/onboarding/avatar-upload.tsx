'use client'

import * as React from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { AvatarCropDialog } from '@/components/onboarding/avatar-crop-dialog'

interface AvatarUploadProps {
  userId: string
  displayName: string
  currentAvatarUrl?: string | null
  onAvatarChange: (url: string) => void
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function AvatarUpload({
  userId,
  displayName,
  currentAvatarUrl,
  onAvatarChange,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    currentAvatarUrl || null
  )
  const [rawImageSrc, setRawImageSrc] = React.useState<string | null>(null)
  const [cropDialogOpen, setCropDialogOpen] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or WebP).')
      e.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error('Image file must be 5MB or smaller.')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setRawImageSrc(reader.result as string)
      setCropDialogOpen(true)
    }
    reader.onerror = () => {
      toast.error('Unable to read the chosen image file. Please try another.')
    }
    reader.readAsDataURL(file)

    e.target.value = ''
  }

  const handleCropConfirmed = async (blob: Blob) => {
    try {
      setIsUploading(true)
      const supabase = createClient()
      const timestamp = Date.now()
      const filePath = `${userId}/avatar-${timestamp}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        toast.error(`Upload failed: ${uploadError.message}`)
        return
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const publicUrl = data.publicUrl

      setPreviewUrl(publicUrl)
      onAvatarChange(publicUrl)
      toast.success('Profile picture updated successfully.')
    } catch (err: unknown) {
      console.error('Avatar upload exception:', err)
      toast.error(
        'An unexpected error occurred during photo upload. Please try again.'
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <Avatar
          src={previewUrl}
          fallback={displayName ? displayName.slice(0, 2) : 'WK'}
          className="size-24 md:size-28 text-2xl shadow-sm border-2 border-border"
        />

        <button
          type="button"
          aria-label="Upload profile picture"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Camera className="size-4" />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileSelect}
        />
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          {previewUrl ? 'Change photo' : 'Upload photo'}
        </button>
        <p className="text-[11px] text-muted-foreground/75 mt-0.5">
          JPEG, PNG, or WebP up to 5MB
        </p>
      </div>

      <AvatarCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={rawImageSrc}
        onCropConfirmed={handleCropConfirmed}
        isUploading={isUploading}
      />
    </div>
  )
}
