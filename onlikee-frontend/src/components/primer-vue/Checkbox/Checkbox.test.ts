// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Local fixtures verify native form behavior and named bindings. */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Checkbox } from './index'
import { CheckboxGroup } from '../CheckboxGroup'
import { FormControl } from '../FormControl'
import { Radio } from '../Radio'
import { RadioGroup } from '../RadioGroup'
let host: HTMLElement
const wrappers: VueWrapper[] = []
beforeEach(() => { host = document.createElement('div'); document.body.append(host) })
afterEach(() => { wrappers.splice(0).forEach(wrapper => wrapper.unmount()); host.remove() })
test('native checkbox submits its value, initializes default state and resets with the form', async () => {
  const change = vi.fn()
  const wrapper = mount(defineComponent({ render: () => h('form', [h(Checkbox, { value: 'yes', defaultChecked: true, onChange: change })]) }), { attachTo: host })
  wrappers.push(wrapper)
  const input = wrapper.get<HTMLInputElement>('input').element
  expect(input.checked).toBe(true)
  expect(new FormData(wrapper.get<HTMLFormElement>('form').element).get('yes')).toBe('yes')
  input.click()
  await nextTick()
  expect(input.checked).toBe(false)
  expect(change).toHaveBeenCalledTimes(1)
  expect(input.getAttribute('aria-checked')).toBe('false')
  wrapper.get<HTMLFormElement>('form').element.reset()
  expect(input.checked).toBe(true)
})
test('controlled rejected checkbox changes restore the native checked state', async () => {
  const wrapper = mount(Checkbox, { attachTo: host, props: { checked: false } })
  wrappers.push(wrapper)
  wrapper.element.click()
  await nextTick()
  expect((wrapper.element as HTMLInputElement).checked).toBe(false)
  expect(wrapper.emitted('update:checked')).toEqual([[true]])
})
test('named checked binding accepts updates, and disabled prevents native changes', async () => {
  const checked = ref(false)
  const wrapper = mount(defineComponent({ setup: () => () => h(Checkbox, { checked: checked.value, 'onUpdate:checked': value => { checked.value = value } }) }), { attachTo: host })
  wrappers.push(wrapper)
  wrapper.get<HTMLInputElement>('input').element.click()
  await nextTick()
  expect(checked.value).toBe(true)
  expect(wrapper.get<HTMLInputElement>('input').element.checked).toBe(true)
})
test('indeterminate remains mixed after activation, and changing it restores ordinary checked behavior', async () => {
  const wrapper = mount(Checkbox, { attachTo: host, props: { indeterminate: true, checked: true } })
  wrappers.push(wrapper)
  const input = wrapper.element as HTMLInputElement
  expect(input.checked).toBe(false)
  expect(input.indeterminate).toBe(true)
  input.click()
  await nextTick()
  expect(input.indeterminate).toBe(true)
  expect(input.checked).toBe(false)
  expect(input.getAttribute('aria-checked')).toBe('mixed')
  await wrapper.setProps({ indeterminate: false })
  expect(input.indeterminate).toBe(false)
  expect(input.checked).toBe(true)
  expect(input.getAttribute('aria-checked')).toBe('true')
})
test('required and validation state inform ARIA and explicit native attributes win', () => {
  const wrapper = mount(Checkbox, { props: { required: true, validationStatus: 'error', value: 'one' }, attrs: { name: 'choice', 'data-component': 'CustomCheckbox' } })
  wrappers.push(wrapper)
  expect(wrapper.attributes('aria-required')).toBe('true')
  expect(wrapper.attributes('aria-invalid')).toBe('true')
  expect(wrapper.attributes('name')).toBe('choice')
  expect(wrapper.attributes('data-component')).toBe('CustomCheckbox')
})
test('group initializes selected values and calls group change before individual change', async () => {
  const order: string[] = []
  const change = vi.fn((_selected: string[], _event?: Event) => { order.push('group') })
  const wrapper = mount(CheckboxGroup, { attachTo: host, props: { id: 'choices', onChange: change }, slots: { default: () => [
    h(CheckboxGroup.Label, null, () => 'Choices'), h(CheckboxGroup.Caption, null, () => 'Help'),
    h(CheckboxGroup.Validation, { variant: 'error' }, () => 'Choose at least one'),
    ...['one', 'two'].map(value => h(FormControl, { id: `check-${value}` }, () => [
      h(Checkbox, { value, defaultChecked: value === 'one', onChange: () => { order.push('input') } }), h(FormControl.Label, null, () => value)
    ]))
  ] } })
  wrappers.push(wrapper)
  wrapper.get<HTMLInputElement>('#check-two').element.click()
  await nextTick()
  expect(change.mock.calls[0][0]).toEqual(['one', 'two'])
  expect(order).toEqual(['group', 'input'])
  expect(wrapper.get('[data-component="CheckboxGroup.Label"]').text()).toBe('Choices')
  expect(wrapper.get('[data-component="CheckboxGroup.Caption"]').attributes('id')).toBe('choices-caption')
  expect(wrapper.get('#choices-validationMessage').text()).toBe('Choose at least one')
  wrapper.get<HTMLInputElement>('#check-one').element.click()
  await nextTick()
  expect(change.mock.calls[1][0]).toEqual(['two'])
})
test('unlabelled choice group associates an external label and required description', () => {
  const wrapper = mount(CheckboxGroup, { props: { id: 'external', required: true, 'aria-labelledby': 'external-label' }, slots: { default: () => [h(CheckboxGroup.Caption, null, () => 'Help'), h(Checkbox, { value: 'one' })] } })
  wrappers.push(wrapper)
  expect(wrapper.get('[role="group"]').attributes('aria-labelledby')).toBe('external-label')
  expect(wrapper.get('[role="group"]').attributes('aria-describedby')).toBe('external-caption external-requiredMessage')
  expect(wrapper.get('#external-requiredMessage').text()).toBe('Required')
})
test('SSR emits checked HTML attributes for uncontrolled initial checkbox and radio values', async () => {
  const html = await renderToString(createSSRApp({ render: () => h('form', [h(Checkbox, { defaultChecked: true }), h(Radio, { name: 'ssr', value: 'one', defaultChecked: true })]) }))
  expect(html.match(/<input[^>]*\schecked(?:\s|>)/g)).toHaveLength(2)
  expect(html).not.toContain('defaultchecked')
})

test('controlled SSR emits native checked and omits client-only defaultChecked', async () => {
  const html = await renderToString(createSSRApp({ render: () => h('form', [
    h(Checkbox, { checked: true, defaultChecked: false }),
    h(Radio, { name: 'ssr-controlled', value: 'one', checked: true, defaultChecked: false }),
    h(Radio, { name: 'ssr-controlled', value: 'two', checked: false, defaultChecked: true })
  ]) }))
  expect(html.match(/<input[^>]*\schecked(?:\s|>)/g)).toHaveLength(2)
  expect(html).not.toContain('defaultchecked')
})

test('choice groups preserve custom component markers without leaking radio name to the root', () => {
  for (const [group, groupProps] of [[RadioGroup, { name: 'inputs-only' }], [CheckboxGroup, {}]] as const) {
    const wrapper = mount(group, { props: { ...groupProps, 'data-component': 'CustomGroup' }, slots: { default: () => h(group.Label, null, () => 'Options') } })
    wrappers.push(wrapper)
    expect(wrapper.get('fieldset').attributes('data-component')).toBe('CustomGroup')
    expect(wrapper.get('fieldset').attributes('name')).toBeUndefined()
    expect(wrapper.get('[data-component="CustomGroup.Label"]').text()).toBe('Options')
  }
})
