import Root from './CheckboxGroup.vue'
import Label from '../RadioGroup/RadioGroupLabel.vue'
import Caption from '../RadioGroup/RadioGroupCaption.vue'
import Validation from '../RadioGroup/RadioGroupValidation.vue'
export const CheckboxGroup = Object.assign(Root, { Label, Caption, Validation })
export { Label as CheckboxGroupLabel, Caption as CheckboxGroupCaption, Validation as CheckboxGroupValidation }
export type { CheckboxGroupProps, CheckboxGroupEmits } from './types'
export { useCheckboxGroupContext } from './context'
export default CheckboxGroup
