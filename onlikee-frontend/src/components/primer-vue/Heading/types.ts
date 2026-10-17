import type { HTMLAttributes } from 'vue'

export type HeadingLevels = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export interface HeadingOptions {
  as?: HeadingLevels
  variant?: 'large' | 'medium' | 'small'
  className?: string
}
export type HeadingProps = HeadingOptions & HTMLAttributes
