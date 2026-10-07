// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Test fixtures exercise controlled component composition. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, type Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import TextInputWithTokens from './TextInputWithTokens.vue'
import Token from '../Token'
import type { TextInputWithTokensProps } from './types'

const tokens = [ { id: 'one', text: 'One' }, { id: 'two', text: 'Two' }, { id: 'three', text: 'Three' } ]
const mounted: VueWrapper[] = []
const tick = async () => { await nextTick(); await nextTick(); await nextTick() }
function setup(props: Partial<Omit<TextInputWithTokensProps, 'tokenComponent'>> & { tokenComponent?: Component } = {}) {
  const wrapper = mount(TextInputWithTokens, { props: { tokens, ...props }, attachTo: document.body })
  mounted.push(wrapper)
  return wrapper
}
beforeEach(() => { vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))) })
afterEach(() => { mounted.splice(0).forEach(wrapper => wrapper.unmount()); document.body.innerHTML = ''; vi.useRealTimers() })

describe('TextInputWithTokens source contract', () => {
  it('renders source component attributes and the native input', () => {
    const wrapper = setup({ id: 'tokens', name: 'tokens', leadingVisual: 'Prefix', trailingVisual: 'Suffix' })
    expect(wrapper.attributes('data-component')).toBe('TextInputWithTokens')
    expect(wrapper.get('input').attributes('data-component')).toBe('TextInputWithTokens.Input')
    expect(wrapper.get('input').attributes('id')).toBe('tokens')
    expect(wrapper.findAll('[data-component="TextInputWithTokens.Token"]')).toHaveLength(3)
    expect(wrapper.get('[data-component="TextInputWithTokens.LeadingVisual"]').text()).toBe('Prefix')
    expect(wrapper.get('[data-component="TextInputWithTokens.TrailingVisual"]').text()).toBe('Suffix')
  })

  it('supports default value, controlled zero and named value updates', async () => {
    const wrapper = setup({ defaultValue: 'hello' })
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('hello')
    await wrapper.get('input').setValue('typed')
    expect(wrapper.emitted('update:value')?.[0]).toEqual(['typed'])
    await wrapper.setProps({ value: 0 })
    await wrapper.get('input').setValue('rejected'); await tick()
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('0')
  })

  it('submits native values and resets without producing change callbacks', async () => {
    const wrapper = mount(defineComponent({ setup: () => () => h('form', [h(TextInputWithTokens, { tokens: [], name: 'tags', defaultValue: 'Default' })]) }), { attachTo: document.body })
    mounted.push(wrapper)
    const control = wrapper.getComponent(TextInputWithTokens)
    await control.get('input').setValue('Edited')
    expect(new FormData(wrapper.element as HTMLFormElement).get('tags')).toBe('Edited')
    const changeCount = control.emitted('change')?.length
    ;(wrapper.element as HTMLFormElement).reset(); await tick()
    expect(new FormData(wrapper.element as HTMLFormElement).get('tags')).toBe('Default')
    expect(control.emitted('change')).toHaveLength(changeCount!)
    const removed = vi.spyOn(wrapper.element, 'removeEventListener')
    wrapper.unmount()
    expect(removed).toHaveBeenCalledWith('reset', expect.any(Function))
    mounted.pop()
  })

  it('does not update the model until composition finishes', async () => {
    const wrapper = setup()
    const input = wrapper.get('input')
    await input.trigger('compositionstart')
    ;(input.element as HTMLInputElement).value = '拼'
    await input.trigger('input')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    await input.trigger('compositionend')
    expect(wrapper.emitted('update:value')).toEqual([['拼']])
    await input.trigger('input', { isComposing: false })
    expect(wrapper.emitted('update:value')).toEqual([['拼']])
    await input.setValue('拼音')
    expect(wrapper.emitted('update:value')).toEqual([['拼'], ['拼音']])
  })

  it('emits change during typing without repeating it for native commit', async () => {
    const change = vi.fn()
    const wrapper = setup({ onChange: change })
    const input = wrapper.get('input')
    ;(input.element as HTMLInputElement).value = 'typed'
    await input.trigger('input')
    expect(change).toHaveBeenCalledTimes(1)
    expect(change).toHaveBeenCalledWith(expect.objectContaining({ type: 'input' }))
    await input.trigger('change')
    expect(change).toHaveBeenCalledTimes(1)
    await input.trigger('compositionstart')
    ;(input.element as HTMLInputElement).value = '拼'
    await input.trigger('input')
    expect(change).toHaveBeenCalledTimes(1)
    await input.trigger('compositionend')
    expect(change).toHaveBeenCalledTimes(2)
  })

  it('gives per-token rest props priority over collection defaults', async () => {
    const onRemove = vi.fn()
    const wrapper = setup({ hideTokenRemoveButtons: true, tokens: [{ id: 'override', text: 'Override', size: 'small', hideRemoveButton: false, onRemove }] })
    const token = wrapper.get('[data-component="TextInputWithTokens.Token"]')
    expect(token.attributes('data-size')).toBe('small')
    expect(token.attributes('id')).toBeUndefined()
    expect(token.find('button').exists()).toBe(false)
    await token.get('[class*="token__remove_"]').trigger('click')
    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('token-remove')).toBeUndefined()
  })

  it('preserves explicit ARIA overrides and converts numeric dimensions to pixels', () => {
    const wrapper = setup({ validationStatus: 'error', 'aria-invalid': false, maxHeight: 100, width: 320, minWidth: 100, maxWidth: 500 })
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('false')
    const root = wrapper.element as HTMLElement
    expect(root.style.maxHeight).toBe('100px')
    expect(root.style.width).toBe('320px')
    expect(root.style.minWidth).toBe('100px')
    expect(root.style.maxWidth).toBe('500px')
    const cleared = setup({ validationStatus: 'error', 'aria-invalid': undefined })
    expect(cleared.get('input').attributes('aria-invalid')).toBeUndefined()
  })

  it('retains visual nodes under an overlaid loader and reserves its slot while idle', async () => {
    const wrapper = setup({ leadingVisual: 'Wide leading', trailingVisual: 'Trailing', loading: true })
    const leading = wrapper.get('[data-component="TextInputWithTokens.LeadingVisual"]')
    const trailing = wrapper.get('[data-component="TextInputWithTokens.TrailingVisual"]')
    expect(leading.get('div[class*="visual-hidden_"]').text()).toBe('Wide leading')
    expect(leading.find('[class*="visual-spinner-overlay_"]').exists()).toBe(true)
    expect(trailing.find('[class*="visual-hidden_"]').exists()).toBe(true)
    await wrapper.setProps({ loading: false })
    expect(leading.find('[class*="visual-hidden_"]').exists()).toBe(true)
    expect(leading.get('[class*="visual-box_"]').text()).toBe('Wide leading')
    const idle = setup({ tokens: [], loading: false })
    expect(idle.find('[data-component="TextInputWithTokens.LeadingVisual"]').exists()).toBe(false)
    expect(idle.find('[data-component="TextInputWithTokens.TrailingVisual"]').exists()).toBe(true)
  })

  it('preserves numeric style dimensions and unitless values on the wrapper', () => {
    const wrapper = setup({ maxHeight: 100, style: [{ width: 280, maxHeight: 80, fontSize: 16, opacity: 0.7, lineHeight: 1.4 }, { '--custom-value': 4 }] })
    const root = wrapper.element as HTMLElement
    expect(root.style.width).toBe('280px')
    expect(root.style.maxHeight).toBe('80px')
    expect(root.style.fontSize).toBe('16px')
    expect(root.style.opacity).toBe('0.7')
    expect(root.style.lineHeight).toBe('1.4')
    expect(root.style.getPropertyValue('--custom-value')).toBe('4')
  })

  it('describes selected text to comboboxes without losing existing descriptions', () => {
    const wrapper = setup({ role: 'combobox', 'aria-describedby': 'caption' })
    const describedBy = wrapper.get('input').attributes('aria-describedby')!.split(' ')
    expect(describedBy[0]).toBe('caption')
    expect(document.getElementById(describedBy[1]!)?.textContent).toBe('Selected: One, Two, Three')
    const plain = setup({ 'aria-describedby': 'caption' })
    expect(plain.get('input').attributes('aria-describedby')).toBe('caption')
  })

  it('truncates tokens, expands on focus and restores truncation on outside blur', async () => {
    vi.useFakeTimers()
    const wrapper = setup({ visibleTokenCount: 1 })
    expect(wrapper.findAll('[data-component="TextInputWithTokens.Token"]')).toHaveLength(1)
    expect(wrapper.get('[data-component="TextInputWithTokens.OverflowCount"]').text()).toBe('+2')
    ;(wrapper.get('input').element as HTMLInputElement).focus(); await tick()
    expect(wrapper.findAll('[data-component="TextInputWithTokens.Token"]')).toHaveLength(3)
    ;(wrapper.get('input').element as HTMLInputElement).blur()
    vi.runAllTimers(); await tick()
    expect(wrapper.findAll('[data-component="TextInputWithTokens.Token"]')).toHaveLength(1)
  })

  it('keeps tokens expanded when focus moves from input to a token', async () => {
    vi.useFakeTimers()
    const wrapper = setup({ visibleTokenCount: 1 })
    ;(wrapper.get('input').element as HTMLInputElement).focus(); await tick()
    ;(wrapper.get('[data-component="TextInputWithTokens.Token"]').element as HTMLElement).focus()
    vi.runAllTimers(); await tick()
    expect(wrapper.findAll('[data-component="TextInputWithTokens.Token"]')).toHaveLength(3)
  })

  it('removes the last token from an empty input and selects its text for editing', async () => {
    vi.useFakeTimers()
    const wrapper = setup()
    const input = wrapper.get('input')
    ;(input.element as HTMLInputElement).focus()
    await input.trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('token-remove')).toEqual([['three']])
    expect((input.element as HTMLInputElement).value).toBe('Three ')
    vi.runAllTimers(); await tick()
    expect((input.element as HTMLInputElement).selectionStart).toBe(0)
    expect((input.element as HTMLInputElement).selectionEnd).toBe(6)
  })

  it('does not remove tokens when the input has text or is composing', async () => {
    const wrapper = setup({ defaultValue: 'text' })
    const input = wrapper.get('input')
    await input.trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('token-remove')).toBeUndefined()
    await input.setValue('')
    await input.trigger('compositionstart')
    await input.trigger('keydown', { key: 'Backspace', isComposing: true })
    expect(wrapper.emitted('token-remove')).toBeUndefined()
  })

  it('removes a focused token and restores focus to the next surviving token', async () => {
    vi.useFakeTimers()
    const state = ref([...tokens])
    const wrapper = mount(defineComponent({ setup: () => () => h(TextInputWithTokens, {
      tokens: state.value, onTokenRemove: (id: string | number) => { state.value = state.value.filter(token => token.id !== id) }
    }) }), { attachTo: document.body })
    mounted.push(wrapper)
    const token = wrapper.get('[data-component="TextInputWithTokens.Token"]')
    ;(token.element as HTMLElement).focus()
    await token.trigger('keydown', { key: 'Delete' }); await tick()
    vi.runAllTimers(); await tick()
    expect(state.value.map(token => token.id)).toEqual(['two', 'three'])
    expect(document.activeElement?.textContent).toContain('Two')
  })

  it('restores input focus after the final token is removed', async () => {
    vi.useFakeTimers()
    const state = ref(tokens.slice(0, 1))
    const wrapper = mount(defineComponent({ setup: () => () => h(TextInputWithTokens, {
      tokens: state.value, onTokenRemove: () => { state.value = [] }
    }) }), { attachTo: document.body })
    mounted.push(wrapper)
    const token = wrapper.get('[data-component="TextInputWithTokens.Token"]')
    ;(token.element as HTMLElement).focus()
    await token.trigger('keydown', { key: 'Backspace' }); await tick()
    vi.runAllTimers(); await tick()
    expect(document.activeElement).toBe(wrapper.get('input').element)
  })

  it('supports horizontal token navigation and Escape to input', async () => {
    const wrapper = setup()
    await tick()
    const first = wrapper.get('[data-component="TextInputWithTokens.Token"]')
    ;(first.element as HTMLElement).focus()
    await first.trigger('keydown', { key: 'ArrowRight' }); await tick()
    expect(document.activeElement?.textContent).toContain('Two')
    await wrapper.get('[data-is-selected="true"]').trigger('keyup', { key: 'Escape' }); await tick()
    expect(document.activeElement).toBe(wrapper.get('input').element)
  })

  it('leaves native input disabled while preserving source token removal quirks', async () => {
    const wrapper = setup({ disabled: true })
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    expect(wrapper.findAll('button')).toHaveLength(0)
    const token = wrapper.get('[data-component="TextInputWithTokens.Token"]')
    expect(token.attributes('tabindex')).toBe('0')
    expect(token.attributes('disabled')).toBe('')
    expect(token.attributes('aria-disabled')).toBeUndefined()
    await token.trigger('keydown', { key: 'Delete' })
    expect(wrapper.emitted('token-remove')).toEqual([['one']])
  })

  it('supports a custom token component and explicit visual props over slots', () => {
    const custom = defineComponent({ props: { text: { type: String, required: true } }, setup: props => () => h('button', props.text) })
    const wrapper = setup({ tokenComponent: custom })
    expect(wrapper.findAll('[data-component="TextInputWithTokens.Token"]')).toHaveLength(3)
    const visual = mount(TextInputWithTokens, { props: { tokens: [], leadingVisual: 'prop' }, slots: { leadingVisual: 'slot' } })
    mounted.push(visual)
    expect(visual.text()).toContain('prop')
    expect(visual.text()).not.toContain('slot')
  })

  it('exposes input ref/focus and has stable accessible SSR output', async () => {
    const wrapper = setup()
    const exposed = wrapper.vm as unknown as { input: HTMLInputElement, focus: () => void }
    expect(exposed.input).toBe(wrapper.get('input').element)
    exposed.focus()
    expect(document.activeElement).toBe(exposed.input)
    const markup = await renderToString(h(TextInputWithTokens, { tokens, id: 'ssr', role: 'combobox', 'aria-describedby': 'caption' }))
    expect(markup).toContain('Selected: One, Two, Three')
    expect(markup).toContain('aria-describedby="caption ')
  })
})

