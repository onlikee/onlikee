import type { SelectHTMLAttributes } from 'vue'
export interface SelectOptions {
  value?: string | number | readonly string[]
  defaultValue?: string | number | readonly string[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  block?: boolean
  size?: 'small' | 'medium' | 'large'
  validationStatus?: 'error' | 'success'
  monospace?: boolean
  hasTrailingAction?: boolean
  isInputFocused?: boolean
  className?: string
  width?: string | number
  minWidth?: string | number
  maxWidth?: string | number
}
export type SelectProps = SelectOptions &
  Omit<SelectHTMLAttributes, keyof SelectOptions | 'multiple'>
export interface SelectEmits {
  'update:value': [value: string]
  change: [event: Event]
  input: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}
