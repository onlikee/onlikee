import type { InjectionKey } from 'vue'
export interface TooltipContextValue {
  tooltipId?: string
}
export const TOOLTIP_CONTEXT_KEY: InjectionKey<TooltipContextValue> = Symbol('TooltipContextV1')
