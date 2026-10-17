import type { HTMLAttributes } from 'vue'

export interface SkeletonBoxOptions {
  height?: string | number
  width?: string | number
  className?: string
  delay?: 'short' | 'long' | number
  dataComponent?: string
}
export type SkeletonBoxProps = SkeletonBoxOptions & HTMLAttributes & { 'data-component'?: string }
