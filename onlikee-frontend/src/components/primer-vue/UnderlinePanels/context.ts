import type { ComputedRef, InjectionKey } from 'vue'

export interface UnderlinePanelsContext {
  loadingCounters: ComputedRef<boolean | undefined>
}
export const underlinePanelsKey: InjectionKey<UnderlinePanelsContext> = Symbol('UnderlinePanels')
