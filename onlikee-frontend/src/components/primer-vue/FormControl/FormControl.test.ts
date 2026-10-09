// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Local wrapper fixtures exercise slot recognition and prop forwarding. */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, type Component } from 'vue'
import { FormControl, useFormControlForwardedProps } from './index'
import { TextInput } from '../TextInput'
import { Textarea } from '../Textarea'
import { Select } from '../Select'
import { Checkbox } from '../Checkbox'
import { Radio } from '../Radio'
import { RadioGroup } from '../RadioGroup'
import { CheckboxGroup } from '../CheckboxGroup'
import { Autocomplete } from '../Autocomplete'
import { TextInputWithTokens } from '../TextInputWithTokens'
import { SelectPanel } from '../SelectPanel'
import { asSlot } from '../composables/useSlots'

const wrappers: VueWrapper[] = []
let host: HTMLElement
beforeEach(() => {
  host = document.createElement('div')
  document.body.append(host)
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  host.remove()
})
function control(
  input: Component = TextInput,
  inputProps: Record<string, unknown> = {},
  props: Record<string, unknown> = {},
) {
  const wrapper = mount(FormControl, {
    attachTo: host,
    props: { id: 'field', ...props },
    slots: {
      default: () => [
        h(FormControl.Label, null, () => 'Field'),
        h(input, inputProps),
        h(FormControl.Caption, null, () => 'Help'),
        h(FormControl.Validation, { variant: 'error' }, () => 'Invalid'),
      ],
    },
  })
  wrappers.push(wrapper)
  return wrapper
}
describe('ordinary FormControl inputs', () => {
  for (const [name, input] of [
    ['TextInput', TextInput],
    ['Textarea', Textarea],
    ['Select', Select],
  ] as const) {
    test(`${name} inherits id, required, disabled, validation and description`, async () => {
      const wrapper = control(input, {}, { disabled: true, required: true })
      const node = wrapper.get<HTMLInputElement>('#field')
      expect(node.element.disabled).toBe(true)
      expect(node.attributes('aria-invalid')).toBe('true')
      expect(node.attributes('aria-describedby')).toBe('field-validationMessage field-caption')
      expect(wrapper.get('label').attributes('for')).toBe('field')
      expect(wrapper.get('[data-component="FormControl.Label"]').attributes('id')).toBe(
        'field-label',
      )
      expect(
        wrapper.get('[data-component="FormControl.Validation"] > span:last-child').attributes('id'),
      ).toBe('field-validationMessage')
      expect(wrapper.get('[data-component="FormControl.Caption"]').attributes('id')).toBe(
        'field-caption',
      )
      expect(wrapper.get('[data-component="FormControl"]').element.id).toBe('')
      await wrapper.setProps({ disabled: false, required: false })
      expect(node.element.disabled).toBe(false)
    })
  }
  test('vertical explicit input props override inherited defaults and warn', () => {
    const wrapper = control(
      TextInput,
      {
        id: 'explicit',
        disabled: false,
        required: false,
        validationStatus: 'success',
        'aria-describedby': 'own',
      },
      { disabled: true, required: true },
    )
    const node = wrapper.get<HTMLInputElement>('#explicit')
    expect(node.element.disabled).toBe(false)
    expect(node.attributes('aria-invalid')).toBeUndefined()
    expect(node.attributes('aria-describedby')).toBe('own')
    expect(console.warn).toHaveBeenCalledWith('Warning:', expect.stringContaining("'id'"))
  })
  test('an empty explicit id remains falsy for the source diagnostic', () => {
    control(TextInput, { id: '' })
    expect(console.warn).not.toHaveBeenCalled()
  })
  test('horizontal non-choice input duplicates (source clone + Checkbox/Radio-only filter), caption-only/no-validation branch', () => {
    const wrapper = control(
      TextInput,
      { id: 'ignored', disabled: false },
      { layout: 'horizontal', disabled: true },
    )
    expect(wrapper.findAll('input')).toHaveLength(2)
    expect(wrapper.get<HTMLInputElement>('#field').element.disabled).toBe(true)
    expect(wrapper.get('#field').attributes('aria-describedby')).toBe('field-caption')
    expect(wrapper.get('#field').attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.find('[data-component="FormControl.Validation"]').exists()).toBe(false)
    // 第二个（未克隆）输入保留其原始 props。
    expect(wrapper.get<HTMLInputElement>('#ignored').element.disabled).toBe(false)
  })
})
test('choice branch allows required checkbox, never required radio, and excludes per-option validation', () => {
  const checkbox = control(
    Checkbox,
    { value: 'one', disabled: false },
    { required: true, disabled: true },
  )
  expect(checkbox.get<HTMLInputElement>('input').element.required).toBe(true)
  expect(checkbox.get<HTMLInputElement>('input').element.disabled).toBe(true)
  expect(checkbox.get('input').attributes('aria-describedby')).toBe('field-caption')
  expect(checkbox.find('[data-component="FormControl.Validation"]').exists()).toBe(false)
  const radio = control(Radio, { name: 'group', value: 'one', required: true }, { required: true })
  expect(radio.get<HTMLInputElement>('input').element.required).toBe(false)
})
test('hidden ordinary labels and as=span do not change label identification', () => {
  const wrapper = mount(FormControl, {
    props: { id: 'hidden' },
    slots: {
      default: () => [
        h(FormControl.Label, { visuallyHidden: true, as: 'span' }, () => 'Hidden'),
        h(TextInput),
      ],
    },
  })
  wrappers.push(wrapper)
  const label = wrapper.get('[data-component="FormControl.Label"]')
  expect(label.attributes('data-visually-hidden')).toBe('')
  expect(label.attributes('for')).toBeUndefined()
  expect(wrapper.attributes('data-has-label')).toBeUndefined()
})
test('caption and validation associations update with conditional slots', async () => {
  const show = ref(true)
  const variant = ref<'error' | 'success'>('error')
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(FormControl, { id: 'dynamic' }, () => [
          h(FormControl.Label, null, () => 'Dynamic'),
          h(TextInput),
          show.value ? h(FormControl.Caption, null, () => 'Help') : null,
          show.value ? h(FormControl.Validation, { variant: variant.value }, () => 'Result') : null,
        ]),
    }),
  )
  wrappers.push(wrapper)
  variant.value = 'success'
  await nextTick()
  expect(wrapper.get('input').attributes('aria-invalid')).toBeUndefined()
  show.value = false
  await nextTick()
  expect(wrapper.get('input').attributes('aria-describedby')).toBeUndefined()
  expect(wrapper.find('[data-component="FormControl.Caption"]').exists()).toBe(false)
})
test('marked wrappers can forward props reactively and preserve explicit overrides', async () => {
  const Wrapped = asSlot(
    defineComponent({
      setup() {
        const forwarded = useFormControlForwardedProps(() => ({ 'data-wrapper': 'yes' }))
        return () => h(TextInput, forwarded.value)
      },
    }),
    TextInput,
  )
  const wrapper = control(Wrapped, {}, { required: true })
  expect(wrapper.get('input').attributes('id')).toBe('field')
  expect(wrapper.get('input').attributes('data-wrapper')).toBe('yes')
  await wrapper.setProps({ disabled: true })
  expect(wrapper.get<HTMLInputElement>('input').element.disabled).toBe(true)
})
test('forwarding outside a FormControl preserves the original object', () => {
  const external = { id: 'outside', disabled: false }
  let result: object | undefined
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useFormControlForwardedProps(external).value
        return () => h('div')
      },
    }),
  )
  wrappers.push(wrapper)
  expect(result).toBe(external)
})
test('both choice groups propagate disabled and keep option labels clickable', async () => {
  for (const [group, input, groupProps] of [
    [RadioGroup, Radio, { name: 'radio' }],
    [CheckboxGroup, Checkbox, {}],
  ] as const) {
    const wrapper = mount(group, {
      attachTo: host,
      props: { ...groupProps, disabled: true },
      slots: {
        default: () => [
          h(group.Label, null, () => 'Options'),
          h(FormControl, { id: `option-${input.name}` }, () => [
            h(input, { value: 'one' }),
            h(FormControl.Label, null, () => 'One'),
          ]),
        ],
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.get<HTMLInputElement>('input').element.disabled).toBe(true)
    await wrapper.setProps({ disabled: false })
    wrapper.get<HTMLLabelElement>('label').element.click()
    await nextTick()
    expect(wrapper.get<HTMLInputElement>('input').element.checked).toBe(true)
  }
})
test('Autocomplete and token inputs inherit form associations', async () => {
  for (const [name, input] of [
    ['Autocomplete', Autocomplete],
    ['TextInputWithTokens', TextInputWithTokens],
  ] as const) {
    const id = `composite-${name}`
    const wrapper = mount(FormControl, {
      attachTo: host,
      props: { id, disabled: true, required: true },
      slots: {
        default: () => [
          h(FormControl.Label, null, () => name),
          input === Autocomplete
            ? h(Autocomplete, null, () => h(Autocomplete.Input))
            : h(TextInputWithTokens, { tokens: [{ id: 1, text: 'One' }] }),
          h(FormControl.Caption, null, () => 'Help'),
          h(FormControl.Validation, { variant: 'error' }, () => 'Invalid'),
        ],
      },
    })
    wrappers.push(wrapper)
    const native = wrapper.get<HTMLInputElement>(`#${id}`)
    expect(native.element.disabled).toBe(true)
    expect(native.attributes('aria-describedby')).toBe(`${id}-validationMessage ${id}-caption`)
    expect(wrapper.get('label').attributes('for')).toBe(id)
    expect(native.attributes('aria-invalid')).toBe(input === Autocomplete ? undefined : 'true')
    await wrapper.setProps({ disabled: false })
    expect(native.element.disabled).toBe(false)
  }
})
test('SelectPanel associates custom label id and selected text without htmlFor', () => {
  const wrapper = mount(FormControl, {
    props: { id: 'panel' },
    slots: {
      default: () => [
        h(FormControl.Label, { id: 'panel-custom-label', htmlFor: 'ignored' }, () => 'Labels'),
        h(SelectPanel, {
          open: false,
          items: [{ id: 'one', text: 'One' }],
          selected: [{ id: 'one', text: 'One' }],
        }),
        h(FormControl.Caption, null, () => 'Help'),
      ],
    },
  })
  wrappers.push(wrapper)
  expect(wrapper.get('[data-component="FormControl.Label"]').attributes('for')).toBeUndefined()
  expect(wrapper.get('button').attributes('aria-labelledby')).toBe(
    'panel-custom-label panel-selected-value',
  )
  expect(wrapper.get('#panel-selected-value').text()).toBe('One')
  // SelectPanel only auto-wires its label; the source forwards caption to the list.
  expect(wrapper.get('button').attributes('aria-describedby')).toBeUndefined()
})
test('FormControl preserves class, style, label overrides and exposes its root element', () => {
  const wrapper = mount(FormControl, {
    props: { id: 'styled', className: 'own' },
    attrs: { class: 'native', style: { width: 200 } },
    slots: {
      default: () => [
        h(
          FormControl.Label,
          {
            required: false,
            disabled: false,
            style: { color: 'red', fontSize: 16, lineHeight: 1.5 },
          },
          () => 'Styled',
        ),
        h(TextInput),
        h(FormControl.Caption, { style: { paddingLeft: 4 } }, () => 'Help'),
        h(FormControl.Validation, { variant: 'success', style: { marginTop: 8 } }, () => 'Valid'),
      ],
    },
  })
  wrappers.push(wrapper)
  expect(wrapper.classes()).toContain('own')
  expect(wrapper.classes()).toContain('native')
  expect(wrapper.element.getAttribute('style')).toContain('width: 200px')
  expect(wrapper.get('label').element.getAttribute('style')).toContain('color: red')
  expect(wrapper.get<HTMLLabelElement>('label').element.style.fontSize).toBe('16px')
  expect(wrapper.get<HTMLLabelElement>('label').element.style.lineHeight).toBe('1.5')
  expect(
    wrapper.get<HTMLElement>('[data-component="FormControl.Caption"]').element.style.paddingLeft,
  ).toBe('4px')
  expect(
    wrapper.get<HTMLElement>('[data-component="FormControl.Validation"]').element.style.marginTop,
  ).toBe('8px')
  expect((wrapper.vm as unknown as { element: HTMLElement }).element).toBe(wrapper.element)
})
