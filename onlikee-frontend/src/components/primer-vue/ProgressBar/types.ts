import type { HTMLAttributes } from 'vue'

interface ProgressBarItemOptions {
  progress?: string | number
  bg?: string
  className?: string
}

interface ProgressBarOptions extends ProgressBarItemOptions {
  inline?: boolean
  barSize?: 'small' | 'default' | 'large'
  animated?: boolean
}

type NativeAttributes = {
  [Key in keyof HTMLAttributes as string extends Key ? never : Key]: HTMLAttributes[Key]
} & { [Name in `data-${string}`]?: string | number | boolean }

export type ProgressBarProps = ProgressBarOptions & NativeAttributes
export type ProgressBarItemProps = ProgressBarItemOptions & NativeAttributes

export interface ProgressBarInstance {
  element: HTMLSpanElement | null
}

export interface ProgressBarItemInstance {
  element: HTMLSpanElement | null
}

// Native attributes remain in the public type and are forwarded through $attrs.
export type ProgressBarComponentProps = ProgressBarOptions & /* @vue-ignore */ NativeAttributes
export type ProgressBarItemComponentProps = ProgressBarItemOptions &
  /* @vue-ignore */ NativeAttributes
