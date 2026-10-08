export interface CheckboxGroupProps {
  id?: string
  disabled?: boolean
  required?: boolean
  className?: string
  'aria-labelledby'?: string
  'data-component'?: string
}
export interface CheckboxGroupEmits {
  change: [selected: string[], event?: Event]
}