describe('Token source contract', () => {
  it('normalizes numeric styles while preserving explicit border and unitless overrides', () => {
    const wrapper = mount(Token, { props: { text: 'Styled' }, attrs: { style: { width: 100, fontSize: 16, borderWidth: 2, opacity: 0.7 } } })
    mounted.push(wrapper)
    const root = wrapper.element as HTMLElement
    expect(root.style.width).toBe('100px')
    expect(root.style.fontSize).toBe('16px')
    expect(root.style.borderWidth).toBe('2px')
    expect(root.style.opacity).toBe('0.7')
  })
  it('splits interactive text and removal into separate action targets', async () => {
    const remove = vi.fn(), click = vi.fn()
    const wrapper = mount(Token, { props: { as: 'button', text: 'Token', onRemove: remove }, attrs: { onClick: click } })
    mounted.push(wrapper)
    expect(wrapper.element.tagName).toBe('SPAN')
    const text = wrapper.get('button[class*="token__text_"]')
    const action = wrapper.get('span[class*="token__remove_"]')
    expect(action.attributes('aria-hidden')).toBe('true')
    expect(action.attributes('tabindex')).toBe('-1')
    await text.trigger('click')
    expect(click).toHaveBeenCalledTimes(1)
    expect(remove).not.toHaveBeenCalled()
    await action.trigger('click')
    expect(remove).toHaveBeenCalledTimes(1)
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('retains one interactive root when remove is hidden and a native remove button for plain tokens', () => {
    const button = mount(Token, { props: { as: 'button', text: 'Button', onRemove: vi.fn(), hideRemoveButton: true } })
    mounted.push(button)
    expect(button.element.tagName).toBe('BUTTON')
    expect(button.find('[class*="token__remove_"]').exists()).toBe(false)
    const plain = mount(Token, { props: { text: 'Plain', onRemove: vi.fn() } })
    mounted.push(plain)
    expect(plain.get('[class*="token__remove_"]').element.tagName).toBe('BUTTON')
    expect(plain.get('[class*="token__remove_"]').attributes('aria-hidden')).toBe('false')
    const focusable = mount(Token, { props: { text: 'Focusable', onRemove: vi.fn() }, attrs: { tabindex: 0 } })
    mounted.push(focusable)
    expect(focusable.get('[class*="token__remove_"]').element.tagName).toBe('SPAN')
    expect(focusable.get('[class*="token__remove_"]').attributes('aria-hidden')).toBe('true')
  })

  it('supports mouse and keyboard removal without propagating click', async () => {
    const remove = vi.fn(), parent = vi.fn()
    const wrapper = mount(defineComponent({ setup: () => () => h('div', { onClick: parent }, [h(Token, { text: 'Token', onRemove: remove })]) }))
    mounted.push(wrapper)
    await wrapper.get('button').trigger('click')
    expect(remove).toHaveBeenCalledTimes(1)
    expect(parent).not.toHaveBeenCalled()
    await wrapper.get('[class*="token_"]').trigger('keydown', { key: 'Delete' })
    expect(remove).toHaveBeenCalledTimes(2)
  })
})
