import type { Component, FunctionalComponent, HTMLAttributes, NativeElements } from 'vue'
import type { IconProps } from '@onlikee/octicons-vue'

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

export interface CircleBadgeOptions {
  inline?: boolean
  variant?: 'small' | 'medium' | 'large'
  size?: number
  as?: keyof NativeElements | Component
  className?: string
}
export type CircleBadgeProps<As extends keyof NativeElements | Component = 'div'> = Omit<
  CircleBadgeOptions,
  'as'
> & { as?: As } & Omit<ElementProps<As>, keyof CircleBadgeOptions>

export type CircleBadgeComponentProps<As extends keyof NativeElements | Component = 'div'> = Omit<
  CircleBadgeOptions,
  'as'
> & { as?: As } & /* @vue-ignore */ Omit<ElementProps<NoInfer<As>>, keyof CircleBadgeOptions>

export interface CircleBadgeIconOptions {
  icon: Component | string
  as?: Component | string
  className?: string
}
export type CircleBadgeIconProps = CircleBadgeIconOptions & RemoveIndexSignature<IconProps>
export type CircleBadgeIconComponentProps = CircleBadgeIconOptions & /* @vue-ignore */ IconProps

export interface CircleBadgeInstance {
  element: HTMLElement | SVGElement | null
}
