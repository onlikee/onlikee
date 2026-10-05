// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, type Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Select } from './index'

const wrappers: VueWrapper[] = []
const options = () => [h(Select.Option, { value: 'apple' }, () => 'Apple'), h(Select.OptGroup, { label: 'Others' }, () => h(Select.Option, { value: 'banana' }, () => 'Banana'))]
afterEach(() => { wrappers.splice(0).forEach(wrapper => wrapper.unmount()); document.body.innerHTML = '' })
function render(props = {}, attrs = {}) {
  const wrapper = mount(Select, { props, attrs, slots: { default: options }, attachTo: document.body })
  wrappers.push(wrapper)
  return wrapper
}
describe('Select native contract', () => {
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
    const wrapper = mount(Select, { slots: { default: () => [h('option', { value: 'first' }, 'First'), h('option', { value: 'second', selected: true }, 'Second')] } })
    wrappers.push(wrapper)
    expect(wrapper.get('select').element.value).toBe('second')
  })
  it('normalizes numeric select, option, and group styles while passing deprecated width props to the select as attributes', () => {
    const wrapper = mount(Select, { props: { width: 300, minWidth: 100, maxWidth: 400 }, attrs: { style: [{ fontSize: 16, width: 180 }, 'line-height:1.5;'] }, slots: { default: () => [h(Select.Option, { value: 'first', style: { fontSize: 12 } }, () => 'First'), h(Select.OptGroup, { label: 'Other', style: { paddingLeft: 8 } }, () => h(Select.Option, { value: 'second', selected: true }, () => 'Second'))] } })
    wrappers.push(wrapper)
    // 源行为：Select.tsx 只解构 block/children/className/defaultValue/disabled/placeholder/size/
    // required/validationStatus（src/Select/Select.tsx:37-47），width/minWidth/maxWidth 落入 ...rest
    // 并展开到 <select> 上成为原生属性（Select.tsx:59-60）；TextInputWrapper 不接收它们
    // （Select.tsx:52-58 仅传 block/disabled/size/validationStatus/className）。
    // 属性名经 DOM 小写化：minWidth → minwidth（与 React setAttribute 行为一致）。
    const select = wrapper.get('select')
    expect(select.attributes('width')).toBe('300')
    expect(select.attributes('minwidth')).toBe('100')
    expect(select.attributes('maxwidth')).toBe('400')
    expect((wrapper.get('[data-component="TextInput"]').element as HTMLElement).style.width).toBe('')
    expect(wrapper.get('select').element.style.width).toBe('180px')
    expect(wrapper.get('select').element.style.fontSize).toBe('16px')
    expect(wrapper.get('select').element.style.lineHeight).toBe('1.5')
    expect(wrapper.get('option').element.style.fontSize).toBe('12px')
    expect(wrapper.get('optgroup').element.style.paddingLeft).toBe('8px')
    expect(wrapper.get('select').element.value).toBe('second')
  })
  it('serializes object option values to "[object Object]" like React DOM (source quirk, do not fix)', async () => {
    // 源怪癖：Select.Option 即 <option {...props} data-component="Select.Option" />
    // （src/Select/Select.tsx:83-85），React DOM 将对象属性字符串化为 "[object Object]"。
    // 端口经由 Vue 属性/property 字符串化与 SelectNativeOptions.ts:18 的 String(props.value)
    // 选中比较路径复刻同一怪癖。
    const wrapper = mount(Select, { props: { value: '[object Object]' }, slots: { default: () => [h(Select.Option, { value: { id: 1 } as unknown as string }, () => 'Object'), h('option', { value: { id: 2 } }, 'RawObject')] } })
    wrappers.push(wrapper)
    await nextTick()
    const [first, second] = wrapper.findAll('option')
    expect((first!.element as HTMLOptionElement).value).toBe('[object Object]')
    expect((second!.element as HTMLOptionElement).value).toBe('[object Object]')
    expect(wrapper.get('select').element.value).toBe('[object Object]')
  })
  it('skips disabled option groups when selecting the native initial option', () => {
    const wrapper = mount(Select, { slots: { default: () => [h('optgroup', { label: 'Unavailable', disabled: true }, h('option', { value: 'first' }, 'First')), h('option', { value: 'second' }, 'Second')] } })
    wrappers.push(wrapper)
    expect(wrapper.get('select').element.value).toBe('second')
  })
  it('initializes the placeholder as empty and hides a required placeholder', () => {
    const wrapper = render({ placeholder: 'Choose', required: true })
    const placeholder = wrapper.get('option')
    expect(wrapper.get('select').element.value).toBe('')
    expect(placeholder.attributes('disabled')).toBeDefined()
    expect(placeholder.attributes('hidden')).toBeDefined()
    expect(wrapper.get('select').element.checkValidity()).toBe(false)
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
  it('preserves form submission and resets an uncontrolled default', async () => {
    const wrapper = mount(defineComponent({ setup: () => () => h('form', {}, h(Select as Component, { defaultValue: 'banana', name: 'fruit' }, options)) }), { attachTo: document.body })
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
    const wrapper = render({ validationStatus: 'error' }, { id: 'fruit', 'aria-describedby': 'caption' })
    expect(wrapper.get('select').attributes('id')).toBe('fruit')
    expect(wrapper.get('select').attributes('aria-describedby')).toBe('caption')
    expect(wrapper.get('select').attributes('aria-invalid')).toBe('true')
    wrapper.vm.focus({ preventScroll: true })
    expect(document.activeElement).toBe(wrapper.get('select').element)
  })
  it('renders selected options correctly in SSR', async () => {
    const output = await renderToString(createSSRApp({ render: () => h(Select as Component, { value: 'banana' }, options) }))
    expect(output).toMatch(/<option[^>]*value="banana"[^>]*selected/)
    expect(output).not.toMatch(/<option[^>]*value="apple"[^>]*selected/)
  })
  it('supports raw native option children in SSR and controlled usage', async () => {
    const nativeOptions = () => [h('option', { value: 'first' }, 'First'), h('optgroup', { label: 'Other' }, h('option', { value: 'second' }, 'Second'))]
    const output = await renderToString(createSSRApp({ render: () => h(Select as Component, { defaultValue: 'second' }, nativeOptions) }))
    expect(output).toMatch(/<option[^>]*value="second"[^>]*selected/)
    const wrapper = mount(Select, { props: { value: 'second' }, slots: { default: nativeOptions } })
    wrappers.push(wrapper)
    expect(wrapper.get('select').element.value).toBe('second')
    await wrapper.setProps({ value: 'first' })
    expect(wrapper.get('select').element.value).toBe('first')
  })
  it('uses native option text as its implicit value in SSR', async () => {
    const output = await renderToString(createSSRApp({ render: () => h(Select as Component, { defaultValue: 'Second' }, () => [h('option', {}, 'First'), h('option', {}, 'Second')]) }))
    expect(output).toMatch(/<option selected[^>]*>Second<\/option>/)
    expect(output).not.toMatch(/<option selected[^>]*>First<\/option>/)
  })
})
