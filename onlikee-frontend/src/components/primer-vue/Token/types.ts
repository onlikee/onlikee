import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  Component,
  NativeElements,
  VNodeChild,
} from 'vue'
import type { TokenSizeKeys } from './constants'
export type { TokenSizeKeys } from './constants'

export interface TokenBaseProps extends Omit<AnchorHTMLAttributes & ButtonHTMLAttributes, 'id'> {
  as?: 'button' | 'a' | 'span'
  text: VNodeChild
  id?: number | string
  size?: TokenSizeKeys
  disabled?: boolean
  hideRemoveButton?: boolean
  isSelected?: boolean
  href?: string
  className?: string
  onRemove?: () => void
  tabIndex?: number
  onResize?: (event: UIEvent) => void
  onResizeCapture?: (event: UIEvent) => void
}

export interface TokenProps extends TokenBaseProps {
  leadingVisual?: keyof NativeElements | Component
}

export interface IssueLabelTokenProps extends TokenBaseProps {
  fillColor?: string
}

export interface TokenInstance {
  element: HTMLSpanElement | HTMLAnchorElement | HTMLButtonElement | null
  focus: (options?: FocusOptions) => void
  blur: () => void
}
