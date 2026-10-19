import type { Component, NativeElements } from 'vue'

export interface LabelGroupOptions {
  as?: keyof NativeElements | Component
  overflowStyle?: 'inline' | 'overlay'
  visibleChildCount?: 'auto' | number
  className?: string
}
export type LabelGroupProps = LabelGroupOptions
