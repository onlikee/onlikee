import CheckboxRoot from './Checkbox.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { CheckboxProps } from './types'

type CheckboxComponent = {
  new (): Omit<InstanceType<typeof CheckboxRoot>, '$props'> & {
    $props: CheckboxProps &
      AllowedComponentProps &
      VNodeProps & {
        'onUpdate:checked'?: (checked: boolean) => unknown
      }
  }
}
export const Checkbox = CheckboxRoot as unknown as CheckboxComponent
export default Checkbox
export type { CheckboxProps, CheckboxEmits, CheckboxInstance } from './types'
