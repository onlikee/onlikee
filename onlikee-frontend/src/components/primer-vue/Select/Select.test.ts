// @vitest-environment jsdom
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, ref, type Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Select } from './index'
import type { SelectProps } from './types'
import { FormControl } from '../FormControl'

const wrappers: VueWrapper[] = []
const options = () => [
  h(Select.Option, { value: 'apple' }, () => 'Apple'),
  h(Select.OptGroup, { label: 'Others' }, () =>
    h(Select.Option, { value: 'banana' }, () => 'Banana'),
  ),
]
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})
function render(props = {}, attrs = {}) {
  const wrapper = mount(Select, {
    props,
    attrs,
    slots: { default: options },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}
describe('Select native contract', () => {
  it('keeps the native single-select public contract', () => {
    expectTypeOf<SelectProps['size']>().toEqualTypeOf<'small' | 'medium' | 'large' | undefined>()
    expectTypeOf<SelectProps['value']>().toEqualTypeOf<
      string | number | readonly string[] | undefined
    >()
    expectTypeOf<InstanceType<typeof Select>['$props']['name']>().toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf<InstanceType<typeof Select.Option>['$props']>().toHaveProperty('disabled')
    expectTypeOf<'multiple' extends keyof SelectProps ? true : false>().toEqualTypeOf<false>()
    expectTypeOf<'contrast' extends keyof SelectProps ? true : false>().toEqualTypeOf<false>()
    expectTypeOf<'variant' extends keyof SelectProps ? true : false>().toEqualTypeOf<false>()
  })
  it('puts className on the wrapper, option and group while native attrs stay on the select', () => {
    const wrapper = mount(Select, {
      props: { className: 'wrapper', disabled: true, block: true, size: 'small' },
      attrs: { class: 'vue-wrapper', id: 'choice', 'aria-invalid': 'false' },
      slots: {
        default: () =>
          h(Select.OptGroup, { label: 'Choices', className: 'group' }, () =>
            h(Select.Option, { value: 'one', className: 'option' }, () => 'One'),
          ),
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['wrapper', 'vue-wrapper']))
    expect(wrapper.attributes('data-block')).toBe('true')
    expect(wrapper.attributes('data-size')).toBe('small')
    expect(wrapper.get('select').attributes('id')).toBe('choice')
    expect(wrapper.get('select').classes()).not.toContain('wrapper')
    expect(wrapper.get('select').attributes('disabled')).toBeDefined()
    expect(wrapper.get('optgroup').classes()).toContain('group')
    expect(wrapper.get('option').classes()).toContain('option')
    expect(wrapper.get('optgroup').attributes('data-component')).toBe('Select.OptGroup')
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('svg').attributes('viewBox')).toBeUndefined()
  })
  it('renders native options and groups with no substitute listbox or option registry', () => {
    const wrapper = render({ defaultValue: 'banana' }, { name: 'fruit' })
    expect(wrapper.get('select').element.value).toBe('banana')
    expect(wrapper.get('optgroup').attributes('label')).toBe('Others')
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    expect(wrapper.find('.select-option-registry').exists()).toBe(false)
    expect(wrapper.get('option').attributes('data-component')).toBe('Select.Option')
  })
  it('selects the first option when neither value nor placeholder is supplied', async () => {
    const wrapper = render()
    await nextTick()
    expect(wrapper.get('select').element.value).toBe('apple')
    await wrapper.setProps({ disabled: true })
    expect(wrapper.get('select').element.value).toBe('apple')
  })
  it('preserves a native explicitly selected option when no select default is provided', () => {
    const wrapper = mount(Select, {
      slots: {
        default: () => [
          h('option', { value: 'first' }, 'First'),
          h('option', { value: 'second', selected: true }, 'Second'),
        ],
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.get('select').element.value).toBe('second')
  })
  it('normalizes numeric select, option, and group styles while passing deprecated width props to the select as attributes', () => {
    const wrapper = mount(Select, {
      props: { width: 300, minWidth: 100, maxWidth: 400 },
      attrs: { style: [{ fontSize: 16, width: 180 }, 'line-height:1.5;'] },
      slots: {
        default: () => [
          h(Select.Option, { value: 'first', style: { fontSize: 12 } }, () => 'First'),
          h(Select.OptGroup, { label: 'Other', style: { paddingLeft: 8 } }, () =>
            h(Select.Option, { value: 'second', selected: true }, () => 'Second'),
          ),
        ],
      },
    })
    wrappers.push(wrapper)
    const select = wrapper.get('select')
    expect(select.attributes('width')).toBe('300')
    expect(select.attributes('minwidth')).toBe('100')
    expect(select.attributes('maxwidth')).toBe('400')
    expect((wrapper.get('[data-component="TextInput"]').element as HTMLElement).style.width).toBe(
      '',
    )
    expect(wrapper.get('select').element.style.width).toBe('180px')
    expect(wrapper.get('select').element.style.fontSize).toBe('16px')
    expect(wrapper.get('select').element.style.lineHeight).toBe('1.5')
    expect(wrapper.get('option').element.style.fontSize).toBe('12px')
    expect(wrapper.get('optgroup').element.style.paddingLeft).toBe('8px')
    expect(wrapper.get('select').element.value).toBe('second')
  })
  it('serializes object option values to "[object Object]"', async () => {
    const wrapper = mount(Select, {
      props: { value: '[object Object]' },
      slots: {
        default: () => [
          h(Select.Option, { value: { id: 1 } as unknown as string }, () => 'Object'),
          h('option', { value: { id: 2 } }, 'RawObject'),
        ],
      },
    })
    wrappers.push(wrapper)
    await nextTick()
    const [first, second] = wrapper.findAll('option')
    expect((first!.element as HTMLOptionElement).value).toBe('[object Object]')
    expect((second!.element as HTMLOptionElement).value).toBe('[object Object]')
    expect(wrapper.get('select').element.value).toBe('[object Object]')
  })
  it('skips disabled option groups when selecting the native initial option', () => {
    const wrapper = mount(Select, {
      slots: {
        default: () => [
          h(
            'optgroup',
            { label: 'Unavailable', disabled: true },
            h('option', { value: 'first' }, 'First'),
          ),
          h('option', { value: 'second' }, 'Second'),
        ],
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.get('select').element.value).toBe('second')
  })
  it('hides a required placeholder and preserves an explicitly empty default', () => {
    const wrapper = render({ placeholder: 'Choose', required: true, defaultValue: '' })
    const placeholder = wrapper.get('option')
    expect(wrapper.get('select').element.value).toBe('')
    expect(placeholder.attributes('disabled')).toBeDefined()
    expect(placeholder.attributes('hidden')).toBeDefined()
    expect(wrapper.get('select').element.checkValidity()).toBe(false)
  })
  it('uses the placeholder text as the implicit default value like the React reference', () => {
    expect(render({ placeholder: 'banana' }).get('select').element.value).toBe('banana')
    expect(render({ placeholder: 'Choose' }).get('select').element.value).toBe('')
    expect(render({ placeholder: 'Choose', required: true }).get('select').element.value).toBe(
      'apple',
    )
  })
  it('keeps the upstream array value type and its single-select string conversion', () => {
    const wrapper = mount(Select, {
      props: { value: ['apple', 'banana'] },
      slots: {
        default: () => [
          h(Select.Option, { value: 'apple' }, () => 'Apple'),
          h(Select.Option, { value: 'apple,banana' }, () => 'Both'),
        ],
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.get('select').element.value).toBe('apple,banana')
    expect(render({ defaultValue: ['banana'] }).get('select').element.value).toBe('banana')
  })
  it('falls back to the first enabled option when a supplied value has no match', async () => {
    const wrapper = render({ value: 'missing' })
    expect(wrapper.get('select').element.value).toBe('apple')
    await wrapper.setProps({ value: 'banana' })
    expect(wrapper.get('select').element.value).toBe('banana')
    await wrapper.setProps({ value: 'still-missing' })
    expect(wrapper.get('select').element.value).toBe('apple')
    await wrapper.get('select').setValue('banana')
    expect(wrapper.get('select').element.value).toBe('apple')
    expect(render({ defaultValue: 'missing' }).get('select').element.value).toBe('apple')
  })
  it('restores controlled selection when slot-only option updates remove or reinsert its value', async () => {
    const items = ref(['apple', 'banana'])
    const wrapper = mount({
      setup: () => () =>
        h(Select, { value: 'banana' }, () =>
          items.value.map((value) => h('option', { value, key: value }, value)),
        ),
    })
    wrappers.push(wrapper)
    expect(wrapper.get('select').element.value).toBe('banana')
    items.value = ['cherry', 'banana']
    await nextTick()
    expect(wrapper.get('select').element.value).toBe('banana')
    items.value = ['cherry', 'date']
    await nextTick()
    expect(wrapper.get('select').element.value).toBe('cherry')
    items.value = ['banana', 'cherry', 'date']
    await nextTick()
    expect(wrapper.get('select').element.value).toBe('banana')
  })
  it('preserves an uncontrolled selection when defaultValue or placeholder changes', async () => {
    const wrapper = render({ defaultValue: 'banana' })
    await wrapper.get('select').setValue('apple')
    await wrapper.setProps({ defaultValue: 'banana', placeholder: 'banana' })
    expect(wrapper.get('select').element.value).toBe('apple')
  })
  it('uses native reset defaults for controlled and uncontrolled selections', async () => {
    const wrapper = mount({
      render: () => h('form', {}, h(Select as Component, { value: 'banana' }, options)),
    })
    wrappers.push(wrapper)
    const select = wrapper.get('select').element
    expect(select.value).toBe('banana')
    expect(Array.from(select.options).every((option) => !option.defaultSelected)).toBe(true)
    select.form!.reset()
    await nextTick()
    expect(select.value).toBe('apple')
  })
  it('forwards FormControl labels, required state, captions and validation', async () => {
    const wrapper = mount(FormControl, {
      props: { id: 'fruit-control', required: true },
      slots: {
        default: () => [
          h(FormControl.Label, {}, () => 'Fruit'),
          h(Select as Component, { defaultValue: '', placeholder: 'Choose' }, options),
          h(FormControl.Caption, {}, () => 'Choose one fruit'),
          h(FormControl.Validation, { variant: 'error' }, () => 'Fruit is required'),
        ],
      },
    })
    wrappers.push(wrapper)
    await nextTick()
    const select = wrapper.get('select')
    expect(select.attributes('id')).toBe('fruit-control')
    expect(wrapper.get('label').attributes('for')).toBe('fruit-control')
    expect(select.attributes('required')).toBeDefined()
    expect(select.attributes('aria-invalid')).toBe('true')
    expect(select.attributes('aria-describedby')).toBe(
      'fruit-control-validationMessage fruit-control-caption',
    )
    expect(select.element.checkValidity()).toBe(false)
  })
  it('restores controlled selection when a requested change is rejected', async () => {
    const change = vi.fn()
    const wrapper = render({ value: 'apple', onChange: change })
    await wrapper.get('select').setValue('banana')
    expect(wrapper.emitted('update:value')).toEqual([['banana']])
    expect(change).toHaveBeenCalledTimes(1)
    expect(change.mock.calls[0]?.[0]).toBeInstanceOf(Event)
    expect(wrapper.get('select').element.value).toBe('apple')
    await wrapper.setProps({ value: 'banana' })
    expect(wrapper.get('select').element.value).toBe('banana')
  })
  it('allows a change handler to unmount the controlled select before value restoration', async () => {
    const visible = ref(true)
    const wrapper = mount({
      setup: () => () =>
        visible.value
          ? h(Select, { value: 'apple', onChange: () => (visible.value = false) }, options)
          : null,
    })
    wrappers.push(wrapper)
    await wrapper.get('select').setValue('banana')
    expect(wrapper.find('select').exists()).toBe(false)
  })
  it('preserves form submission and resets an uncontrolled default', async () => {
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h('form', {}, h(Select as Component, { defaultValue: 'banana', name: 'fruit' }, options)),
      }),
      { attachTo: document.body },
    )
    wrappers.push(wrapper)
    const form = wrapper.element as HTMLFormElement
    expect(new FormData(form).get('fruit')).toBe('banana')
    await wrapper.get('select').setValue('apple')
    expect(new FormData(form).get('fruit')).toBe('apple')
    form.reset()
    await nextTick()
    expect(wrapper.get('select').element.value).toBe('banana')
  })
  it('forwards accessible descriptions, validation and exposed focus', () => {
    const wrapper = render(
      { validationStatus: 'error' },
      { id: 'fruit', 'aria-describedby': 'caption' },
    )
    expect(wrapper.get('select').attributes('id')).toBe('fruit')
    expect(wrapper.get('select').attributes('aria-describedby')).toBe('caption')
    expect(wrapper.get('select').attributes('aria-invalid')).toBe('true')
    wrapper.vm.focus({ preventScroll: true })
    expect(document.activeElement).toBe(wrapper.get('select').element)
  })
  it('renders selected options correctly in SSR', async () => {
    const output = await renderToString(
      createSSRApp({ render: () => h(Select as Component, { value: 'banana' }, options) }),
    )
    expect(output).toMatch(/<option[^>]*value="banana"[^>]*selected/)
    expect(output).not.toMatch(/<option[^>]*value="apple"[^>]*selected/)
  })
  it('supports raw native option children in SSR and controlled usage', async () => {
    const nativeOptions = () => [
      h('option', { value: 'first' }, 'First'),
      h('optgroup', { label: 'Other' }, h('option', { value: 'second' }, 'Second')),
    ]
    const output = await renderToString(
      createSSRApp({
        render: () => h(Select as Component, { defaultValue: 'second' }, nativeOptions),
      }),
    )
    expect(output).toMatch(/<option[^>]*value="second"[^>]*selected/)
    const wrapper = mount(Select, { props: { value: 'second' }, slots: { default: nativeOptions } })
    wrappers.push(wrapper)
    expect(wrapper.get('select').element.value).toBe('second')
    await wrapper.setProps({ value: 'first' })
    expect(wrapper.get('select').element.value).toBe('first')
  })
  it('uses native option text as its implicit value in SSR', async () => {
    const output = await renderToString(
      createSSRApp({
        render: () =>
          h(Select as Component, { defaultValue: 'Second' }, () => [
            h('option', {}, 'First'),
            h('option', {}, 'Second'),
          ]),
      }),
    )
    expect(output).toMatch(/<option selected[^>]*>Second<\/option>/)
    expect(output).not.toMatch(/<option selected[^>]*>First<\/option>/)
  })
  it('serializes an explicitly selected empty placeholder and hydrates its value', async () => {
    const renderSelect = () =>
      h(Select as Component, { placeholder: 'Choose', defaultValue: '', required: true }, options)
    const html = await renderToString(createSSRApp({ render: renderSelect }))
    expect(html).toMatch(/<option[^>]*value(?:="")?\s[^>]*selected/)
    const host = document.createElement('div')
    host.innerHTML = html
    document.body.appendChild(host)
    const app = createSSRApp({ render: renderSelect })
    app.mount(host)
    await nextTick()
    expect(host.querySelector('select')!.value).toBe('')
    expect(host.querySelector('select')!.checkValidity()).toBe(false)
    app.unmount()
  })
  it('initializes native options returned by a custom child component on mount and hydration', async () => {
    const RawOptions = {
      render: () => [
        h('option', { value: 'apple' }, 'Apple'),
        h('option', { value: 'banana' }, 'Banana'),
      ],
    }
    const renderSelect = () => h(Select, { defaultValue: 'banana' }, () => h(RawOptions))
    const wrapper = mount({ render: renderSelect })
    wrappers.push(wrapper)
    expect(wrapper.get('select').element.value).toBe('banana')
    const host = document.createElement('div')
    host.innerHTML = await renderToString(createSSRApp({ render: renderSelect }))
    document.body.appendChild(host)
    const app = createSSRApp({ render: renderSelect })
    app.mount(host)
    await nextTick()
    expect(host.querySelector('select')!.value).toBe('banana')
    app.unmount()
  })
})
