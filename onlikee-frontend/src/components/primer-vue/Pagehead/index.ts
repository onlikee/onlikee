import PageheadComponent from './Pagehead.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { PageheadProps } from './types'

/** @deprecated */
export const Pagehead = PageheadComponent as unknown as {
  new (): Omit<InstanceType<typeof PageheadComponent>, '$props'> & {
    $props: PageheadProps & AllowedComponentProps & VNodeProps
  }
}
export default Pagehead
export type { PageheadOptions, PageheadProps } from './types'
