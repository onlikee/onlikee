import { expect, test } from 'vitest'

import { collectFilesFromDrop, collectFilesFromInput } from './fileSelection.ts'

function fileEntry(file: File, fullPath: string): FileSystemEntry {
  return { isFile: true, isDirectory: false, fullPath, file: (resolve: FileCallback) => resolve(file) } as FileSystemFileEntry
}

function directoryEntry(chunks: FileSystemEntry[][]): FileSystemEntry {
  return {
    isFile: false,
    isDirectory: true,
    createReader() {
      let index = 0
      return { readEntries: (resolve: FileSystemEntriesCallback) => resolve(chunks[index++] ?? []) }
    }
  } as FileSystemDirectoryEntry
}

function dropEntries(...entries: FileSystemEntry[]): DataTransfer {
  return {
    items: entries.map(entry => ({ kind: 'file', webkitGetAsEntry: () => entry })),
    files: []
  } as unknown as DataTransfer
}

function fileList(...files: File[]): FileList {
  return Object.assign(files, { item: (index: number) => files[index] ?? null }) as unknown as FileList
}

function transfer(files: File[], items?: Partial<DataTransferItem>[]): DataTransfer {
  return { files: fileList(...files), items } as unknown as DataTransfer
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

  expect(result.map(item => item.relativePath)).toStrictEqual(['photos/a/1.jpg', 'photos/b/1.jpg'])
  expect(result[0].file).toBe(first)
  expect(result[1].file).toBe(second)
  expect(Object.getOwnPropertyDescriptors(first)).toStrictEqual(before)
})

test('directory input and drop use the same relative path', async () => {
  const file = new File(['content'], 'file.txt')
  Object.defineProperty(file, 'webkitRelativePath', { value: 'folder/sub/file.txt' })
  const input = collectFilesFromInput(fileList(file), { directory: true })
  const drop = await collectFilesFromDrop(dropEntries(fileEntry(file, '/folder/sub/file.txt')), { directory: true })
  expect(input).toStrictEqual(drop)
  expect(input[0].file).toBe(file)
  expect(file.webkitRelativePath).toBe('folder/sub/file.txt')
})

test('ordinary selection keeps the first file and uses its name without mutation', async () => {
  const file = new File(['zip'], 'dist.zip')
  const extra = new File(['other'], 'other.zip')
  const before = Object.getOwnPropertyDescriptors(file)
  const expected = [{ file, relativePath: 'dist.zip' }]
  expect(collectFilesFromInput(fileList(file, extra))).toStrictEqual(expected)
  expect(await collectFilesFromDrop(transfer([file, extra]))).toStrictEqual(expected)
  expect(Object.getOwnPropertyDescriptors(file)).toStrictEqual(before)
})

test('directory fallbacks wrap files from items and from the file list', async () => {
  const file = new File(['text'], 'notes.txt')
  const expected = [{ file, relativePath: 'notes.txt' }]
  for (const item of [
    { kind: 'file', getAsFile: () => file },
    { kind: 'file', webkitGetAsEntry: () => null, getAsFile: () => file }
  ]) {
    expect(await collectFilesFromDrop(transfer([], [item]), { directory: true })).toStrictEqual(expected)
  }
  expect(await collectFilesFromDrop(transfer([file]), { directory: true })).toStrictEqual(expected)
})

test('accept filters original file metadata and retains selected paths', async () => {
  const image = new File(['image'], '1.JPG', { type: 'image/jpeg' })
  const text = new File(['text'], 'note.txt', { type: 'text/plain' })
  for (const accept of ['.jpg', 'image/*', 'image/jpeg']) {
    const result = await collectFilesFromDrop(dropEntries(directoryEntry([[
      fileEntry(text, '/photos/note.txt'), fileEntry(image, '/photos/a/1.JPG')
    ]])), { directory: true, accept })
    expect(result).toStrictEqual([{ file: image, relativePath: 'photos/a/1.JPG' }])
  }
  expect(collectFilesFromInput(fileList(text, image), { accept: '.jpg' })).toStrictEqual([])
})

test('empty directories and missing selections produce no records', async () => {
  expect(await collectFilesFromDrop(dropEntries(directoryEntry([])), { directory: true })).toStrictEqual([])
  expect(await collectFilesFromDrop(null)).toStrictEqual([])
  expect(collectFilesFromInput(null)).toStrictEqual([])
})

test('file and directory read errors reject instead of returning partial success', async () => {
  const error = new DOMException('read failed', 'NotReadableError')
  const failedFile = { isFile: true, file: (_resolve: FileCallback, reject: ErrorCallback) => reject(error) } as unknown as FileSystemFileEntry
  const failedDirectory = {
    isFile: false,
    isDirectory: true,
    createReader: () => ({ readEntries: (_resolve: FileSystemEntriesCallback, reject: ErrorCallback) => reject(error) })
  } as unknown as FileSystemDirectoryEntry
  for (const entry of [failedFile, failedDirectory]) {
    await expect(collectFilesFromDrop(dropEntries(entry), { directory: true })).rejects.toBe(error)
  }
})
