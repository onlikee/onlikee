import type { HTMLAttributes } from 'vue'

export interface ScrollableRegionOptions {
  className?: string
  ariaLabel?: string
  ariaLabelledby?: string
}

export type ScrollableRegionProps = HTMLAttributes &
  ScrollableRegionOptions &
  (
    | { 'aria-label': string; 'aria-labelledby'?: never }
    | { 'aria-label'?: never; 'aria-labelledby': string }
  )
