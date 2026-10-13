import { inject, provide, type InjectionKey, type Ref } from 'vue'
export interface CheckboxGroupContextValue {
  disabled?: Readonly<Ref<boolean | undefined>>
  renderVersion?: Readonly<Ref<number>>
  onChange?: (event: Event) => void
}
const key: InjectionKey<CheckboxGroupContextValue> = Symbol('CheckboxGroup')
export function provideCheckboxGroupContext(value: CheckboxGroupContextValue) {
  provide(key, value)
}
export function useCheckboxGroupContext() {
  return inject(key, null)
}
