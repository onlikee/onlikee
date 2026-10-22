export interface RadioGroupOptions {
  name: string
  disabled?: boolean
  required?: boolean
  id?: string
  className?: string
  ariaLabelledby?: string
  dataComponent?: string
}
export type RadioGroupProps = Omit<RadioGroupOptions, 'ariaLabelledby' | 'dataComponent'> & {
  'aria-labelledby'?: string
  'data-component'?: string
  onChange?: (selected: string | null, event?: Event) => void
}
export interface RadioGroupLabelProps {
  className?: string
  visuallyHidden?: boolean
}
export interface RadioGroupValidationProps {
  variant: 'success' | 'error'
}
export interface RadioGroupCaptionProps {
  className?: string
}
export interface RadioGroupEmits {
  change: [value: string | null, event: Event]
}
