import type { HTMLAttributes } from 'vue'
import type { AvatarProps } from '../Avatar'

export interface SkeletonAvatarOptions {
  className?: string
  size?: AvatarProps['size']
  square?: AvatarProps['square']
}

export type SkeletonAvatarProps = SkeletonAvatarOptions & HTMLAttributes
