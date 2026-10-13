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
export interface CheckboxGroupLabelProps {
  className?: string
  visuallyHidden?: boolean
}
export interface CheckboxGroupCaptionProps {
  className?: string
}
export interface CheckboxGroupValidationProps {
  variant: 'success' | 'error'
}
