import type { InputHTMLAttributes } from 'vue'

/** Runtime props; native attributes are forwarded through $attrs. */
export interface RadioOptions {
  /** Unique option value, also used during native form submission. */
  value: string
  /** Use the same name for every radio in a group. */
  name?: string
  id?: string
  disabled?: boolean
  required?: boolean
  className?: string
  ariaHidden?: boolean | 'true' | 'false'
  checked?: boolean
  /** Initial selection in uncontrolled mode. */
  defaultChecked?: boolean
}

type NativeAttributes = {
  [Key in keyof InputHTMLAttributes as string extends Key ? never : Key]: InputHTMLAttributes[Key]
} & { [Name in `data-${string}`]?: string | number | boolean }

export type RadioProps = RadioOptions & Omit<NativeAttributes, keyof RadioOptions>

export interface RadioInstance {
  element: HTMLInputElement | null
  input: HTMLInputElement | null
  focus: (options?: FocusOptions) => void
  blur: () => void
}

export interface RadioEmits {
  'update:checked': [checked: boolean]
  change: [event: Event]
}
