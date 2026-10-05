import type { Component, CSSProperties, InputHTMLAttributes } from 'vue'
import type { NodeProp } from '../internal/renderNode'
import type Token from '../Token/Token.vue'
import type { TokenProps, TokenSizeKeys } from '../Token'

export type TokenComponentProps<T extends Component> = T extends new (...args: never[]) => { $props: infer Props }
  ? Props : T extends (props: infer Props, ...args: never[]) => unknown ? Props : TokenProps

export interface TokenData {
  id?: string | number
  text?: NodeProp
}

export interface TextInputWithTokensProps<T extends Component = typeof Token> extends Omit<InputHTMLAttributes, 'size' | 'value' | 'onInput'> {
  tokens: TokenComponentProps<T>[]
  tokenComponent?: T
  onTokenRemove?: (tokenId: string | number) => void
  maxHeight?: CSSProperties['maxHeight']
  preventTokenWrapping?: boolean
  size?: TokenSizeKeys
  hideTokenRemoveButtons?: boolean
  visibleTokenCount?: number
  value?: string | number
  defaultValue?: string | number
  disabled?: boolean
  required?: boolean
  leadingVisual?: NodeProp
  trailingVisual?: NodeProp
  trailingAction?: NodeProp
  characterLimit?: number
  icon?: Component
  loading?: boolean
  loaderPosition?: 'auto' | 'leading' | 'trailing'
  loaderText?: string
  contrast?: boolean
  block?: boolean
  monospace?: boolean
  width?: CSSProperties['width']
  minWidth?: CSSProperties['minWidth']
  maxWidth?: CSSProperties['maxWidth']
  validationStatus?: 'error' | 'success'
  variant?: 'small' | 'medium' | 'large'
  className?: string
}
