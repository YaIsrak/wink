'use client'

import * as React from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getCroppedImg } from '@/lib/utils/crop-image'

interface AvatarCropDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string | null
  onCropConfirmed: (blob: Blob) => Promise<void> | void
  isUploading?: boolean
}

export function AvatarCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onCropConfirmed,
  isUploading = false,
}: AvatarCropDialogProps) {
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(
    null
  )
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleCropComplete = React.useCallback(
    (_croppedArea: Area, currentCroppedAreaPixels: Area) => {
      setCroppedAreaPixels(currentCroppedAreaPixels)
    },
    []
  )

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    try {
      setIsProcessing(true)
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      await onCropConfirmed(croppedBlob)
      onOpenChange(false)
    } catch (err) {
      console.error('Error applying avatar crop:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    if (!isUploading && !isProcessing) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogHeader>
        <DialogTitle>Crop your profile picture</DialogTitle>
        <DialogDescription>
          Drag to position and use the slider to adjust the circular preview.
        </DialogDescription>
      </DialogHeader>

      <div className="py-4">
        <div className="relative mx-auto h-72 w-full overflow-hidden rounded-lg bg-zinc-950">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
            />
          )}
        </div>

        <div className="mt-4 flex items-center gap-3 px-2">
          <MagnifyingGlassMinusIcon className="size-4 text-muted-foreground shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            aria-label="Zoom avatar preview"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-foreground"
          />
          <MagnifyingGlassPlusIcon className="size-4 text-muted-foreground shrink-0" />
        </div>
      </div>

      <DialogFooter className="mt-2 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isUploading || isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={isUploading || isProcessing}
        >
          {isUploading || isProcessing ? (
            <>
              <ArrowPathIcon className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Apply picture'
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
