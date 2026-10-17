import type { HTMLAttributes } from 'vue'

export type SkeletonTextSize =
  | 'display'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'subtitle'

export interface SkeletonTextOptions {
  size?: SkeletonTextSize
  lines?: number
  maxWidth?: string | number
  className?: string
}
export type SkeletonTextProps = SkeletonTextOptions & HTMLAttributes
