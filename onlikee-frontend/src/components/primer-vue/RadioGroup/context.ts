import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface RadioGroupContextValue {
  name: Readonly<Ref<string>>
  disabled: Readonly<Ref<boolean>>
  required: Readonly<Ref<boolean>>
  captionId: Ref<string | undefined>
  validationMessageId: Ref<string | undefined>
  onChange: (event: Event) => void
}

const radioGroupKey: InjectionKey<RadioGroupContextValue> = Symbol('RadioGroup')

export function provideRadioGroupContext(context: RadioGroupContextValue) {
  provide(radioGroupKey, context)
}

export function useRadioGroupContext() {
  return inject(radioGroupKey, null)
}
