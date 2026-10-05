import type { HTMLAttributes } from 'vue'
import type { NodeProp } from '../internal/renderNode'

export type TokenSizeKeys = 'small' | 'medium' | 'large' | 'xlarge'

/* 源 Token/TokenBase.tsx TokenBaseProps（Vue 类型面镜像；React 侧
   Omit<HTMLProps<...>, 'size' | 'id'> 的其余 HTML 属性在 Vue 中经 attrs 透传）。 */
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

/* 源 Token/Token.tsx TokenProps = TokenBaseProps + leadingVisual */
export interface TokenProps extends TokenBaseProps {
  leadingVisual?: NodeProp
}

/* 源 Token/IssueLabelToken.tsx IssueLabelTokenProps = TokenBaseProps + fillColor */
export interface IssueLabelTokenProps extends TokenBaseProps {
  fillColor?: string
}

export const tokenSizes: Record<TokenSizeKeys, string> = {
  small: '16px', medium: '20px', large: '24px', xlarge: '32px'
}
export const defaultTokenSize: TokenSizeKeys = 'medium'
