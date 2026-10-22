// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Fixtures cover slot wrappers and group hydration. */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { Fragment, createSSRApp, createVNode, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { RadioGroup } from './index'
import { FormControl } from '../FormControl'
import { Radio } from '../Radio'
import { CheckboxGroup } from '../CheckboxGroup'
import { asSlot } from '../composables/useSlots'

let host: HTMLElement
const wrappers: VueWrapper[] = []

beforeEach(() => {
  host = document.createElement('div')
  document.body.append(host)
})

afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  host.remove()
})

function mountGroup(
  options: {
    disabled?: boolean
    optionDisabled?: boolean
    controlled?: boolean
    acceptChanges?: boolean
  } = {},
) {
  const selected = ref('one')
  const onChange = vi.fn((value: string | null, _event: Event) => {
    if (options.acceptChanges && value !== null) selected.value = value
  })
  const wrapper = mount(RadioGroup, {
    attachTo: host,
    props: { name: 'choices', disabled: options.disabled, onChange },
    slots: {
      default: () => [
        h(RadioGroup.Label, null, () => 'Choose one'),
        ...['one', 'two'].map((value) =>
          h(
            FormControl,
            {
              id: `option-${value}`,
              disabled: value === 'two' && options.optionDisabled,
            },
            () => [
              h(Radio, {
                value,
                checked: options.controlled ? selected.value === value : undefined,
                defaultChecked: value === 'one',
              }),
              h(FormControl.Label, null, () => `Option ${value}`),
            ],
          ),
        ),
      ],
    },
  })
  wrappers.push(wrapper)
  return { wrapper, onChange }
}

test('native selection is mutually exclusive, inherits name and emits the selected value and event', async () => {
  const { wrapper, onChange } = mountGroup()
  const first = wrapper.get<HTMLInputElement>('#option-one')
  const second = wrapper.get<HTMLInputElement>('#option-two')
  expect(first.element.name).toBe('choices')
  expect(second.element.name).toBe('choices')
  expect(first.element.checked).toBe(true)
  second.element.click()
  await nextTick()
  expect(first.element.checked).toBe(false)
  expect(second.element.checked).toBe(true)
  expect(onChange).toHaveBeenCalledTimes(1)
  const [value, event] = onChange.mock.calls[0]
  expect(value).toBe('two')
  expect(event).toBeInstanceOf(Event)
  expect(event.type).toBe('change')
  expect(event.target).toBe(second.element)
  expect(wrapper.emitted('change')).toStrictEqual([[value, event]])
  second.element.click()
  await nextTick()
  expect(onChange).toHaveBeenCalledTimes(1)
})

test('group disabled prevents native selection and dynamically enabling restores it', async () => {
  const { wrapper, onChange } = mountGroup({ disabled: true })
  const second = wrapper.get<HTMLInputElement>('#option-two')
  expect(second.element.disabled).toBe(true)
  second.element.click()
  await nextTick()
  expect(second.element.checked).toBe(false)
  expect(onChange).not.toHaveBeenCalled()
  await wrapper.setProps({ disabled: false })
  expect(second.element.disabled).toBe(false)
  second.element.click()
  await nextTick()
  expect(second.element.checked).toBe(true)
  expect(onChange).toHaveBeenCalledTimes(1)
})

test('an individually disabled FormControl prevents selection without disabling its sibling', async () => {
  const { wrapper, onChange } = mountGroup({ optionDisabled: true })
  const first = wrapper.get<HTMLInputElement>('#option-one')
  const second = wrapper.get<HTMLInputElement>('#option-two')
  expect(first.element.disabled).toBe(false)
  expect(second.element.disabled).toBe(true)
  second.element.click()
  await nextTick()
  expect(first.element.checked).toBe(true)
  expect(second.element.checked).toBe(false)
  expect(onChange).not.toHaveBeenCalled()
})

