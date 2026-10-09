import type { HTMLAttributes } from 'vue'
import type { NodeProp } from '../internal/renderNode'

export type TokenSizeKeys = 'small' | 'medium' | 'large' | 'xlarge'

export interface TokenBaseProps extends Omit<HTMLAttributes, 'id'> {
  as?: 'button' | 'a' | 'span'
  text: NodeProp
  id?: number | string
  size?: TokenSizeKeys
  disabled?: boolean
  hideRemoveButton?: boolean
  isSelected?: boolean
  href?: string
  className?: string
  onRemove?: () => void
}

export interface TokenProps extends TokenBaseProps {
  leadingVisual?: NodeProp
}

export interface IssueLabelTokenProps extends TokenBaseProps {
  fillColor?: string
}

export const tokenSizes: Record<TokenSizeKeys, string> = {
  small: '16px',
  medium: '20px',
  large: '24px',
  xlarge: '32px',
}
export const defaultTokenSize: TokenSizeKeys = 'medium'
