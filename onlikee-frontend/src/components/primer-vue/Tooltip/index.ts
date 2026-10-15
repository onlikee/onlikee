import TooltipComponent from './Tooltip.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { TooltipProps } from './types'

export const Tooltip = TooltipComponent as unknown as {
  new (): Omit<InstanceType<typeof TooltipComponent>, '$props'> & {
    $props: TooltipProps & VNodeProps & AllowedComponentProps
  }
  __SLOT__: symbol
}
export type { TooltipProps, TooltipDirection } from './types'
