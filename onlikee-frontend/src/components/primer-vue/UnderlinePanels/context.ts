import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export interface UnderlinePanelsContext {
  id: ComputedRef<string>
  selectedValue: ComputedRef<string>
  focusedValue: Ref<string | undefined>
  activationMode: ComputedRef<'automatic' | 'manual'>
  loadingCounters: ComputedRef<boolean>
  selectTab: (value: string) => void
  focusTab: (value: string) => void
}

export const underlinePanelsKey: InjectionKey<UnderlinePanelsContext> = Symbol('UnderlinePanels')

export function useUnderlinePanels() {
  const context = inject(underlinePanelsKey)
  if (!context) throw new Error('UnderlinePanels.Tab and UnderlinePanels.Panel must be inside UnderlinePanels')
  return context
}
