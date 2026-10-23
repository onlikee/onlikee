import TextRoot from './Text.vue'
import type { AllowedComponentProps, Component, NativeElements, VNodeProps } from 'vue'
import type { TextComponentProps } from './types'

export const Text = TextRoot as <As extends keyof NativeElements | Component = 'span'>(
  props: TextComponentProps<As> & VNodeProps & AllowedComponentProps,
) => ReturnType<typeof TextRoot<As>>
export default Text
export type {
  TextOptions,
  TextProps,
  TextSize,
  TextWeight,
  TextWhiteSpace,
  TextElement,
  TextInstance,
} from './types'
