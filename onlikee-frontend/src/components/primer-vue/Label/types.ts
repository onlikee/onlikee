import type { Component, FunctionalComponent, HTMLAttributes, NativeElements } from 'vue'

export type LabelColorOptions =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'attention'
  | 'severe'
  | 'danger'
  | 'done'
  | 'sponsors'
export type LabelSizeKeys = 'small' | 'large'
export interface LabelOptions {
  as?: string | Component
  variant?: LabelColorOptions
  size?: LabelSizeKeys
  className?: string
}
type ElementProps<As> = As extends keyof NativeElements
  ? NativeElements[As]
  : As extends new (...args: never[]) => { $props: infer Props }
    ? Props
    : As extends FunctionalComponent<infer Props>
      ? Props
      : HTMLAttributes
export type LabelProps<As extends string | Component = 'span'> = Omit<LabelOptions, 'as'> & {
  as?: As
} & Omit<ElementProps<As>, keyof LabelOptions>
