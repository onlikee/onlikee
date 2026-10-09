import type { StyleValue, TextareaHTMLAttributes } from 'vue'
import type { TextInputEmits } from '../TextInput/types'
export interface TextareaOptions {
  value?: string | number
  defaultValue?: string | number
  disabled?: boolean
  required?: boolean
  rows?: number | string
  cols?: number | string
  validationStatus?: 'error' | 'success'
  block?: boolean
  contrast?: boolean
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  autoSize?: boolean
  className?: string
  style?: StyleValue
  minHeight?: number
  maxHeight?: number
  characterLimit?: number
}
export type TextareaProps = TextareaOptions & Omit<TextareaHTMLAttributes, keyof TextareaOptions>
export type TextareaEmits = TextInputEmits
