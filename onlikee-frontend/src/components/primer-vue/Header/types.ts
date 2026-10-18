import type {
  Component,
  ComponentPublicInstance,
  FunctionalComponent,
  HTMLAttributes,
  NativeElements,
} from 'vue'
import type { RouteLocationRaw } from 'vue-router'

type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}
type ElementProps<As> = As extends keyof NativeElements
  ? RemoveIndexSignature<NativeElements[As]>
  : As extends new (...args: never[]) => { $props: infer Props }
    ? Props
    : As extends FunctionalComponent<infer Props>
      ? Props
      : object

export type HeaderProps<As extends keyof NativeElements | Component = 'header'> = As extends unknown
  ? { as?: As; className?: string } & Omit<ElementProps<As>, 'as' | 'className'>
  : never

export interface HeaderItemOptions {
  full?: boolean
  className?: string
}
export type HeaderItemProps = HeaderItemOptions & RemoveIndexSignature<HTMLAttributes>

export type HeaderLinkProps<As extends keyof NativeElements | Component = 'a'> = As extends unknown
  ? { as?: As; className?: string; to?: RouteLocationRaw } & Omit<
      ElementProps<As>,
      'as' | 'className'
    >
  : never

export type HeaderElement<As extends keyof NativeElements | Component = 'header'> =
  As extends keyof HTMLElementTagNameMap
    ? HTMLElementTagNameMap[As]
    : As extends keyof SVGElementTagNameMap
      ? SVGElementTagNameMap[As]
      : As extends new (...args: never[]) => infer Instance
        ? Instance
        : ComponentPublicInstance

export interface HeaderInstance<As extends keyof NativeElements | Component = 'header'> {
  element: HeaderElement<As> | null
}
export interface HeaderItemInstance {
  element: HTMLDivElement | null
}
export interface HeaderLinkInstance<As extends keyof NativeElements | Component = 'a'> {
  element: HeaderElement<As> | null
}

// Native/custom attributes remain in the public type and are forwarded through $attrs.
export type HeaderComponentProps<As extends keyof NativeElements | Component = 'header'> = {
  as?: As
  className?: string
} & /* @vue-ignore */ Omit<ElementProps<NoInfer<As>>, 'as' | 'className'>

export type HeaderLinkComponentProps<As extends keyof NativeElements | Component = 'a'> = {
  as?: As
  className?: string
} & /* @vue-ignore */ (Omit<ElementProps<NoInfer<As>>, 'as' | 'className'> & {
  to?: RouteLocationRaw
})
