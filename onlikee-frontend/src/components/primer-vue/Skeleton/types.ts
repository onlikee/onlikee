import type { HTMLAttributes } from 'vue'

export interface SkeletonBoxOptions {
  height?: string | number
  width?: string | number
  className?: string
  delay?: 'short' | 'long' | number
}
export type SkeletonBoxProps = SkeletonBoxOptions & HTMLAttributes & { 'data-component'?: string }
