// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Test fixtures intentionally render multiple components. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, ref, type Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { TextInput } from './index'
import { Textarea } from '../Textarea'

const wrappers: VueWrapper[] = []
afterEach(() => { wrappers.splice(0).forEach(wrapper => wrapper.unmount()); document.body.innerHTML = '' })

describe.each([
  ['TextInput', TextInput, 'input'],
  ['Textarea', Textarea, 'textarea'],
] as const)('%s native contract', (_name, component, selector) => {
  function render(props = {}, attrs = {}) {
    const wrapper = mount(component, { props, attrs, attachTo: document.body })
    wrappers.push(wrapper)
    return wrapper
  }
  it('preserves uncontrolled defaults and sends native change events while typing', async () => {
    const change = vi.fn()
    const wrapper = render({ defaultValue: 'start', onChange: change }, { id: 'native', name: 'field', readonly: true })
    const field = wrapper.get(selector)
    expect((field.element as HTMLInputElement).value).toBe('start')
    expect(field.attributes('name')).toBe('field')
    expect(field.attributes('readonly')).toBeDefined()
    await field.setValue('edited')
    expect(wrapper.emitted('update:value')).toEqual([['edited']])
    expect(change).toHaveBeenCalledTimes(1)
    expect(change.mock.calls[0]?.[0]).toBeInstanceOf(Event)
    expect((field.element as HTMLInputElement).value).toBe('edited')
    await wrapper.setProps({ defaultValue: 'later' })
    expect((field.element as HTMLInputElement).value).toBe('edited')
  })
  it('restores a controlled value and character counter if the parent rejects a change', async () => {
    const wrapper = render({ value: 'abc', characterLimit: 5 })
    await wrapper.get(selector).setValue('too long')
    expect(wrapper.emitted('update:value')).toEqual([['too long']])
    expect((wrapper.get(selector).element as HTMLInputElement).value).toBe('abc')
    expect(wrapper.text()).toContain('2 characters remaining')
    expect(wrapper.get(selector).attributes('aria-invalid')).not.toBe('true')
  })
  it('accepts named controlled updates and derives error styling without blocking text', async () => {
    const current = ref('')
    const wrapper = mount(defineComponent({ setup: () => () => h(component as Component, { value: current.value, characterLimit: 3, 'onUpdate:value': (next: string) => { current.value = next } }) }), { attachTo: document.body })
    wrappers.push(wrapper)
    await wrapper.get(selector).setValue('abcd')
    expect(current.value).toBe('abcd')
    expect(wrapper.text()).toContain('1 character over')
    expect(wrapper.get(selector).attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('[data-validation]').attributes('data-validation')).toBe('error')
    await wrapper.get(selector).setValue('ab')
    expect(wrapper.text()).toContain('1 character remaining')
    expect(wrapper.find('[data-validation]').exists()).toBe(false)
  })
  it('keeps composition input until compositionend and commits once', async () => {
    const wrapper = render()
    const field = wrapper.get(selector)
    await field.trigger('compositionstart')
    ;(field.element as HTMLInputElement).value = '输入'
    await field.trigger('input', { isComposing: true })
    expect(wrapper.emitted('update:value')).toBeUndefined()
    await field.trigger('compositionend')
    await field.trigger('input')
    expect(wrapper.emitted('update:value')).toEqual([['输入']])
  })
  it('combines character-limit descriptions with existing accessible hints', () => {
    const wrapper = render({ characterLimit: 1, defaultValue: 'x' }, { 'aria-describedby': 'caption validation' })
    const ids = wrapper.get(selector).attributes('aria-describedby')?.split(' ')
    expect(ids).toHaveLength(3)
    expect(ids?.slice(1)).toEqual(['caption', 'validation'])
    expect(wrapper.find(`#${ids?.[0]}`).text()).toBe('You can enter up to 1 character')
    expect(wrapper.text()).toContain('0 characters remaining')
  })
  it('preserves explicit accessible invalid/required attributes over defaults', () => {
    const wrapper = render({ required: false, validationStatus: 'success' }, { 'aria-invalid': 'true', 'aria-required': 'true' })
    expect(wrapper.get(selector).attributes('aria-invalid')).toBe('true')
    expect(wrapper.get(selector).attributes('aria-required')).toBe('true')
  })
  it('allows explicit null ARIA attributes to clear derived validation and required state', () => {
    const wrapper = render({ required: true, validationStatus: 'error' }, { 'aria-invalid': null, 'aria-required': null })
    expect(wrapper.get(selector).attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.get(selector).attributes('aria-required')).toBeUndefined()
  })
  it('updates native description IDs when only a parent attribute changes', async () => {
    const description = ref('caption')
    const wrapper = mount(defineComponent({ setup: () => () => h(component as Component, { 'aria-describedby': description.value }) }))
    wrappers.push(wrapper)
    expect(wrapper.get(selector).attributes('aria-describedby')).toBe('caption')
    description.value = 'validation caption'
    await nextTick()
    expect(wrapper.get(selector).attributes('aria-describedby')).toBe('validation caption')
    description.value = ''
    await nextTick()
    expect(wrapper.get(selector).attributes('aria-describedby')).toBeUndefined()
  })
  it('restores native form defaults without emitting change on reset', async () => {
    const wrapper = mount(defineComponent({ setup: () => () => h('form', {}, h(component as Component, { defaultValue: 'original' })) }), { attachTo: document.body })
    wrappers.push(wrapper)
    await wrapper.get(selector).setValue('edited')
    ;(wrapper.element as HTMLFormElement).reset()
    await nextTick()
    expect((wrapper.get(selector).element as HTMLInputElement).value).toBe('original')
  })
  it('renders stable accessible counter IDs in SSR and has no DOM requirement', async () => {
    const app = () => createSSRApp({ render: () => h(component as Component, { id: 'field', defaultValue: 'ab', characterLimit: 5, required: true, disabled: true }) })
    const first = await renderToString(app())
    expect(first).toBe(await renderToString(app()))
    expect(first).toContain('aria-required="true"')
    expect(first).toContain('3 characters remaining')
    expect(first).toContain('disabled')
  })
})

