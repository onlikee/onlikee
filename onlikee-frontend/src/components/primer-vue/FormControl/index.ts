import FormControlRoot from './FormControl.vue'
import FormControlLabel from './FormControlLabel.vue'
import FormControlValidation from './FormControlValidation.vue'
import FormControlCaption from './FormControlCaption.vue'
import FormControlLeadingVisual from './FormControlLeadingVisual.vue'

export const FormControl = Object.assign(FormControlRoot, {
  Label: FormControlLabel,
  Validation: FormControlValidation,
  Caption: FormControlCaption,
  LeadingVisual: FormControlLeadingVisual,
})

export { FormControlLabel, FormControlValidation, FormControlCaption, FormControlLeadingVisual }
export { useFormControlForwardedProps } from './context'
export type {
  FormControlProps,
  FormControlLabelProps,
  FormControlValidationProps,
  FormControlCaptionProps,
} from './types'
export type { FormControlForwardedProps } from './context'
export default FormControl
