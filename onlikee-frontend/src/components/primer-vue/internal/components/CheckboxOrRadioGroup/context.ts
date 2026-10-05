import { inject, provide, type InjectionKey, type Ref } from 'vue'
export interface ChoiceGroupContextValue {
  disabled: Readonly<Ref<boolean>>
  required: Readonly<Ref<boolean>>
  captionId: Readonly<Ref<string | undefined>>
  validationMessageId: Readonly<Ref<string | undefined>>
  parentName: Readonly<Ref<string | undefined>>
}
const choiceGroupKey: InjectionKey<ChoiceGroupContextValue> = Symbol('CheckboxOrRadioGroup')
export function provideChoiceGroupContext(value: ChoiceGroupContextValue) { provide(choiceGroupKey, value) }
export function useChoiceGroupContext() { return inject(choiceGroupKey, null) }
