import type { InjectionKey } from 'vue'

// Primer React 8c0b708: TooltipV2/TooltipContext.ts 直译（createContext → InjectionKey）。
// 嵌套的 IconButton 借此检测外层是否已有 Tooltip（hasExternalTooltip，避免双重 tooltip）。
export interface TooltipContextValue {
  tooltipId?: string
}

export const TOOLTIP_CONTEXT_KEY: InjectionKey<TooltipContextValue> = Symbol('TooltipContext')
