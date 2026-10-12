import BlankslateRoot from './Blankslate.vue'
import BlankslateVisual from './BlankslateVisual.vue'
import BlankslateHeading from './BlankslateHeading.vue'
import BlankslateDescription from './BlankslateDescription.vue'
import BlankslatePrimaryAction from './BlankslatePrimaryAction.vue'
import BlankslateSecondaryAction from './BlankslateSecondaryAction.vue'
import type { VNodeProps } from 'vue'
import type { BlankslatePrimaryActionProps, BlankslateSecondaryActionProps } from './types'

type ComponentWithProps<Sfc extends abstract new (...args: never[]) => object, Props> = {
  new (): Omit<InstanceType<Sfc>, '$props'> & { $props: Props & VNodeProps }
}
const PrimaryAction = BlankslatePrimaryAction as unknown as ComponentWithProps<
  typeof BlankslatePrimaryAction,
  BlankslatePrimaryActionProps
>
const SecondaryAction = BlankslateSecondaryAction as unknown as ComponentWithProps<
  typeof BlankslateSecondaryAction,
  BlankslateSecondaryActionProps
>
export const Blankslate = Object.assign(BlankslateRoot, {
  Visual: BlankslateVisual,
  Heading: BlankslateHeading,
  Description: BlankslateDescription,
  PrimaryAction,
  SecondaryAction,
})
export type {
  BlankslateProps,
  BlankslateVisualProps,
  BlankslateHeadingProps,
  BlankslateDescriptionProps,
  BlankslatePrimaryActionProps,
  BlankslateSecondaryActionProps,
} from './types'
