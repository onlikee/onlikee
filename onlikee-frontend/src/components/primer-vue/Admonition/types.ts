import type { HTMLAttributes } from 'vue'
import type { HeadingLevels } from '../Heading/types'

export type AdmonitionType = 'critical' | 'info' | 'success' | 'upsell' | 'warning'

interface AdmonitionOptions {
  type?: AdmonitionType
  title?: string
  titleAs?: 'div' | HeadingLevels
  typeLabel?: string
  className?: string
}

type NativeAttributes = {
  [Key in keyof HTMLAttributes as string extends Key ? never : Key]: HTMLAttributes[Key]
}

export type AdmonitionProps = AdmonitionOptions & NativeAttributes

// Native attributes remain in the public type and are forwarded through $attrs.
export type AdmonitionComponentProps = AdmonitionOptions &
  /* @vue-ignore */ Omit<AdmonitionProps, keyof AdmonitionOptions>
