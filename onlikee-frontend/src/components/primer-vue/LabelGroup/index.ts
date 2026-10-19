import LabelGroupComponent from './LabelGroup'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { LabelGroupProps } from './types'

export const LabelGroup = LabelGroupComponent as unknown as {
  new (): Omit<InstanceType<typeof LabelGroupComponent>, '$props'> & {
    $props: LabelGroupProps & Pick<AllowedComponentProps, 'class'> & VNodeProps
  }
}
export default LabelGroup
export type { LabelGroupOptions, LabelGroupProps } from './types'
