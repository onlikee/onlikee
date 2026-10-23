import type { Component, FunctionalComponent, HTMLAttributes, NativeElements } from 'vue'

export type TextSize = 'large' | 'medium' | 'small'
export type TextWeight = 'light' | 'normal' | 'medium' | 'semibold'
export type TextWhiteSpace = 'pre' | 'normal' | 'nowrap' | 'pre-wrap' | 'pre-line'

export interface TextOptions {
  as?: keyof NativeElements | Component
  size?: TextSize
  weight?: TextWeight
  whiteSpace?: TextWhiteSpace
  className?: string
}

type ElementProps<As> = As extends keyof NativeElements
  ? NativeElements[As]
  : As extends new (...args: never[]) => { $props: infer Props }
    ? Props
    : As extends FunctionalComponent<infer Props>
      ? Props
      : HTMLAttributes

export type TextProps<As extends keyof NativeElements | Component = 'span'> = Omit<
  TextOptions,
  'as'
> & {
  as?: As
} & Omit<ElementProps<As>, keyof TextOptions>
export type TextComponentProps<As extends keyof NativeElements | Component = 'span'> = Omit<
  TextOptions,
  'as'
> & {
  as?: As
} & /* @vue-ignore */ Omit<ElementProps<NoInfer<As>>, keyof TextOptions>
export type TextElement = HTMLElement | SVGElement

export interface TextInstance {
  element: TextElement | null
}
