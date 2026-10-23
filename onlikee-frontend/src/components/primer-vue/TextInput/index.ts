import TextInputRoot from './TextInput.vue'
import TextInputActionRoot from './TextInputAction.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { TextInputProps, TextInputActionProps } from './types'

const Root = TextInputRoot as unknown as {
  new (): Omit<InstanceType<typeof TextInputRoot>, '$props'> & {
    $props: TextInputProps & AllowedComponentProps & VNodeProps
  }
}
export const TextInputAction = TextInputActionRoot as unknown as {
  new (): Omit<InstanceType<typeof TextInputActionRoot>, '$props'> & {
    $props: TextInputActionProps & AllowedComponentProps & VNodeProps
  }
}
export const TextInput = Object.assign(Root, { Action: TextInputAction })
export type {
  TextInputProps,
  TextInputOptions,
  TextInputEmits,
  TextInputActionProps,
} from './types'
