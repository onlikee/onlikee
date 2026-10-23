import StackRoot from './Stack.vue'
import StackItemRoot from './StackItem.vue'
import type { AllowedComponentProps, Component, NativeElements, VNodeProps } from 'vue'
import type { StackComponentProps, StackItemComponentProps } from './types'

export const StackItem = StackItemRoot as <As extends keyof NativeElements | Component = 'div'>(
  props: StackItemComponentProps<As> & VNodeProps & AllowedComponentProps,
) => ReturnType<typeof StackItemRoot<As>>
const StackComponent = StackRoot as <As extends keyof NativeElements | Component = 'div'>(
  props: StackComponentProps<As> & VNodeProps & AllowedComponentProps,
) => ReturnType<typeof StackRoot<As>>
export const Stack = Object.assign(StackComponent, { Item: StackItem })
export type {
  StackProps,
  StackItemProps,
  ResponsiveValue,
  StackResponsive,
  StackSpacing,
  StackDirection,
  StackAlign,
  StackJustify,
  StackWrap,
  StackInstance,
} from './types'
