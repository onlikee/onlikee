import { inject, type ComputedRef, type InjectionKey, type Ref } from 'vue'

export interface TabsContext {
  groupId: ComputedRef<string>
  selectedValue: ComputedRef<string | undefined>
  activationMode: ComputedRef<'automatic' | 'manual'>
  focusedValue: Ref<string | undefined>
  selectTab: (value: string) => void
  focusTab: (value: string) => void
}

export const tabsKey: InjectionKey<TabsContext> = Symbol('Tabs')

export function useTabs() {
  const context = inject(tabsKey)
  if (!context) throw new Error('Component must be used within a <Tabs> component')
  return context
}
