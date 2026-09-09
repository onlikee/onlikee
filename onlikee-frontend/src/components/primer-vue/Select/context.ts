import { inject, provide, type InjectionKey } from 'vue'

export interface SelectOptionData {
  value: string
  label: string
}

export interface SelectContext {
  registerOption: (id: symbol, option: SelectOptionData) => void
  updateOption: (id: symbol, option: SelectOptionData) => void
  unregisterOption: (id: symbol) => void
}

const selectContextKey: InjectionKey<SelectContext> = Symbol('SelectContext')

export function provideSelectContext(context: SelectContext) {
  provide(selectContextKey, context)
}

export function useSelectContext() {
  return inject(selectContextKey, null)
}
