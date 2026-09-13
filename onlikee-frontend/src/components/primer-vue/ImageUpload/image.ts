const IMAGE_TYPES = [
  { extension: '.jpg', type: 'image/jpeg' },
  { extension: '.jpeg', type: 'image/jpeg' },
  { extension: '.png', type: 'image/png' },
  { extension: '.webp', type: 'image/webp' },
  { extension: '.svg', type: 'image/svg+xml' }
]

export function getImageAccept(accept = ''): string {
  const constraints = accept.toLowerCase().split(',').map(value => value.trim()).filter(Boolean)
  return IMAGE_TYPES.filter(image => !constraints.length || constraints.some(value =>
    value === image.extension || value === image.type || value === 'image/*'
  )).map(image => image.extension).join(',')
}

export function isImageAccepted(file: File, accept = ''): boolean {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  const image = IMAGE_TYPES.find(item => item.extension === extension)
  return Boolean(image && getImageAccept(accept).split(',').includes(extension)
    && (!file.type || file.type.toLowerCase() === image.type))
}

export interface CropRect {
  x: number
  y: number
  size: number
}

export type CropCorner = 'nw' | 'ne' | 'sw' | 'se'

export function moveCrop(crop: CropRect, dx: number, dy: number, width: number, height: number): CropRect {
  return {
    ...crop,
    x: Math.max(0, Math.min(width - crop.size, crop.x + dx)),
    y: Math.max(0, Math.min(height - crop.size, crop.y + dy))
  }
}

export function resizeCrop(
  crop: CropRect, corner: CropCorner, dx: number, dy: number, width: number, height: number
): CropRect {
  const left = corner.includes('w')
  const top = corner.includes('n')
  const anchorX = left ? crop.x + crop.size : crop.x
  const anchorY = top ? crop.y + crop.size : crop.y
  const delta = ((left ? -dx : dx) + (top ? -dy : dy)) / 2
  const maxSize = Math.min(left ? anchorX : width - anchorX, top ? anchorY : height - anchorY)
  const minSize = Math.min(32, maxSize)
  const size = Math.max(minSize, Math.min(maxSize, crop.size + delta))
  return { x: left ? anchorX - size : anchorX, y: top ? anchorY - size : anchorY, size }
}

export async function cropImage(image: HTMLImageElement, crop: CropRect, original: File): Promise<File> {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = Math.max(1, Math.round(crop.size))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('无法创建图片裁剪画布，请重试。')
  context.drawImage(image, crop.x, crop.y, crop.size, crop.size, 0, 0, canvas.width, canvas.height)

  const extension = original.name.slice(original.name.lastIndexOf('.')).toLowerCase()
  const type = extension === '.svg' || extension === '.png' ? 'image/png' : extension === '.webp' ? 'image/webp' : 'image/jpeg'
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(result => {
      if (result) resolve(result)
      else reject(new Error('图片裁剪失败，请重试。'))
    }, type, 0.92)
  })
  const outputExtension = blob.type === 'image/png' ? '.png' : blob.type === 'image/webp' ? '.webp' : extension
  const name = `${original.name.slice(0, original.name.lastIndexOf('.'))}${outputExtension}`
  return new File([blob], name, { type: blob.type })
}
