import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'

export type FormControlValidationVariant = 'success' | 'error'

export interface FormControlContextValue {
  validationVariant: Ref<FormControlValidationVariant | null>
  required: Ref<boolean>
}

const formControlContextKey: InjectionKey<FormControlContextValue> = Symbol('FormControlContext')

export function createFormControlContext(required: Ref<boolean>): FormControlContextValue {
  return {
    validationVariant: ref<FormControlValidationVariant | null>(null),
    required
  }
}

export function provideFormControlContext(context: FormControlContextValue) {
  provide(formControlContextKey, context)
}

export function useFormControlContext() {
  return inject(formControlContextKey, null)
}
