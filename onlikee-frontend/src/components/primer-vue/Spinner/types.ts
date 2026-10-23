import type { CSSProperties } from 'vue'

export interface SpinnerOptions {
  size?: 'small' | 'medium' | 'large'
  srText?: string | null
  delay?: boolean | 'short' | 'long' | number
  className?: string
  /** @deprecated Use srText instead. */
  'aria-label'?: string
}

export type SpinnerProps = SpinnerOptions & {
  style?: CSSProperties
} & { [Name in `data-${string}`]?: unknown }
