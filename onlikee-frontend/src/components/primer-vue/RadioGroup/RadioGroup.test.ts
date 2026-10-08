// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { h, nextTick, ref } from 'vue'
import { RadioGroup } from './index'
import { FormControl } from '../FormControl'
import { Radio } from '../Radio'

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
