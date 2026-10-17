import type { Component, HTMLAttributes } from 'vue'

export interface LabelGroupOptions {
  as?: string | Component
  overflowStyle?: 'inline' | 'overlay'
  visibleChildCount?: 'auto' | number
  className?: string
}
export type LabelGroupProps = LabelGroupOptions & HTMLAttributes
