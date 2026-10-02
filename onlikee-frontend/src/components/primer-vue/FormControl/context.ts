import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'

export type FormControlValidationVariant = 'success' | 'error'

export interface FormControlContextValue {
  validationVariant: Ref<FormControlValidationVariant | null>
  required: Ref<boolean>
  id: Readonly<Ref<string>>
  disabled: Readonly<Ref<boolean>>
  controlId: Ref<string | undefined>
  captionId: Ref<string | undefined>
  labelId: Ref<string | undefined>
  choice: Ref<boolean>
}

const formControlContextKey: InjectionKey<FormControlContextValue> = Symbol('FormControlContext')

export function createFormControlContext(
  required: Ref<boolean>,
  id: Readonly<Ref<string>>,
  disabled: Readonly<Ref<boolean>>
): FormControlContextValue {
  return {
    validationVariant: ref<FormControlValidationVariant | null>(null),
    required,
    id,
    disabled,
    controlId: ref(),
    captionId: ref(),
    labelId: ref(),
    choice: ref(false)
  }
}

export function provideFormControlContext(context: FormControlContextValue) {
  provide(formControlContextKey, context)
}

export function useFormControlContext() {
  return inject(formControlContextKey, null)
}
