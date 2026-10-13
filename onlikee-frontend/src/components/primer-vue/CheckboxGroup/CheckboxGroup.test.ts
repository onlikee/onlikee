// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Independent slot-marker and template fixtures. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { Fragment, createSSRApp, defineComponent, h, nextTick, shallowRef } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { CheckboxGroup } from './index'
import { Checkbox } from '../Checkbox'
import { FormControl } from '../FormControl'
import { asSlot } from '../composables/useSlots'

const wrappers: VueWrapper[] = []
function choice(value: string, props: Record<string, unknown> = {}) {
  return h(FormControl, { id: `choice-${value}` }, () => [
    h(Checkbox, { value, ...props }),
    h(FormControl.Label, null, () => value),
  ])
}
function render(
  props = {},
  children = () => [h(CheckboxGroup.Label, null, () => 'Choices'), choice('one'), choice('two')],
) {
  const wrapper = mount(CheckboxGroup, {
    props,
    slots: { default: children },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))

describe('CheckboxGroup source contracts', () => {
  it('refreshes every checkbox ARIA state after a group render without changing native selection', async () => {
    const wrapper = render({}, () => [
      h(CheckboxGroup.Label, null, () => 'Choices'),
      choice('one', { defaultChecked: true }),
      choice('two'),
    ])
    await nextTick()
    const first = wrapper.get<HTMLInputElement>('#choice-one').element
    const second = wrapper.get<HTMLInputElement>('#choice-two').element
    first.click()
    second.click()
    await nextTick()
    expect(first.getAttribute('aria-checked')).toBe('true')
    expect(second.getAttribute('aria-checked')).toBe('false')
    await wrapper.setProps({ className: 'updated' })
    expect(first.checked).toBe(false)
    expect(second.checked).toBe(true)
    expect(first.getAttribute('aria-checked')).toBe('false')
    expect(second.getAttribute('aria-checked')).toBe('true')
  })

  it('renders explicit Fragments without including their nested controls in initial selected values', async () => {
    const change = vi.fn()
    const wrapper = render({ onChange: change }, () => [
      h(CheckboxGroup.Label, null, () => 'Choices'),
      h(Fragment, [choice('one', { defaultChecked: true })]),
      choice('two'),
    ])
    expect(wrapper.get<HTMLInputElement>('#choice-one').element.checked).toBe(true)
    wrapper.get<HTMLInputElement>('#choice-two').element.click()
    await nextTick()
    expect(change.mock.calls[0]?.[0]).toEqual(['two'])
  })

  it('keeps a label inside an explicit Fragment in the body rather than promoting it to a legend', () => {
    const wrapper = render({ 'aria-labelledby': 'external-title' }, () => [
      h(Fragment, [h(CheckboxGroup.Label, null, () => 'Nested label')]),
      choice('one'),
    ])
    expect(wrapper.find('fieldset').exists()).toBe(false)
    expect(wrapper.find('legend').exists()).toBe(false)
    expect(wrapper.get('[role="group"]').attributes('aria-labelledby')).toBe('external-title')
    expect(wrapper.get('[role="group"] [data-component="CheckboxGroup.Label"]').text()).toBe(
      'Nested label',
    )
  })
  it('hydrates group label and descriptions with stable generated IDs', async () => {
    const render = () =>
      h(CheckboxGroup, null, () => [
        h(CheckboxGroup.Label, null, () => 'Choices'),
        h(CheckboxGroup.Caption, null, () => 'Help'),
        h(CheckboxGroup.Validation, { variant: 'error' }, () => 'Error'),
        choice('one', { defaultChecked: true }),
      ])
    const host = document.createElement('div')
    host.innerHTML = await renderToString(createSSRApp({ render }))
    const captionId = host.querySelector('[data-component="CheckboxGroup.Caption"]')!.id
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const app = createSSRApp({ render })
    app.mount(host)
    await nextTick()
    expect(host.querySelector('[data-component="CheckboxGroup.Caption"]')!.id).toBe(captionId)
    expect(host.querySelector<HTMLInputElement>('input')!.checked).toBe(true)
    expect(warn).not.toHaveBeenCalled()
    app.unmount()
  })
  it('initializes both controlled and default checked values and calls group before checkbox', async () => {
    const calls: string[] = []
    const change = vi.fn(() => calls.push('group'))
    const wrapper = render({ onChange: change }, () => [
      h(CheckboxGroup.Label, null, () => 'Choices'),
      choice('one', { defaultChecked: true }),
      choice('two', { checked: true }),
      choice('three', { onChange: () => calls.push('checkbox') }),
    ])
    wrapper.get<HTMLInputElement>('#choice-three').element.click()
    await nextTick()
    expect(change.mock.calls[0]).toEqual([['one', 'two', 'three'], expect.any(Event)])
    expect(calls).toEqual(['group', 'checkbox'])
    wrapper.get<HTMLInputElement>('#choice-one').element.click()
    await nextTick()
    expect(change.mock.calls[1]).toEqual([['two', 'three'], expect.any(Event)])
  })

  it('recognizes bare Boolean attributes and structural template fragments', async () => {
    const change = vi.fn()
    const wrapper = mount(
      defineComponent({
        components: {
          CheckboxGroup,
          Checkbox,
          FormControl,
          GroupLabel: CheckboxGroup.Label,
          ControlLabel: FormControl.Label,
        },
        setup: () => ({ change }),
        template: `<CheckboxGroup @change="change"><GroupLabel>Choices</GroupLabel><FormControl><Checkbox value="one" default-checked /><ControlLabel>One</ControlLabel></FormControl><template v-for="value in ['two', 'three']" :key="value"><FormControl><Checkbox :value="value" /><ControlLabel>{{ value }}</ControlLabel></FormControl></template></CheckboxGroup>`,
      }),
      { attachTo: document.body },
    )
    wrappers.push(wrapper)
    wrapper.findAll<HTMLInputElement>('input')[1]!.element.click()
    await nextTick()
    expect(change.mock.calls[0]?.[0]).toEqual(['one', 'two'])
  })

  it('recognizes wrapped FormControl and Checkbox by their slot markers', async () => {
    const WrappedControl = asSlot(
      defineComponent({
        setup:
          (_, { slots }) =>
          () =>
            h(FormControl, null, slots),
      }),
      FormControl,
    )
    const WrappedCheckbox = asSlot(
      defineComponent({
        setup:
          (_, { attrs }) =>
          () =>
            h(Checkbox, attrs),
      }),
      Checkbox,
    )
    const change = vi.fn()
    const wrapper = render({ onChange: change }, () => [
      h(CheckboxGroup.Label, null, () => 'Choices'),
      h(WrappedControl, null, () => [
        h(WrappedCheckbox, { value: 'one', defaultChecked: true }),
        h(FormControl.Label, null, () => 'One'),
      ]),
      choice('two'),
    ])
    wrapper.get<HTMLInputElement>('#choice-two').element.click()
    await nextTick()
    expect(change.mock.calls[0]?.[0]).toEqual(['one', 'two'])
  })

  it('does not update the source selection bookkeeping while no change handler is supplied', async () => {
    const wrapper = render()
    wrapper.get<HTMLInputElement>('#choice-one').element.click()
    await nextTick()
    const change = vi.fn()
    await wrapper.setProps({ onChange: change })
    expect(wrapper.get<HTMLInputElement>('#choice-one').element.getAttribute('aria-checked')).toBe(
      'true',
    )
    wrapper.get<HTMLInputElement>('#choice-two').element.click()
    await nextTick()
    expect(change.mock.calls[0]?.[0]).toEqual(['two'])
  })

  it('keeps the initially selected values after incoming checkbox defaults change', async () => {
    const initial = shallowRef(true)
    const change = vi.fn()
    const wrapper = render({ onChange: change }, () => [
      h(CheckboxGroup.Label, null, () => 'Choices'),
      choice('one', { defaultChecked: initial.value }),
      choice('two'),
    ])
    initial.value = false
    await nextTick()
    wrapper.get<HTMLInputElement>('#choice-two').element.click()
    await nextTick()
    expect(change.mock.calls[0]?.[0]).toEqual(['one', 'two'])
  })

  it('ignores arbitrary root attrs while merging class and using id for associations only', () => {
    const wrapper = render({
      id: 'choices',
      className: 'source',
      class: 'vue',
      style: { color: 'red' },
      title: 'Ignored',
      'aria-labelledby': 'external',
    })
    const fieldset = wrapper.get('fieldset')
    expect(fieldset.classes()).toEqual(expect.arrayContaining(['source', 'vue']))
    expect(fieldset.attributes('id')).toBeUndefined()
    expect(fieldset.attributes('style')).toBeUndefined()
    expect(fieldset.attributes('title')).toBeUndefined()
    expect(fieldset.attributes('aria-labelledby')).toBeUndefined()
  })

  it('uses hidden labels without visible legend spacing and ignores unrelated subcomponent attrs', () => {
    const wrapper = render({ id: 'hidden', required: true }, () => [
      h(
        CheckboxGroup.Label,
        { 'visually-hidden': '', id: 'ignored', className: 'source', class: 'vue' },
        () => 'Choices',
      ),
      h(
        CheckboxGroup.Caption,
        { id: 'ignored', title: 'ignored', className: 'source', class: 'vue' },
        () => 'Help',
      ),
      h(
        CheckboxGroup.Validation,
        { variant: 'error', id: 'ignored', title: 'ignored' },
        () => 'Error',
      ),
      choice('one'),
    ])
    expect(wrapper.get('legend').attributes('data-legend-visible')).toBeUndefined()
    expect(wrapper.get('[data-component="CheckboxGroup.Label"]').attributes('id')).toBeUndefined()
    expect(wrapper.get('[data-component="CheckboxGroup.Label"]').attributes('title')).toBe(
      'required field',
    )
    const caption = wrapper.get('[data-component="CheckboxGroup.Caption"]')
    expect(caption.attributes('id')).toBe('hidden-caption')
    expect(caption.attributes('title')).toBeUndefined()
    expect(caption.classes()).toEqual(expect.arrayContaining(['source', 'vue']))
    expect(
      wrapper.get('[data-component="CheckboxGroup.Validation"]').attributes('title'),
    ).toBeUndefined()
    expect(wrapper.get('#hidden-validationMessage').text()).toBe('Error')
    expect(wrapper.get<HTMLInputElement>('input').element.required).toBe(false)
  })

  it('updates validation associations when the validation slot changes', async () => {
    const invalid = shallowRef(false)
    const wrapper = render(
      { id: 'external', 'aria-labelledby': 'external-title', required: true },
      () => [
        h(CheckboxGroup.Caption, null, () => 'Help'),
        ...(invalid.value
          ? [h(CheckboxGroup.Validation, { variant: 'error' }, () => 'Error')]
          : []),
        choice('one'),
      ],
    )
    expect(wrapper.get('[role="group"]').attributes('aria-describedby')).toBe(
      'external-caption external-requiredMessage',
    )
    invalid.value = true
    await nextTick()
    expect(wrapper.get('[role="group"]').attributes('aria-describedby')).toBe(
      'external-validationMessage external-caption external-requiredMessage',
    )
    expect(wrapper.get('[role="group"]').attributes('as')).toBe('div')
  })

  it('disables and enables both fieldset and FormControl inputs without making each required', async () => {
    const change = vi.fn()
    const wrapper = render({ disabled: true, required: true, onChange: change })
    const input = wrapper.get<HTMLInputElement>('#choice-one')
    expect(input.element.disabled).toBe(true)
    expect(input.element.required).toBe(false)
    expect(wrapper.get('fieldset').attributes('disabled')).toBeDefined()
    input.element.click()
    expect(change).not.toHaveBeenCalled()
    await wrapper.setProps({ disabled: false })
    input.element.click()
    await nextTick()
    expect(change.mock.calls[0]?.[0]).toEqual(['one'])
  })
})
