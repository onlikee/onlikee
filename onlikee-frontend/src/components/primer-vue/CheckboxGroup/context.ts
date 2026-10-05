import { inject, provide, type InjectionKey } from 'vue'
export interface CheckboxGroupContextValue { onChange: (event: Event) => void }
const key: InjectionKey<CheckboxGroupContextValue> = Symbol('CheckboxGroup')
export function provideCheckboxGroupContext(value: CheckboxGroupContextValue) { provide(key, value) }
export function useCheckboxGroupContext() { return inject(key, null) }
