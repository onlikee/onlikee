import type {
  Component,
  ComponentPublicInstance,
  FunctionalComponent,
  HTMLAttributes,
  NativeElements,
} from 'vue'

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
  as?: keyof NativeElements | Component
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
export type LabelProps<As extends keyof NativeElements | Component = 'span'> = Omit<
  LabelOptions,
  'as'
> & {
  as?: As
} & Omit<ElementProps<As>, keyof LabelOptions>

export interface LabelInstance {
  element: HTMLElement | SVGElement | ComponentPublicInstance | null
}

// Keep native/component attributes in the public type while forwarding them through $attrs.
export type LabelComponentProps<As extends keyof NativeElements | Component = 'span'> = Omit<
  LabelOptions,
  'as'
> & {
  as?: As
} & /* @vue-ignore */ Omit<ElementProps<NoInfer<As>>, keyof LabelOptions>
