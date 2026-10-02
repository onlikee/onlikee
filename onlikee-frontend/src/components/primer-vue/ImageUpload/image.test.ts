import { expect, test } from 'vitest'
import { getImageAccept, isImageAccepted, moveCrop, resizeCrop } from './image.ts'

test('default formats include PNG and additional accept constraints never allow GIF', () => {
  expect(getImageAccept()).toBe('.jpg,.jpeg,.png,.webp,.svg')
  expect(getImageAccept('image/*')).toBe('.jpg,.jpeg,.png,.webp,.svg')
  expect(getImageAccept(' image/jpeg, .WEBP ')).toBe('.jpg,.jpeg,.webp')
  expect(getImageAccept('.jpeg')).toBe('.jpeg')
  expect(getImageAccept('.png,image/gif')).toBe('.png')
  expect(getImageAccept('image/png')).toBe('.png')
  expect(getImageAccept('image/gif')).toBe('')
  for (const [name, type] of [['x.gif', 'image/gif'], ['x.txt', 'text/plain']]) {
    expect(isImageAccepted(new File(['x'], name, { type }), 'image/*')).toBe(false)
  }
})

test('file validation accepts supported extensions, empty MIME and uppercase but rejects contradictory MIME', () => {
  for (const [name, type] of [['x.JPG', 'image/jpeg'], ['x.jpeg', ''], ['x.PNG', 'image/png'], ['x.png', ''], ['x.webp', 'image/webp'], ['x.svg', 'image/svg+xml']]) {
    expect(isImageAccepted(new File(['x'], name, { type }))).toBe(true)
  }
  expect(isImageAccepted(new File(['x'], 'x.jpg', { type: 'image/png' }))).toBe(false)
  expect(isImageAccepted(new File(['x'], 'x.webp', { type: 'image/webp' }), 'image/jpeg')).toBe(false)
  expect(isImageAccepted(new File(['x'], 'x.jpg', { type: 'image/jpeg' }), '.png')).toBe(false)
  expect(isImageAccepted(new File(['x'], 'x.png', { type: 'image/png' }), 'image/jpeg')).toBe(false)
  expect(isImageAccepted(new File(['x'], 'x.PNG', { type: 'image/png' }), '.png')).toBe(true)
})

test('moving a crop stays inside landscape and portrait images', () => {
  expect(moveCrop({ x: 100, y: 0, size: 400 }, -200, 100, 800, 400)).toStrictEqual({ x: 0, y: 0, size: 400 })
  expect(moveCrop({ x: 0, y: 100, size: 400 }, 100, 1000, 400, 800)).toStrictEqual({ x: 0, y: 400, size: 400 })
  expect(moveCrop({ x: 100, y: 100, size: 200 }, 20, -30, 800, 600)).toStrictEqual({ x: 120, y: 70, size: 200 })
})

test('all four handles keep the opposite corner fixed while resizing a square', () => {
  const crop = { x: 100, y: 100, size: 200 }
  expect(resizeCrop(crop, 'nw', 50, 50, 800, 600)).toStrictEqual({ x: 150, y: 150, size: 150 })
  expect(resizeCrop(crop, 'ne', -50, 50, 800, 600)).toStrictEqual({ x: 100, y: 150, size: 150 })
  expect(resizeCrop(crop, 'sw', 50, -50, 800, 600)).toStrictEqual({ x: 150, y: 100, size: 150 })
  expect(resizeCrop(crop, 'se', -50, -50, 800, 600)).toStrictEqual({ x: 100, y: 100, size: 150 })
})

test('resize clamps to image boundaries and allows images smaller than the normal minimum', () => {
  expect(resizeCrop({ x: 100, y: 100, size: 200 }, 'nw', -1000, -1000, 800, 600)).toStrictEqual({ x: 0, y: 0, size: 300 })
  expect(resizeCrop({ x: 100, y: 100, size: 200 }, 'se', 1000, 1000, 800, 600)).toStrictEqual({ x: 100, y: 100, size: 500 })
  expect(resizeCrop({ x: 100, y: 100, size: 200 }, 'se', -1000, -1000, 800, 600)).toStrictEqual({ x: 100, y: 100, size: 32 })
  expect(resizeCrop({ x: 0, y: 0, size: 16 }, 'se', 100, 100, 16, 16)).toStrictEqual({ x: 0, y: 0, size: 16 })
})
