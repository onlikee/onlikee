import FormControlRoot from './FormControl.vue'
import FormControlLabel from './FormControlLabel.vue'
import FormControlValidation from './FormControlValidation.vue'
import FormControlCaption from './FormControlCaption.vue'

export const FormControl = Object.assign(FormControlRoot, {
  Label: FormControlLabel,
  Validation: FormControlValidation,
  Caption: FormControlCaption
})

export {
  FormControlLabel,
  FormControlValidation,
  FormControlCaption
}
