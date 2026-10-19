import LabelComponent from './Label.vue'
import type { AllowedComponentProps, Component, NativeElements, VNodeProps } from 'vue'
import type { LabelComponentProps } from './types'

export const Label = LabelComponent as <As extends keyof NativeElements | Component = 'span'>(
  props: LabelComponentProps<As> & VNodeProps & AllowedComponentProps,
) => ReturnType<typeof LabelComponent<As>>
export default Label
export type {
  LabelProps,
  LabelOptions,
  LabelColorOptions,
  LabelSizeKeys,
  LabelInstance,
} from './types'
