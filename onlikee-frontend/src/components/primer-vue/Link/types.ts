import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  Component,
  FunctionalComponent,
  HTMLAttributes,
  NativeElements,
} from 'vue'

export interface LinkOptions {
  as?: keyof NativeElements | Component
  /** @deprecated Use CSS modules to style hover color. */
  hoverColor?: string
  muted?: boolean
  // Link inside a text block
  inline?: boolean
  className?: string
}

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
      : RemoveIndexSignature<HTMLAttributes>

export type LinkProps<As extends keyof NativeElements | Component = 'a'> = As extends unknown
  ? Omit<LinkOptions, 'as'> & { as?: As } & Omit<ElementProps<As>, keyof LinkOptions>
  : never

export interface LinkInstance {
  element: HTMLElement | SVGElement | null
}

// Keep native/component attributes in the public type while forwarding them through $attrs.
export type LinkComponentProps<As extends keyof NativeElements | Component = 'a'> = Omit<
  LinkOptions,
  'as'
> & {
  as?: As
} & /* @vue-ignore */ Omit<ElementProps<NoInfer<As>>, keyof LinkOptions>
