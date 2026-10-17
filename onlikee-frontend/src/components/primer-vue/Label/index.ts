import LabelComponent from './Label.vue'
import type {
  AllowedComponentProps,
  Component,
  HTMLAttributes,
  NativeElements,
  VNodeProps,
} from 'vue'
import type { LabelOptions, LabelProps } from './types'

type NativeLabelProps = {
  [As in keyof NativeElements]: LabelProps<As> & { as: As }
}[keyof NativeElements]
type LabelComponentProps =
  | (LabelProps & { as?: 'span' })
  | NativeLabelProps
  | (Omit<LabelOptions, 'as'> & { as: Component } & HTMLAttributes & Record<string, unknown>)

export const Label = LabelComponent as unknown as {
  new (): Omit<InstanceType<typeof LabelComponent>, '$props'> & {
    $props: LabelComponentProps & AllowedComponentProps & VNodeProps
  }
}
export default Label
export type { LabelProps, LabelOptions, LabelColorOptions, LabelSizeKeys } from './types'
