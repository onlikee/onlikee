import type { Component, ComponentPublicInstance, FunctionalComponent, NativeElements } from 'vue'

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

export type BranchNameProps<As extends keyof NativeElements | Component = 'a'> = As extends unknown
  ? { as?: As; className?: string } & Omit<ElementProps<As>, 'as' | 'className'>
  : never

export type BranchNameElement<As extends keyof NativeElements | Component = 'a'> =
  As extends keyof HTMLElementTagNameMap
    ? HTMLElementTagNameMap[As]
    : As extends keyof SVGElementTagNameMap
      ? SVGElementTagNameMap[As]
      : As extends new (...args: never[]) => infer Instance
        ? Instance
        : ComponentPublicInstance

export interface BranchNameInstance<As extends keyof NativeElements | Component = 'a'> {
  element: BranchNameElement<As> | null
}

// Native/custom attributes remain in the public type and are forwarded through $attrs.
export type BranchNameComponentProps<As extends keyof NativeElements | Component = 'a'> = {
  as?: As
  className?: string
} & /* @vue-ignore */ Omit<ElementProps<NoInfer<As>>, 'as' | 'className'>
