import type { Component, ComponentPublicInstance, FunctionalComponent, NativeElements } from 'vue'

export interface ButtonGroupProps {
  /** The role of the group. */
  role?: string
  /** Class name passed in for styling. */
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
      : object

export type ButtonGroupComponentProps<As extends keyof NativeElements | Component = 'div'> =
  ButtonGroupProps & { as?: As } & /* @vue-ignore */ Omit<
      ElementProps<NoInfer<As>>,
      keyof ButtonGroupProps | 'as'
    >

export interface ButtonGroupInstance {
  element: Element | ComponentPublicInstance | null
}
