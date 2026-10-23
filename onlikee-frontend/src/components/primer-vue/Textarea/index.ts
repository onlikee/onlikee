import TextareaRoot from './Textarea.vue'
import type { AllowedComponentProps, VNodeProps } from 'vue'
import type { TextareaProps } from './types'

export const Textarea = TextareaRoot as unknown as {
  new (): Omit<InstanceType<typeof TextareaRoot>, '$props'> & {
    $props: TextareaProps & AllowedComponentProps & VNodeProps
  }
}
export type { TextareaProps, TextareaOptions, TextareaEmits } from './types'
export const DEFAULT_TEXTAREA_ROWS = 7
export const DEFAULT_TEXTAREA_COLS = 30
export const DEFAULT_TEXTAREA_RESIZE = 'both'
