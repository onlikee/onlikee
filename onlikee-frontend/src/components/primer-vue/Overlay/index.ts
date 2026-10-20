import OverlayComponent from './Overlay.vue'
import type { AllowedComponentProps, Component, NativeElements, VNodeProps } from 'vue'
import type { OverlayProps } from './types'

export const Overlay = OverlayComponent as <As extends keyof NativeElements | Component = 'div'>(
  props: OverlayProps<As> & VNodeProps & AllowedComponentProps,
) => ReturnType<typeof OverlayComponent<As>>
export default Overlay
export type {
  OverlayProps,
  OverlayInstance,
  OverlayWidth,
  OverlayHeight,
  TouchOrMouseEvent,
} from './types'
