import FormControlRoot from './FormControl.vue'
import FormControlLabelRoot from './FormControlLabel.vue'
import FormControlValidation from './FormControlValidation.vue'
import FormControlCaption from './FormControlCaption.vue'
import FormControlLeadingVisual from './FormControlLeadingVisual.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { FormControlLabelProps } from './types'

type FormControlLabelComponent = {
  __SLOT__: symbol
  new (): Omit<InstanceType<typeof FormControlLabelRoot>, '$props'> & {
    $props: FormControlLabelProps & AllowedComponentProps & VNodeProps
  }
}

export const FormControlLabel = FormControlLabelRoot as unknown as FormControlLabelComponent

export const FormControl = Object.assign(FormControlRoot, {
  Label: FormControlLabel,
  Validation: FormControlValidation,
  Caption: FormControlCaption,
  LeadingVisual: FormControlLeadingVisual,
})

export { FormControlValidation, FormControlCaption, FormControlLeadingVisual }
export { useFormControlForwardedProps } from './context'
export type {
  FormControlProps,
  FormControlLabelProps,
  FormControlValidationProps,
  FormControlCaptionProps,
} from './types'
export type { FormControlForwardedProps } from './context'
export default FormControl
