import { strToU8, zip } from 'fflate'
import type { AsyncZippable } from 'fflate'
import type { UploadFile } from '@/components/primer-vue/Upload'

export async function createHtmlZip(
  htmlSource: string
): Promise<File> {
  const archive = await new Promise<Uint8Array>((resolve, reject) => {
    zip(
      {
        'index.html': strToU8(htmlSource)
      },
      (error, data) => {
        if (error) {
          reject(error)
          return
        }

        resolve(data)
      }
    )
  })

  return new File([Uint8Array.from(archive)], 'dist.zip', {
    type: 'application/zip'
  })
}

export async function createFolderZip(
  files: readonly UploadFile[]
): Promise<File> {
  const entries: AsyncZippable = Object.create(null)
  for (const { file, relativePath } of files) {
    entries[relativePath] = new Uint8Array(await file.arrayBuffer())
  }

  const archive = await new Promise<Uint8Array>((resolve, reject) => {
    zip(entries, (error, data) => {
      if (error) {
        reject(error)
        return
      }

      resolve(data)
    })
  })

  return new File([Uint8Array.from(archive)], 'dist.zip', {
    type: 'application/zip'
  })
}
