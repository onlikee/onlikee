import BlankslateRoot from './Blankslate.vue'
import BlankslateVisual from './BlankslateVisual.vue'
import BlankslateHeading from './BlankslateHeading.vue'
import BlankslateDescription from './BlankslateDescription.vue'
import BlankslatePrimaryAction from './BlankslatePrimaryAction.vue'
import BlankslateSecondaryAction from './BlankslateSecondaryAction.vue'

export const Blankslate = Object.assign(BlankslateRoot, {
  Visual: BlankslateVisual,
  Heading: BlankslateHeading,
  Description: BlankslateDescription,
  PrimaryAction: BlankslatePrimaryAction,
  SecondaryAction: BlankslateSecondaryAction
})

export {
  BlankslateVisual,
  BlankslateHeading,
  BlankslateDescription,
  BlankslatePrimaryAction,
  BlankslateSecondaryAction
}
