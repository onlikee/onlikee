import { expect, expectTypeOf, test } from 'vitest'
import type { ComputedRef } from 'vue'
import { useFormControlForwardedProps } from './context'
import type {
  FormControlForwardedProps,
  FormControlLabelProps,
  FormControlProps,
  FormControlValidationProps,
} from './index'

test('preserves layout, validation and label discriminants in the public types', () => {
  const props = { layout: 'horizontal', disabled: false, required: true } satisfies FormControlProps
  const label = { as: 'legend', visuallyHidden: true } satisfies FormControlLabelProps
  const validation = { variant: 'success' } satisfies FormControlValidationProps
  expectTypeOf(props.layout).toEqualTypeOf<'horizontal'>()
  expect(label.as).toBe('legend')
  expect(validation.variant).toBe('success')
  // @ts-expect-error Only labels support htmlFor.
  const invalidLabel: FormControlLabelProps = { as: 'span', htmlFor: 'field' }
  // @ts-expect-error A validation message requires an explicit status.
  const invalidValidation: FormControlValidationProps = { id: 'message' }
  // @ts-expect-error Layout is constrained to the source variants.
  const invalidLayout: FormControlProps = { layout: 'inline' }
  expect(invalidLabel.htmlFor).toBe('field')
  expect(invalidValidation.id).toBe('message')
  expect(invalidLayout.layout).toBe('inline')
})

test('forwarding retains external property types in a computed result', () => {
  const _defaultHook = () => useFormControlForwardedProps()
  expectTypeOf<ReturnType<typeof _defaultHook>['value']['id']>().toEqualTypeOf<string | undefined>()
  type External = { id: string; disabled: false; custom: number }
  type Forwarded = ReturnType<typeof useFormControlForwardedProps<External>>
  expectTypeOf<Forwarded>().toEqualTypeOf<ComputedRef<External & FormControlForwardedProps>>()
  expectTypeOf<Forwarded['value']['custom']>().toEqualTypeOf<number>()
  expectTypeOf<Forwarded['value']['disabled']>().toEqualTypeOf<false>()
  expectTypeOf<Forwarded['value']['aria-describedby']>().toEqualTypeOf<string | undefined>()
})
