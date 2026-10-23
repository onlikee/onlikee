import type { Component, FunctionalComponent, HTMLAttributes, NativeElements } from 'vue'

export type ResponsiveValue<T> = { narrow?: T; regular?: T; wide?: T }
export type StackResponsive<T> = T | ResponsiveValue<T>
export type StackSpacing = 'none' | 'tight' | 'condensed' | 'cozy' | 'normal' | 'spacious'
export type StackDirection = 'horizontal' | 'vertical'
export type StackAlign = 'stretch' | 'start' | 'center' | 'end' | 'baseline'
export type StackJustify = 'start' | 'center' | 'end' | 'space-between' | 'space-evenly'
export type StackWrap = 'wrap' | 'nowrap'

export interface StackOptions {
  as?: keyof NativeElements | Component
  gap?: StackResponsive<StackSpacing>
  direction?: StackResponsive<StackDirection>
  align?: StackResponsive<StackAlign>
  wrap?: StackResponsive<StackWrap>
  justify?: StackResponsive<StackJustify>
  padding?: StackResponsive<StackSpacing>
  paddingBlock?: StackResponsive<StackSpacing>
  paddingInline?: StackResponsive<StackSpacing>
  className?: string
}

export interface StackItemOptions {
  as?: keyof NativeElements | Component
  grow?: StackResponsive<boolean>
  shrink?: StackResponsive<boolean>
  className?: string
}

type ElementProps<As> = As extends keyof NativeElements
  ? NativeElements[As]
  : As extends new (...args: never[]) => { $props: infer Props }
    ? Props
    : As extends FunctionalComponent<infer Props>
      ? Props
      : HTMLAttributes

export type StackProps<As extends keyof NativeElements | Component = 'div'> = Omit<
  StackOptions,
  'as'
> & { as?: As } & Omit<ElementProps<As>, keyof StackOptions>
export type StackItemProps<As extends keyof NativeElements | Component = 'div'> = Omit<
  StackItemOptions,
  'as'
> & { as?: As } & Omit<ElementProps<As>, keyof StackItemOptions>

export type StackComponentProps<As extends keyof NativeElements | Component = 'div'> = Omit<
  StackOptions,
  'as'
> & { as?: As } & /* @vue-ignore */ Omit<ElementProps<NoInfer<As>>, keyof StackOptions>
export type StackItemComponentProps<As extends keyof NativeElements | Component = 'div'> = Omit<
  StackItemOptions,
  'as'
> & { as?: As } & /* @vue-ignore */ Omit<ElementProps<NoInfer<As>>, keyof StackItemOptions>

export interface StackInstance {
  element: HTMLElement | SVGElement | null
}
