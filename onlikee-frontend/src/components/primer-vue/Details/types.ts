import type {
  Component,
  DetailsHTMLAttributes,
  FunctionalComponent,
  HTMLAttributes,
  NativeElements,
} from 'vue'

export interface DetailsProps extends /* @vue-ignore */ DetailsHTMLAttributes {
  className?: string
  'data-component'?: string
}
export interface DetailsInstance {
  element: HTMLDetailsElement | null
}
type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}
type ElementProps<As> = As extends keyof NativeElements
  ? RemoveIndexSignature<NativeElements[As]>
  : As extends new (...args: never[]) => { $props: infer Props }
    ? Props
    : As extends FunctionalComponent<infer Props>
      ? Props
      : RemoveIndexSignature<HTMLAttributes>
export type SummaryProps<As extends keyof NativeElements | Component = 'summary'> = {
  as?: As
  className?: string
} & Omit<ElementProps<As>, 'as'>
export type SummaryComponentProps<As extends keyof NativeElements | Component = 'summary'> = {
  as?: As
  className?: string
} & /* @vue-ignore */ Omit<ElementProps<NoInfer<As>>, 'as'>
