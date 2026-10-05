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
// 源 RadioGroup/index.ts:1 `export {default}`、:2 `export {RadioGroupContext}`——
// Vue 以 useRadioGroupContext 作为等价的 context 访问器（审计偏差 14）。
export { useRadioGroupContext, provideRadioGroupContext } from './context'
export type { RadioGroupContextValue } from './context'
export type {
  RadioGroupProps,
  RadioGroupEmits,
  RadioGroupLabelProps,
  RadioGroupValidationProps
} from './types'
export default RadioGroup
