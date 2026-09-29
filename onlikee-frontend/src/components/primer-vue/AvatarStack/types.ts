import type { AvatarResponsiveSize } from '../Avatar'

export interface AvatarStackProps {
  alignRight?: boolean
  disableExpand?: boolean
  variant?: 'cascade' | 'stack'
  shape?: 'circle' | 'square'
  size?: number | AvatarResponsiveSize
}
