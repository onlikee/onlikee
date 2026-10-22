import PopoverRoot from './Popover.vue'
import PopoverContentRoot from './PopoverContent.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { PopoverProps, PopoverContentProps, PopoverInstance } from './types'

type PopoverComponent = {
  new (): Omit<InstanceType<typeof PopoverRoot>, '$props'> &
    PopoverInstance & {
      $props: PopoverProps & AllowedComponentProps & VNodeProps
    }
}

type PopoverContentComponent = {
  new (): Omit<InstanceType<typeof PopoverContentRoot>, '$props'> & {
    $props: PopoverContentProps & AllowedComponentProps & VNodeProps
  }
}

export const PopoverContent = PopoverContentRoot as unknown as PopoverContentComponent
export const Popover = Object.assign(PopoverRoot as unknown as PopoverComponent, {
  Content: PopoverContent,
})
export type { PopoverProps, PopoverContentProps, PopoverInstance } from './types'
export default Popover
