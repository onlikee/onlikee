import type { InputHTMLAttributes } from 'vue'
export interface CheckboxProps extends Omit<InputHTMLAttributes, 'checked' | 'value'> {
  checked?: boolean
  defaultChecked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  required?: boolean
  validationStatus?: 'error' | 'success'
  value?: string
  className?: string
}
export interface CheckboxEmits { change: [event: Event]; 'update:checked': [checked: boolean] }