test('controlled radios restore the parent selection when a change is rejected', async () => {
  const { wrapper, onChange } = mountGroup({ controlled: true })
  const second = wrapper.get<HTMLInputElement>('#option-two')
  second.element.click()
  await nextTick()
  expect(onChange).toHaveBeenCalledWith('two', expect.any(Event))
  expect(wrapper.get<HTMLInputElement>('#option-one').element.checked).toBe(true)
  expect(second.element.checked).toBe(false)
  expect(second.attributes('aria-checked')).toBe('false')
})

test('controlled radios retain a selection accepted by the parent', async () => {
  const { wrapper, onChange } = mountGroup({ controlled: true, acceptChanges: true })
  const first = wrapper.get<HTMLInputElement>('#option-one')
  const second = wrapper.get<HTMLInputElement>('#option-two')
  second.element.click()
  await nextTick()
  expect(onChange).toHaveBeenCalledWith('two', expect.any(Event))
  expect(first.element.checked).toBe(false)
  expect(second.element.checked).toBe(true)
  expect(first.attributes('aria-checked')).toBe('false')
  expect(second.attributes('aria-checked')).toBe('true')
})

test('FormControl labels reference their input and clicking a label selects its radio', async () => {
  const { wrapper, onChange } = mountGroup()
  const label = wrapper.get<HTMLLabelElement>('label[for="option-two"]')
  expect(label.element.control).toBe(wrapper.get('#option-two').element)
  label.element.click()
  await nextTick()
  expect(wrapper.get<HTMLInputElement>('#option-two').element.checked).toBe(true)
  expect(onChange).toHaveBeenCalledWith('two', expect.any(Event))
})

test('a direct Radio respects its disabled prop in a RadioGroup', async () => {
  const wrapper = mount(RadioGroup, {
    attachTo: host,
    props: { name: 'direct' },
    slots: {
      default: () => [
        h(RadioGroup.Label, null, () => 'Direct radios'),
        h(Radio, { value: 'one', defaultChecked: true }),
        h(Radio, { value: 'two', disabled: true }),
      ],
    },
  })
  wrappers.push(wrapper)
  const second = wrapper.get<HTMLInputElement>('input[value="two"]')
  second.element.click()
  await nextTick()
  expect(second.element.checked).toBe(false)
  expect(wrapper.emitted('change')).toBeUndefined()
})

test('caption uses Text and compound helpers are shared with CheckboxGroup', () => {
  expect(RadioGroup.Label).toBe(CheckboxGroup.Label)
  expect(RadioGroup.Caption).toBe(CheckboxGroup.Caption)
  expect(RadioGroup.Validation).toBe(CheckboxGroup.Validation)
  const wrapper = mount(RadioGroup, {
    props: { name: 'contract', id: 'contract', required: true, 'data-component': 'CustomGroup' },
    slots: {
      default: () => [
        h(RadioGroup.Label, null, () => 'Choices'),
        h(RadioGroup.Caption, { className: 'caption' }, () => 'Help'),
        h(RadioGroup.Validation, { variant: 'error' }, () => 'Choose one'),
        h(Radio, { value: 'one' }),
      ],
    },
  })
  wrappers.push(wrapper)
  const caption = wrapper.get('[data-component="CustomGroup.Caption"]')
  expect(caption.classes()).toContain('caption')
  expect(caption.classes().some((name) => name.includes('text'))).toBe(true)
  expect(caption.attributes('id')).toBe('contract-caption')
  expect(wrapper.get('legend').text()).toContain('Choose one')
  expect(wrapper.get('[data-component="CustomGroup.Label"]').attributes('title')).toBe(
    'required field',
  )
  expect(wrapper.get('[aria-hidden="true"] [data-component="CustomGroup.Validation"]').text()).toBe(
    'Choose one',
  )
})

