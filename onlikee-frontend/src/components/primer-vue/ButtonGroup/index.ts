import ButtonGroupComponent from './ButtonGroup.vue'
import type { AllowedComponentProps, Component, NativeElements, VNodeProps } from 'vue'
import type { ButtonGroupComponentProps } from './types'

export const ButtonGroup = ButtonGroupComponent as <
  As extends keyof NativeElements | Component = 'div',
>(
  props: ButtonGroupComponentProps<As> & VNodeProps & AllowedComponentProps,
) => ReturnType<typeof ButtonGroupComponent<As>>
export default ButtonGroup
export type { ButtonGroupProps, ButtonGroupInstance } from './types'
