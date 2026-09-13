import assert from 'node:assert/strict'
import test from 'node:test'
import { getImageAccept, isImageAccepted, moveCrop, resizeCrop } from './image.ts'

test('default formats include PNG and additional accept constraints never allow GIF', () => {
  assert.equal(getImageAccept(), '.jpg,.jpeg,.png,.webp,.svg')
  assert.equal(getImageAccept('image/*'), '.jpg,.jpeg,.png,.webp,.svg')
  assert.equal(getImageAccept(' image/jpeg, .WEBP '), '.jpg,.jpeg,.webp')
  assert.equal(getImageAccept('.jpeg'), '.jpeg')
  assert.equal(getImageAccept('.png,image/gif'), '.png')
  assert.equal(getImageAccept('image/png'), '.png')
  assert.equal(getImageAccept('image/gif'), '')
  for (const [name, type] of [['x.gif', 'image/gif'], ['x.txt', 'text/plain']]) {
    assert.equal(isImageAccepted(new File(['x'], name, { type }), 'image/*'), false)
  }
})

test('file validation accepts supported extensions, empty MIME and uppercase but rejects contradictory MIME', () => {
  for (const [name, type] of [['x.JPG', 'image/jpeg'], ['x.jpeg', ''], ['x.PNG', 'image/png'], ['x.png', ''], ['x.webp', 'image/webp'], ['x.svg', 'image/svg+xml']]) {
    assert.equal(isImageAccepted(new File(['x'], name, { type })), true)
  }
  assert.equal(isImageAccepted(new File(['x'], 'x.jpg', { type: 'image/png' })), false)
  assert.equal(isImageAccepted(new File(['x'], 'x.webp', { type: 'image/webp' }), 'image/jpeg'), false)
  assert.equal(isImageAccepted(new File(['x'], 'x.jpg', { type: 'image/jpeg' }), '.png'), false)
  assert.equal(isImageAccepted(new File(['x'], 'x.png', { type: 'image/png' }), 'image/jpeg'), false)
  assert.equal(isImageAccepted(new File(['x'], 'x.PNG', { type: 'image/png' }), '.png'), true)
})

test('moving a crop stays inside landscape and portrait images', () => {
  assert.deepEqual(moveCrop({ x: 100, y: 0, size: 400 }, -200, 100, 800, 400), { x: 0, y: 0, size: 400 })
  assert.deepEqual(moveCrop({ x: 0, y: 100, size: 400 }, 100, 1000, 400, 800), { x: 0, y: 400, size: 400 })
  assert.deepEqual(moveCrop({ x: 100, y: 100, size: 200 }, 20, -30, 800, 600), { x: 120, y: 70, size: 200 })
})

test('all four handles keep the opposite corner fixed while resizing a square', () => {
  const crop = { x: 100, y: 100, size: 200 }
  assert.deepEqual(resizeCrop(crop, 'nw', 50, 50, 800, 600), { x: 150, y: 150, size: 150 })
  assert.deepEqual(resizeCrop(crop, 'ne', -50, 50, 800, 600), { x: 100, y: 150, size: 150 })
  assert.deepEqual(resizeCrop(crop, 'sw', 50, -50, 800, 600), { x: 150, y: 100, size: 150 })
  assert.deepEqual(resizeCrop(crop, 'se', -50, -50, 800, 600), { x: 100, y: 100, size: 150 })
})

test('resize clamps to image boundaries and allows images smaller than the normal minimum', () => {
  assert.deepEqual(resizeCrop({ x: 100, y: 100, size: 200 }, 'nw', -1000, -1000, 800, 600), { x: 0, y: 0, size: 300 })
  assert.deepEqual(resizeCrop({ x: 100, y: 100, size: 200 }, 'se', 1000, 1000, 800, 600), { x: 100, y: 100, size: 500 })
  assert.deepEqual(resizeCrop({ x: 100, y: 100, size: 200 }, 'se', -1000, -1000, 800, 600), { x: 100, y: 100, size: 32 })
  assert.deepEqual(resizeCrop({ x: 0, y: 0, size: 16 }, 'se', 100, 100, 16, 16), { x: 0, y: 0, size: 16 })
})