test('external labeling links caption, validation and required descriptions without forwarding input props', () => {
  const wrapper = mount(RadioGroup, {
    props: {
      name: 'external',
      id: 'external',
      required: true,
      disabled: true,
      'aria-labelledby': 'title',
    },
    attrs: { title: 'ignored', style: { color: 'red' } },
    slots: {
      default: () => [
        h(RadioGroup.Caption, null, () => 'Help'),
        h(RadioGroup.Validation, { variant: 'error' }, () => 'Choose one'),
        h(FormControl, { id: 'external-one' }, () => [
          h(Radio, { value: 'one' }),
          h(FormControl.Label, null, () => 'One'),
        ]),
      ],
    },
  })
  wrappers.push(wrapper)
  expect(wrapper.find('fieldset').exists()).toBe(false)
  const group = wrapper.get('[role="group"]')
  expect(group.attributes('aria-labelledby')).toBe('title')
  expect(group.attributes('aria-describedby')).toBe(
    'external-validationMessage external-caption external-requiredMessage',
  )
  expect(wrapper.get('#external-one').element).toHaveProperty('disabled', true)
  expect(wrapper.find('[name="external"]').exists()).toBe(true)
  expect(wrapper.find('[title="ignored"]').exists()).toBe(false)
  expect(wrapper.find('[style*="color: red"]').exists()).toBe(false)
})

test('recognizes structural template groups and slot wrappers without traversing explicit Fragments', () => {
  const Label = asSlot(
    defineComponent({
      setup:
        (_, { slots }) =>
        () =>
          h(RadioGroup.Label, null, slots),
    }),
    RadioGroup.Label,
  )
  const wrapper = mount(RadioGroup, {
    props: { name: 'slots' },
    slots: {
      default: () => [
        createVNode(Fragment, null, [h(Label, null, () => 'Wrapped title')], 64),
        h(Fragment, null, [h(RadioGroup.Caption, null, () => 'Nested caption')]),
        'ignored text',
        h(Radio, { value: 'one' }),
      ],
    },
  })
  wrappers.push(wrapper)
  expect(wrapper.get('legend').text()).toBe('Wrapped title')
  expect(
    wrapper.get('[class*="radio-group__body"] [data-component="RadioGroup.Caption"]').text(),
  ).toBe('Nested caption')
  expect(wrapper.text()).not.toContain('ignored text')
})

test('runs group change before input change and remembers the last checked event value', async () => {
  const order: string[] = []
  const onChange = vi.fn((_value: string | null) => {
    order.push('group')
  })
  const wrapper = mount(RadioGroup, {
    props: { name: 'order', 'aria-labelledby': 'title', onChange },
    slots: { default: () => h(Radio, { value: 'one', onChange: () => order.push('radio') }) },
    attachTo: host,
  })
  wrappers.push(wrapper)
  const input = wrapper.get<HTMLInputElement>('input')
  input.element.click()
  await nextTick()
  expect(order).toEqual(['group', 'radio'])
  expect(onChange.mock.calls[0]?.[0]).toBe('one')
  input.element.checked = false
  input.element.dispatchEvent(new Event('change', { bubbles: true }))
  expect(onChange.mock.calls[1]?.[0]).toBe('one')
})

test('hydrates group label, caption and validation IDs without changing default selection', async () => {
  const App = defineComponent({
    render: () =>
      h(RadioGroup, { name: 'hydration' }, () => [
        h(RadioGroup.Label, null, () => 'Choose one'),
        h(RadioGroup.Caption, null, () => 'Help'),
        h(RadioGroup.Validation, { variant: 'error' }, () => 'Required'),
        h(Radio, { value: 'one', defaultChecked: true }),
      ]),
  })
  host.innerHTML = await renderToString(createSSRApp(App))
  const original = host.querySelector('input')!
  const captionId = host.querySelector('[data-component="RadioGroup.Caption"]')!.id
  const warn = vi.spyOn(console, 'warn')
  const error = vi.spyOn(console, 'error')
  const app = createSSRApp(App)
  app.mount(host)
  await nextTick()
  expect(host.querySelector('input')).toBe(original)
  expect(original.checked).toBe(true)
  expect(host.querySelector('[data-component="RadioGroup.Caption"]')!.id).toBe(captionId)
  expect(warn).not.toHaveBeenCalled()
  expect(error).not.toHaveBeenCalled()
  app.unmount()
  warn.mockRestore()
  error.mockRestore()
})
