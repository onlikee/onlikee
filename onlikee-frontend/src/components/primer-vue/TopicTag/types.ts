import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  Component,
  ComponentPublicInstance,
  FunctionalComponent,
  HTMLAttributes,
  NativeElements,
} from 'vue'

type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}

type ElementProps<As> = As extends keyof NativeElements
  ? RemoveIndexSignature<NativeElements[As]> &
      (As extends 'button'
        ? Partial<Record<Exclude<keyof AnchorHTMLAttributes, keyof ButtonHTMLAttributes>, never>>
        : unknown)
  : As extends new (...args: never[]) => { $props: infer Props }
    ? Props
    : As extends FunctionalComponent<infer Props>
      ? Props
      : object

export type TopicTagProps<As extends keyof NativeElements | Component = 'a'> = As extends unknown
  ? { as?: As; className?: string } & Omit<ElementProps<As>, 'as' | 'className'>
  : never

export type TopicTagElement<As extends keyof NativeElements | Component = 'a'> =
  As extends keyof HTMLElementTagNameMap
    ? HTMLElementTagNameMap[As]
    : As extends keyof SVGElementTagNameMap
      ? SVGElementTagNameMap[As]
      : As extends new (...args: never[]) => infer Instance
        ? Instance
        : ComponentPublicInstance

export interface TopicTagInstance<As extends keyof NativeElements | Component = 'a'> {
  element: TopicTagElement<As> | null
}

export type TopicTagGroupProps = { className?: string } & RemoveIndexSignature<HTMLAttributes>

export interface TopicTagGroupInstance {
  element: HTMLDivElement | null
}

// Native/custom attributes remain in the public type and are forwarded through $attrs.
export type TopicTagComponentProps<As extends keyof NativeElements | Component = 'a'> = {
  as?: As
  className?: string
} & /* @vue-ignore */ Omit<ElementProps<NoInfer<As>>, 'as' | 'className'>

export type TopicTagGroupComponentProps = {
  className?: string
} & /* @vue-ignore */ Omit<TopicTagGroupProps, 'className'>
