export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}

export interface PixelCrop {
  x: number
  y: number
  width: number
  height: number
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  targetSize = 400
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Unable to create canvas 2D rendering context')
  }

  canvas.width = targetSize
  canvas.height = targetSize

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetSize,
    targetSize
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob from canvas'))
          return
        }
        resolve(blob)
      },
      'image/jpeg',
      0.92
    )
  })
}