describe('TextInput visual and action slots', () => {
  it('uses explicit visual props before slots and connects visible text descriptions', () => {
    const wrapper = mount(TextInput, { props: { leadingVisual: '$', trailingVisual: '.com' }, attrs: { 'aria-describedby': 'hint' }, slots: { leadingVisual: 'ignored', trailingAction: () => h(TextInput.Action, { 'aria-label': 'Clear' }) } })
    wrappers.push(wrapper)
    expect(wrapper.text()).toContain('$')
    expect(wrapper.text()).not.toContain('ignored')
    expect(wrapper.get('input').attributes('aria-describedby')?.split(' ')).toHaveLength(3)
    expect(wrapper.get('button').attributes('type')).toBe('button')
    expect(wrapper.find('[data-component="TextInput.Action"]').exists()).toBe(true)
  })
  it('supports trailingAction VNodes and shows its label as a focus tooltip', async () => {
    const click = vi.fn()
    const wrapper = mount(TextInput, { props: { trailingAction: h(TextInput.Action, { 'aria-label': 'Clear input', onClick: click }, () => 'Clear') }, attachTo: document.body })
    wrappers.push(wrapper)
    expect(wrapper.get('[data-component="TextInput"]').attributes('data-no-trailing-action')).toBeUndefined()
    const button = wrapper.get('button')
    const tooltip = document.body.querySelector('[role="tooltip"]')
    expect(tooltip?.textContent).toBe('Clear input')
    button.element.focus()
    await nextTick()
    expect(tooltip?.classList.contains(':popover-open')).toBe(true)
    await button.trigger('click')
    expect(click).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(wrapper.get('input').element)
    // 点击后 TextInput 把焦点移入 input → button blur → TooltipV2 关闭气泡
    await nextTick()
    expect(tooltip?.classList.contains(':popover-open')).toBe(false)
  })
  it('renders the icon-only action as an IconButton with a label tooltip', async () => {
    const icon = defineComponent({ name: 'ClearIcon', render: () => h('svg', { 'data-component': 'Octicon' }) })
    const wrapper = mount(TextInput.Action, { props: { icon, tooltipDirection: 'nw' }, attrs: { 'aria-label': 'Clear' }, attachTo: document.body })
    wrappers.push(wrapper)
    const button = wrapper.get('button')
    expect(button.attributes('data-component')).toBe('IconButton')
    expect(button.attributes('data-size')).toBe('small')
    expect(button.attributes('type')).toBe('button')
    expect(button.classes()).toContain('text-input-action-invisible')
    expect(wrapper.find('.text-input-action').exists()).toBe(true)
    // label 型气泡：无 role=tooltip，aria-labelledby 指向气泡 id，aria-label 被移除（IconButton 语义）
    const tooltip = document.body.querySelector('[data-component="Tooltip"][data-direction="nw"]')
    expect(tooltip).toBeTruthy()
    expect(tooltip?.getAttribute('role')).toBeNull()
    expect(tooltip?.textContent).toContain('Clear')
    expect(tooltip?.id).toBeTruthy()
    expect(button.attributes('aria-labelledby')).toBe(tooltip?.id)
    expect(button.attributes('aria-label')).toBeUndefined()
  })
  it('calls the trailing action before focusing the native input', async () => {
    const order: string[] = []
    const wrapper = mount(TextInput, { props: { trailingAction: h(TextInput.Action, { 'aria-label': 'Clear input', onClick: () => order.push('action') }), onFocus: () => order.push('input focus') }, attachTo: document.body })
    wrappers.push(wrapper)
    await wrapper.get('button').trigger('click')
    expect(order).toEqual(['action', 'input focus'])
    expect(document.activeElement).toBe(wrapper.get('input').element)
  })
  it('uses component visuals and focuses when the leading visual is clicked', async () => {
    const icon = defineComponent({ setup: () => () => h('svg', { 'aria-label': 'Search' }) })
    const wrapper = mount(TextInput, { props: { leadingVisual: icon }, attachTo: document.body })
    wrappers.push(wrapper)
    await wrapper.get('svg').trigger('click')
    expect(document.activeElement).toBe(wrapper.get('input').element)
    expect(wrapper.get('input').attributes('aria-describedby')).toBe(wrapper.get('[data-component="TextInput.LeadingVisual"]').attributes('id'))
  })
  it('describes loading and preserves visual slots across loader transitions', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    const wrapper = mount(TextInput, { props: { loading: false, leadingVisual: 'Search', loaderText: 'Finding items' } })
    wrappers.push(wrapper)
    const leadingId = wrapper.get('[data-component="TextInput.LeadingVisual"] [id]').attributes('id')
    await wrapper.setProps({ loading: true })
    expect(wrapper.get('[aria-busy]').attributes('aria-busy')).toBe('true')
    const ids = wrapper.get('input').attributes('aria-describedby')?.split(' ')
    expect(ids?.[0]).toBe(leadingId)
    expect(wrapper.get(`#${ids?.[1]}`).text()).toBe('Finding items')
    expect(wrapper.get('[data-component="TextInput.LeadingVisual"] .visual-hidden').text()).toBe('Search')
    await wrapper.setProps({ loading: false })
    expect(wrapper.get('input').attributes('aria-describedby')).toBe(leadingId)
  })
  it('keeps width styling on the wrapper and native inline styles on the input', () => {
    const wrapper = mount(TextInput, { props: { width: 240, minWidth: 100, style: { fontWeight: 600 } } })
    wrappers.push(wrapper)
    expect((wrapper.get('[data-component="TextInput"]').element as HTMLElement).style.width).toBe('240px')
    expect((wrapper.get('[data-component="TextInput"]').element as HTMLElement).style.minWidth).toBe('100px')
    expect(wrapper.get('input').element.style.fontWeight).toBe('600')
  })
  it('normalizes numeric native styles and preserves Vue style arrays', () => {
    const wrapper = mount(TextInput, { props: { width: 240, style: [{ width: 180, fontSize: 16, lineHeight: 1.5, fontWeight: 600 }, 'color: red;', { '--custom': 8 }] } })
    wrappers.push(wrapper)
    const field = wrapper.get('input').element
    expect((wrapper.get('[data-component="TextInput"]').element as HTMLElement).style.width).toBe('240px')
    expect(field.style.width).toBe('180px')
    expect(field.style.fontSize).toBe('16px')
    expect(field.style.lineHeight).toBe('1.5')
    expect(field.style.fontWeight).toBe('600')
    expect(field.style.color).toBe('red')
    expect(field.style.getPropertyValue('--custom')).toBe('8')
  })
  it('exposes input focus and sends native focus/blur events', async () => {
    const wrapper = mount(TextInput, { attachTo: document.body })
    wrappers.push(wrapper)
    wrapper.vm.focus({ preventScroll: true })
    expect(document.activeElement).toBe(wrapper.get('input').element)
    wrapper.vm.blur()
    expect(wrapper.emitted('focus')?.[0]?.[0]).toBeInstanceOf(FocusEvent)
    expect(wrapper.emitted('blur')?.[0]?.[0]).toBeInstanceOf(FocusEvent)
  })
})

