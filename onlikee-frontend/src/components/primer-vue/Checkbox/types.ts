import type { InputHTMLAttributes } from 'vue'
export interface CheckboxOptions {
  checked?: boolean
  defaultChecked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  required?: boolean
  validationStatus?: 'error' | 'success'
  value?: string
  className?: string
}
type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}
export type CheckboxProps = CheckboxOptions &
  Omit<RemoveIndexSignature<InputHTMLAttributes>, keyof CheckboxOptions>
export interface CheckboxInstance {
  element: HTMLInputElement | null
  input: HTMLInputElement | null
  focus: (options?: FocusOptions) => void
  blur: () => void
}
export interface CheckboxEmits {
  change: [event: Event]
  'update:checked': [checked: boolean]
}
