import SkeletonBoxComponent from './SkeletonBox.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { SkeletonBoxProps } from './types'

export const SkeletonBox = SkeletonBoxComponent as unknown as {
  new (): Omit<InstanceType<typeof SkeletonBoxComponent>, '$props'> & {
    $props: SkeletonBoxProps & AllowedComponentProps & VNodeProps
  }
}
export default SkeletonBox
export type { SkeletonBoxProps, SkeletonBoxOptions } from './types'
