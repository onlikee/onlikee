import HeadingComponent from './Heading.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { HeadingProps } from './types'

export const Heading = HeadingComponent as unknown as {
  new (): Omit<InstanceType<typeof HeadingComponent>, '$props'> & {
    $props: HeadingProps & AllowedComponentProps & VNodeProps
  }
}
export default Heading
export type { HeadingLevels, HeadingOptions, HeadingProps } from './types'
