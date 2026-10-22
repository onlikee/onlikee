import RadioComponent from './Radio.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { RadioProps } from './types'

export const Radio = RadioComponent as unknown as {
  new (): Omit<InstanceType<typeof RadioComponent>, '$props'> & {
    $props: RadioProps &
      AllowedComponentProps &
      VNodeProps & {
        'onUpdate:checked'?: (checked: boolean) => void
      }
  }
}
export type { RadioProps, RadioEmits, RadioInstance } from './types'
export default Radio