describe('Textarea sizing', () => {
  it('lets explicit numeric and array styles override height limits during automatic sizing', async () => {
    const wrapper = mount(Textarea, { props: { autoSize: true, minHeight: 10, maxHeight: 40, style: ['font-size:16px;', { minHeight: 20, maxHeight: 80, lineHeight: 1.5 }] } })
    wrappers.push(wrapper)
    const element = wrapper.get('textarea').element
    Object.defineProperty(element, 'scrollHeight', { value: 100, configurable: true })
    await wrapper.get('textarea').setValue('long content')
    expect(element.style.minHeight).toBe('20px')
    expect(element.style.maxHeight).toBe('80px')
    expect(element.style.height).toBe('80px')
    expect(element.style.fontSize).toBe('16px')
    expect(element.style.lineHeight).toBe('1.5')
  })
  it('preserves native data attribute priority over generated metadata', () => {
    const wrapper = mount(Textarea, { props: { autoSize: true, resize: 'vertical' }, attrs: { 'data-component': 'CustomTextarea', 'data-resize': 'none', 'data-auto-size': null } })
    wrappers.push(wrapper)
    expect(wrapper.get('textarea').attributes('data-component')).toBe('CustomTextarea')
    expect(wrapper.get('textarea').attributes('data-resize')).toBe('none')
    expect(wrapper.get('textarea').attributes('data-auto-size')).toBeUndefined()
  })
  it('disables automatic height when the native data-auto-size attribute overrides the prop', async () => {
    const wrapper = mount(Textarea, { props: { autoSize: true, style: { height: 60 } }, attrs: { 'data-auto-size': false } })
    wrappers.push(wrapper)
    const element = wrapper.get('textarea').element
    Object.defineProperty(element, 'scrollHeight', { value: 200, configurable: true })
    await wrapper.get('textarea').setValue('long content')
    expect(element.style.height).toBe('60px')
    expect(wrapper.get('textarea').attributes('data-auto-size')).toBe('false')
  })
  it('restores content height after a controlled edit is rejected', async () => {
    const wrapper = mount(Textarea, { props: { value: 'a', autoSize: true } })
    wrappers.push(wrapper)
    const element = wrapper.get('textarea').element
    Object.defineProperty(element, 'scrollHeight', { get: () => element.value.length * 20, configurable: true })
    await wrapper.get('textarea').setValue('long rejected edit')
    expect(element.value).toBe('a')
    expect(element.style.height).toBe('20px')
  })
  it('preserves an explicit native height when automatic sizing is disabled', async () => {
    const wrapper = mount(Textarea, { props: { style: { height: '120px' } } })
    wrappers.push(wrapper)
    expect(wrapper.get('textarea').element.style.height).toBe('120px')
    await wrapper.setProps({ autoSize: true })
    const element = wrapper.get('textarea').element
    Object.defineProperty(element, 'scrollHeight', { value: 200, configurable: true })
    await wrapper.get('textarea').setValue('long content')
    expect(element.style.height).toBe('200px')
    await wrapper.setProps({ autoSize: false })
    expect(element.style.height).toBe('120px')
  })
  it('uses reference rows, columns and resize defaults', () => {
    const wrapper = mount(Textarea)
    wrappers.push(wrapper)
    expect(wrapper.get('textarea').attributes('rows')).toBe('7')
    expect(wrapper.get('textarea').attributes('cols')).toBe('30')
    expect(wrapper.get('textarea').attributes('data-resize')).toBe('both')
  })
  it('grows within min and max height and removes automatic height when disabled', async () => {
    const wrapper = mount(Textarea, { props: { autoSize: true, minHeight: 40, maxHeight: 80 } })
    wrappers.push(wrapper)
    const element = wrapper.get('textarea').element
    Object.defineProperty(element, 'scrollHeight', { value: 100, configurable: true })
    await wrapper.get('textarea').setValue('long content')
    expect(element.style.height).toBe('80px')
    await wrapper.setProps({ autoSize: false })
    expect(element.style.height).toBe('')
  })
})
