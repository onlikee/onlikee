import type { HTMLAttributes } from 'vue'

interface CounterLabelOptions {
  /** @deprecated use variant instead */
  scheme?: 'primary' | 'secondary'
  variant?: 'primary' | 'secondary'
  className?: string
}

type NativeAttributes = {
  [Key in keyof HTMLAttributes as string extends Key ? never : Key]: HTMLAttributes[Key]
}

export type CounterLabelProps = CounterLabelOptions &
  NativeAttributes & {
    'data-component'?: string
  }

export interface CounterLabelInstance {
  element: HTMLSpanElement | null
}

// Native attributes remain in the public type and are forwarded through $attrs.
export type CounterLabelComponentProps = CounterLabelOptions &
  /* @vue-ignore */ Omit<CounterLabelProps, keyof CounterLabelOptions>
