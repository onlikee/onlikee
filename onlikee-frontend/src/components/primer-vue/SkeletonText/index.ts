import SkeletonTextComponent from './SkeletonText.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { SkeletonTextProps } from './types'

export const SkeletonText = SkeletonTextComponent as unknown as {
  new (): Omit<InstanceType<typeof SkeletonTextComponent>, '$props'> & {
    $props: SkeletonTextProps & AllowedComponentProps & VNodeProps
  }
}
export default SkeletonText
export type { SkeletonTextProps, SkeletonTextOptions, SkeletonTextSize } from './types'
