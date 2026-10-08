import type { SelectHTMLAttributes } from 'vue'
export interface SelectOptions {
  value?: string | number | null
  defaultValue?: string | number
  placeholder?: string
  disabled?: boolean
  required?: boolean
  block?: boolean
  size?: 'small' | 'medium' | 'large'
  validationStatus?: 'error' | 'success'
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
