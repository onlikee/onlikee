import type { CSSProperties } from 'vue'

export interface SpinnerOptions {
  size?: 'small' | 'medium' | 'large'
  srText?: string | null
  delay?: boolean | 'short' | 'long' | number
  className?: string
}

export type SpinnerProps = SpinnerOptions & {
  style?: CSSProperties
  /** @deprecated Use srText instead. */
  'aria-label'?: string
} & { [Name in `data-${string}`]?: string | number | boolean }
