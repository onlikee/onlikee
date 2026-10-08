import TextInputRoot from './TextInput.vue'
import TextInputAction from './TextInputAction.vue'
export const TextInput = Object.assign(TextInputRoot, { Action: TextInputAction })
export { TextInputAction }
export type {
  TextInputProps,
  TextInputOptions,
  TextInputEmits,
  TextInputActionProps,
} from './types'
