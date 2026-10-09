import type { CSSProperties, StyleValue } from 'vue'
export interface FormControlProps {
  id?: string
  disabled?: boolean
  required?: boolean
  layout?: 'horizontal' | 'vertical'
  className?: string
  style?: CSSProperties
}
export type FormControlValidationProps = {
  variant: 'error' | 'success'
  id?: string
  className?: string
  style?: CSSProperties
}
export type FormControlCaptionProps = {
  id?: string
  className?: string
  style?: StyleValue
}
export interface FormControlLabelOptions {
  visuallyHidden?: boolean
  requiredText?: string
  requiredIndicator?: boolean
  disabled?: boolean
  required?: boolean
  id?: string
  className?: string
  style?: StyleValue
  as?: 'label' | 'legend' | 'span'
  htmlFor?: string
}
export type FormControlLabelProps = Omit<FormControlLabelOptions, 'as' | 'htmlFor'> &
  ({ as?: 'label'; htmlFor?: string } | { as: 'legend' | 'span'; htmlFor?: undefined })
