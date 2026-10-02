export interface RadioGroupProps {
  name: string
  disabled?: boolean
  required?: boolean
  id?: string
  className?: string
  'aria-labelledby'?: string
}
export interface RadioGroupLabelProps {
  className?: string
  visuallyHidden?: boolean
}
export interface RadioGroupValidationProps {
  variant: 'success' | 'error'
}
export interface RadioGroupEmits {
  change: [value: string | null, event: Event]
}
