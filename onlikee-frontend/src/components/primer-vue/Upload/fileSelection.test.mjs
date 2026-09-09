import assert from 'node:assert/strict'
import test from 'node:test'

import { collectFilesFromDrop, collectFilesFromInput } from './fileSelection.ts'

function fileEntry(file, fullPath) {
  return { isFile: true, isDirectory: false, fullPath, file: resolve => resolve(file) }
}

function directoryEntry(chunks) {
  return {
    isFile: false,
    isDirectory: true,
    createReader() {
      let index = 0
      return { readEntries: resolve => resolve(chunks[index++] ?? []) }
    }
  }
}

function dropEntries(...entries) {
  return {
    items: entries.map(entry => ({ kind: 'file', webkitGetAsEntry: () => entry })),
    files: []
  }
}

test('nested drops retain same-name files, paths, original files and chunk order', async () => {
  const first = new File(['first'], '1.jpg', { type: 'image/jpeg' })
  const second = new File(['second'], '1.jpg', { type: 'image/jpeg' })
  const before = Object.getOwnPropertyDescriptors(first)
  const root = directoryEntry([
    [directoryEntry([[fileEntry(first, '/photos/a/1.jpg')]])],
    [directoryEntry([[fileEntry(second, '/photos/b/1.jpg')]])]
  ])

  const result = await collectFilesFromDrop(dropEntries(root), { directory: true })

  assert.deepEqual(result.map(item => item.relativePath), ['photos/a/1.jpg', 'photos/b/1.jpg'])
  assert.equal(result[0].file, first)
  assert.equal(result[1].file, second)
  assert.deepEqual(Object.getOwnPropertyDescriptors(first), before)
})

test('directory input and drop use the same relative path', async () => {
  const file = new File(['content'], 'file.txt')
  Object.defineProperty(file, 'webkitRelativePath', { value: 'folder/sub/file.txt' })
  const input = collectFilesFromInput([file], { directory: true })
  const drop = await collectFilesFromDrop(dropEntries(fileEntry(file, '/folder/sub/file.txt')), { directory: true })
  assert.deepEqual(input, drop)
  assert.equal(input[0].file, file)
  assert.equal(file.webkitRelativePath, 'folder/sub/file.txt')
})

test('ordinary selection keeps the first file and uses its name without mutation', async () => {
  const file = new File(['zip'], 'dist.zip')
  const extra = new File(['other'], 'other.zip')
  const before = Object.getOwnPropertyDescriptors(file)
  const expected = [{ file, relativePath: 'dist.zip' }]
  assert.deepEqual(collectFilesFromInput([file, extra]), expected)
  assert.deepEqual(await collectFilesFromDrop({ files: [file, extra] }), expected)
  assert.deepEqual(Object.getOwnPropertyDescriptors(file), before)
})

test('directory fallbacks wrap files from items and from the file list', async () => {
  const file = new File(['text'], 'notes.txt')
  const expected = [{ file, relativePath: 'notes.txt' }]
  for (const item of [
    { kind: 'file', getAsFile: () => file },
    { kind: 'file', webkitGetAsEntry: () => null, getAsFile: () => file }
  ]) {
    assert.deepEqual(await collectFilesFromDrop({ items: [item], files: [] }, { directory: true }), expected)
  }
  assert.deepEqual(await collectFilesFromDrop({ files: [file] }, { directory: true }), expected)
})

test('accept filters original file metadata and retains selected paths', async () => {
  const image = new File(['image'], '1.JPG', { type: 'image/jpeg' })
  const text = new File(['text'], 'note.txt', { type: 'text/plain' })
  for (const accept of ['.jpg', 'image/*', 'image/jpeg']) {
    const result = await collectFilesFromDrop(dropEntries(directoryEntry([[
      fileEntry(text, '/photos/note.txt'), fileEntry(image, '/photos/a/1.JPG')
    ]])), { directory: true, accept })
    assert.deepEqual(result, [{ file: image, relativePath: 'photos/a/1.JPG' }])
  }
  assert.deepEqual(collectFilesFromInput([text, image], { accept: '.jpg' }), [])
})

test('empty directories and missing selections produce no records', async () => {
  assert.deepEqual(await collectFilesFromDrop(dropEntries(directoryEntry([])), { directory: true }), [])
  assert.deepEqual(await collectFilesFromDrop(null), [])
  assert.deepEqual(collectFilesFromInput(null), [])
})

test('file and directory read errors reject instead of returning partial success', async () => {
  const error = new Error('read failed')
  const failedFile = { isFile: true, file: (resolve, reject) => reject(error) }
  const failedDirectory = {
    isFile: false,
    isDirectory: true,
    createReader: () => ({ readEntries: (resolve, reject) => reject(error) })
  }
  for (const entry of [failedFile, failedDirectory]) {
    await assert.rejects(collectFilesFromDrop(dropEntries(entry), { directory: true }), error)
  }
})
