import Root from './RadioGroup.vue'
import Label from './RadioGroupLabel.vue'
import Caption from './RadioGroupCaption.vue'
import Validation from './RadioGroupValidation.vue'
export const RadioGroup = Object.assign(Root, { Label, Caption, Validation })
export {
  Label as RadioGroupLabel,
  Caption as RadioGroupCaption,
  Validation as RadioGroupValidation
}
export type {
  RadioGroupProps,
  RadioGroupEmits,
  RadioGroupLabelProps,
  RadioGroupValidationProps
} from './types'
