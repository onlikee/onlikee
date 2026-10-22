import type { HTMLAttributes } from 'vue'

export interface ScrollableRegionOptions {
  className?: string
  ariaLabel?: string
  ariaLabelledby?: string
}

type NativeAttributes = {
  [Key in keyof HTMLAttributes as string extends Key ? never : Key]: HTMLAttributes[Key]
} & { [Name in `data-${string}`]?: string | number | boolean }

export type ScrollableRegionProps = Omit<NativeAttributes, 'aria-label' | 'aria-labelledby'> & {
  className?: string
  tabIndex?: HTMLAttributes['tabindex']
} & (
    | { 'aria-label': string; 'aria-labelledby'?: never }
    | { 'aria-label'?: never; 'aria-labelledby': string }
  )

export interface ScrollableRegionInstance {
  element: HTMLDivElement | null
}
