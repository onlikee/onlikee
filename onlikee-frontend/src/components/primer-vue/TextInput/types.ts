import type { ButtonHTMLAttributes, StyleValue, InputHTMLAttributes } from 'vue'
import type { InputVisual } from '../internal/components/RenderVisual'

export interface TextInputOptions {
  value?: string | number | null
  defaultValue?: string | number
  disabled?: boolean
  required?: boolean
  type?: string
  icon?: InputVisual
  leadingVisual?: InputVisual
  trailingVisual?: InputVisual
  trailingAction?: InputVisual
  loading?: boolean
  loaderPosition?: 'auto' | 'leading' | 'trailing'
  loaderText?: string
  characterLimit?: number
  block?: boolean
  contrast?: boolean
  monospace?: boolean
  width?: string | number
  minWidth?: string | number
  maxWidth?: string | number
  variant?: 'small' | 'medium' | 'large'
  size?: 'small' | 'medium' | 'large'
  validationStatus?: 'error' | 'success'
  className?: string
  style?: StyleValue
}
export type TextInputProps = TextInputOptions & Omit<InputHTMLAttributes, keyof TextInputOptions>
export interface TextInputEmits {
  'update:value': [value: string]
  change: [event: Event]
  input: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  compositionstart: [event: CompositionEvent]
  compositionend: [event: CompositionEvent]
}
export interface TextInputActionOptions {
  icon?: InputVisual
  variant?: 'default' | 'primary' | 'invisible' | 'danger'
  tooltipDirection?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
  className?: string
}
export type TextInputActionProps = TextInputActionOptions &
  Omit<ButtonHTMLAttributes, keyof TextInputActionOptions>
