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

export type RadioProps = RadioOptions & Omit<InputHTMLAttributes, keyof RadioOptions>

export interface RadioEmits {
  'update:checked': [checked: boolean]
  change: [event: Event]
}
