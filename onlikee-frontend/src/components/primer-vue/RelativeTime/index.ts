import RelativeTimeComponent from './RelativeTime.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { RelativeTimeProps } from './types'

export const RelativeTime = RelativeTimeComponent as unknown as {
  new (): Omit<InstanceType<typeof RelativeTimeComponent>, '$props'> & {
    $props: RelativeTimeProps & AllowedComponentProps & VNodeProps
  }
}
export default RelativeTime
export type { RelativeTimeOptions, RelativeTimeProps, RelativeTimeInstance } from './types'
