import ScrollableRegionComponent from './ScrollableRegion.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { ScrollableRegionProps } from './types'

export const ScrollableRegion = ScrollableRegionComponent as unknown as {
  new (): Omit<InstanceType<typeof ScrollableRegionComponent>, '$props'> & {
    $props: ScrollableRegionProps & AllowedComponentProps & VNodeProps
  }
}
export default ScrollableRegion
export type { ScrollableRegionProps, ScrollableRegionInstance } from './types'
