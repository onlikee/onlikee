import SkeletonAvatarComponent from './SkeletonAvatar.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { SkeletonAvatarProps } from './types'

export const SkeletonAvatar = SkeletonAvatarComponent as unknown as {
  new (): Omit<InstanceType<typeof SkeletonAvatarComponent>, '$props'> & {
    $props: SkeletonAvatarProps & AllowedComponentProps & VNodeProps
  }
}
export type { SkeletonAvatarProps, SkeletonAvatarOptions } from './types'
