import type {
  Component,
  CSSProperties,
  FunctionalComponent,
  HTMLAttributes,
  NativeElements,
} from 'vue'
import type { RouteLocationRaw } from 'vue-router'

export interface BreadcrumbsProps {
  className?: string
  overflow?: 'wrap' | 'menu' | 'menu-with-root'
  variant?: 'normal' | 'spacious'
  style?: CSSProperties
}

interface BreadcrumbsItemOptions {
  to?: RouteLocationRaw
  selected?: boolean
  className?: string
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

export type BreadcrumbsItemProps<As extends keyof NativeElements | Component = 'a'> =
  As extends unknown
    ? BreadcrumbsItemOptions & { as?: As } & Omit<ElementProps<As>, keyof BreadcrumbsItemOptions>
    : never

export type BreadcrumbsItemComponentProps<As extends keyof NativeElements | Component = 'a'> =
  BreadcrumbsItemOptions & { as?: As } & /* @vue-ignore */ Omit<
      ElementProps<NoInfer<As>>,
      keyof BreadcrumbsItemOptions
    >

export interface BreadcrumbsItemInstance {
  element: HTMLElement | SVGElement | null
}

/** @deprecated Use BreadcrumbsProps instead. */
export type BreadcrumbProps = BreadcrumbsProps
/** @deprecated Use BreadcrumbsItemProps instead. */
export type BreadcrumbItemProps<As extends keyof NativeElements | Component = 'a'> =
  BreadcrumbsItemProps<As>
