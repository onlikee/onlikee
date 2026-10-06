import { computed, inject, provide, toValue, type ComputedRef, type InjectionKey, type MaybeRefOrGetter, type Ref } from 'vue'

export type FormControlValidationVariant = 'success' | 'error'

export interface FormControlContextValue {
  required: Readonly<Ref<boolean | undefined>>
  id: Readonly<Ref<string>>
  disabled: Readonly<Ref<boolean | undefined>>
  captionId: Readonly<Ref<string | undefined>>
  validationMessageId: Readonly<Ref<string | undefined>>
  labelId: Readonly<Ref<string | undefined>>
  isReferenced: Readonly<Ref<boolean>>
}
export interface FormControlForwardedProps {
  id?: string
  disabled?: boolean
  required?: boolean
  'aria-describedby'?: string
}
const formControlContextKey: InjectionKey<FormControlContextValue> = Symbol('FormControlContext')
export function provideFormControlContext(context: FormControlContextValue) {
  provide(formControlContextKey, context)
}

export function useFormControlContext() {
  return inject(formControlContextKey, null)
}

export function useFormControlForwardedProps<P extends object = FormControlForwardedProps>(
  externalProps: MaybeRefOrGetter<P> = {} as P
): ComputedRef<P & FormControlForwardedProps> {
  const context = useFormControlContext()
  return computed(() => {
    const external = toValue(externalProps)
    if (!context) return external
    return {
      disabled: context.disabled.value,
      id: context.id.value,
      required: context.required.value,
      'aria-describedby': [context.validationMessageId.value, context.captionId.value].filter(Boolean).join(' ') || undefined,
      ...external
    }
  })
}
