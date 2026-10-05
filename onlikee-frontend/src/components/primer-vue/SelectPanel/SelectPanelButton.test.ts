// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import SelectPanelButton from './SelectPanelButton.vue'
import { registerEscapeHandler } from '../internal/documentRegistries'

// 回归测试：SelectPanelButton 重写批次（审计 M12/M13/M14 + L11/L14/L15/L16）。
// 对照 Primer React 8c0b708 Button/ButtonBase.tsx、Button/IconButton.tsx、TooltipV2/Tooltip.tsx。
const wrappers: VueWrapper[] = []
const unregisters: Array<() => void> = []
async function settle() { await nextTick(); await flushPromises(); await nextTick() }
const IconStub = defineComponent({ name: 'IconStub', render: () => h('svg', { 'data-component': 'Octicon' }) })
// 不自带 data-component 的图标桩：验证 Octicon 标记由渲染位点注入
const PlainIconStub = defineComponent({ name: 'PlainIconStub', render: () => h('svg', { 'data-octicon': 'eye' }) })
// Spinner 依赖 window.matchMedia（与 SelectPanel.test.ts 相同的 jsdom 垫片）
beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn((media: string) => ({ matches: false, media, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
})
afterEach(() => {
  unregisters.splice(0).forEach(unregister => unregister())
  wrappers.forEach(wrapper => wrapper.unmount()); wrappers.length = 0
  document.body.innerHTML = ''
  vi.restoreAllMocks(); vi.useRealTimers()
})
function track<T extends VueWrapper>(wrapper: T): T { wrappers.push(wrapper); return wrapper }

describe('SelectPanelButton (ButtonBase + IconButton fusion)', () => {
  it('renders base button semantics without a wrapper while loading is undefined (L14)', async () => {
    const wrapper = track(mount(SelectPanelButton, { props: {}, slots: { default: 'Save' }, attachTo: document.body }))
    await settle()
    const button = wrapper.get('button')
    expect(button.attributes('data-component')).toBe('Button')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('data-loading')).toBe('false')
    expect(button.attributes('data-size')).toBe('medium')
    expect(button.attributes('data-variant')).toBe('default')
    expect(button.classes()).toContain('select-panel-button')
    expect(wrapper.find('div[data-loading-wrapper]').exists()).toBe(false)
    const content = button.get('[data-component="buttonContent"]')
    expect(content.attributes('data-align')).toBe('center')
    expect(button.get('[data-component="text"]').text()).toBe('Save')
  })

  it('honors explicit type, anchor semantics, and the icon-button default type (L14)', async () => {
    const submit = track(mount(SelectPanelButton, { props: { type: 'submit' }, slots: { default: 'Go' }, attachTo: document.body }))
    await settle()
    expect(submit.get('button').attributes('type')).toBe('submit')
    const anchor = track(mount(SelectPanelButton, { props: { as: 'a' }, attrs: { href: '#' }, slots: { default: 'Link' }, attachTo: document.body }))
    await settle()
    expect(anchor.get('a').attributes('type')).toBeUndefined()
    const icon = track(mount(SelectPanelButton, { props: { icon: IconStub }, attrs: { 'aria-label': 'Close' }, attachTo: document.body }))
    await settle()
    expect(icon.get('button').attributes('type')).toBe('button')
    expect(icon.get('button').attributes('data-component')).toBe('IconButton')
    expect(icon.find('button svg[data-component="Octicon"]').exists()).toBe(true)
  })

  it('treats whitespace-only children as content like React children (L15)', async () => {
    const wrapper = track(mount(SelectPanelButton, { props: {}, slots: { default: () => ' ' }, attachTo: document.body }))
    await settle()
    expect(wrapper.find('[data-component="text"]').exists()).toBe(true)
  })

  it('seeds ids from the user id and renders the custom loading announcement (M13/L16)', async () => {
    const onClick = vi.fn()
    const wrapper = track(mount(SelectPanelButton, {
      props: { id: 'save-button', loading: true, loadingAnnouncement: 'Saving changes' },
      attrs: { onClick },
      slots: { default: 'Save' },
      attachTo: document.body,
    }))
    await settle()
    const button = wrapper.get('button')
    expect(button.attributes('data-loading')).toBe('true')
    expect(button.attributes('aria-disabled')).toBe('true')
    expect(button.attributes('aria-describedby')).toBe('save-button-loading-announcement')
    expect(button.attributes('aria-labelledby')).toBe('save-button-label')
    expect(button.get('[data-component="text"]').attributes('id')).toBe('save-button-label')
    const announcement = wrapper.get('#save-button-loading-announcement')
    expect(announcement.text()).toBe('Saving changes')
    expect(announcement.element.closest('span.visually-hidden')).not.toBeNull()
    expect(wrapper.find('div[data-loading-wrapper]').exists()).toBe(true)
    await button.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('keeps raw data-label-wrap and wires count into CounterLabel slots (L16)', async () => {
    const plain = track(mount(SelectPanelButton, { props: { labelWrap: false }, slots: { default: 'Wrap' }, attachTo: document.body }))
    await settle()
    expect(plain.get('button').attributes('data-label-wrap')).toBe('false')
    const counted = track(mount(SelectPanelButton, { props: { count: 3 }, slots: { default: 'Inbox' }, attachTo: document.body }))
    await settle()
    const button = counted.get('button')
    expect(button.attributes('data-has-count')).toBe('true')
    const counter = button.get('[data-component="trailingVisual"] [data-component="ButtonCounter"]')
    expect(counter.attributes('data-variant')).toBe('secondary')
    expect(counter.classes()).toContain('counter-label')
    expect(counter.attributes('aria-hidden')).toBe('true')
    expect(counter.text()).toBe('3')
    expect(button.get('[data-component="trailingVisual"]').text()).toContain('(3)')
    const iconOnly = track(mount(SelectPanelButton, { props: { count: 7, leadingVisual: IconStub }, attachTo: document.body }))
    await settle()
    expect(iconOnly.get('button').attributes('data-icon-only-counter')).toBe('true')
    const loadingCounter = track(mount(SelectPanelButton, { props: { count: 3, loading: true }, slots: { default: 'Inbox' }, attachTo: document.body }))
    await settle()
    const trailing = loadingCounter.get('[data-component="trailingVisual"]')
    expect(trailing.find('[data-component="ButtonCounter"]').exists()).toBe(false)
    expect(trailing.find('[data-component="Spinner"]').exists()).toBe(true)
  })

  it('lets user data-component win and warns about invalid notificationIndicator (L16/M13)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = track(mount(SelectPanelButton, {
      props: { notificationIndicator: 'leadingVisual' },
      attrs: { 'data-component': 'SelectPanel.SecondaryActionButton' },
      slots: { default: 'Secondary' },
      attachTo: document.body,
    }))
    await settle()
    expect(wrapper.get('button').attributes('data-component')).toBe('SelectPanel.SecondaryActionButton')
    expect(warn).toHaveBeenCalledWith('Button: `notificationIndicator="leadingVisual"` requires a `leadingVisual` prop.')
  })

  it('warns when the rendered element is not a semantic button or anchor (M13)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    track(mount(SelectPanelButton, { props: { as: 'div' }, slots: { default: 'Nope' }, attachTo: document.body }))
    await settle()
    expect(warn).toHaveBeenCalledWith('This component should be an instanceof a semantic button or anchor')
  })

  it('renders the label tooltip for icon buttons and suppresses the button aria-label (M14)', async () => {
    const wrapper = track(mount(SelectPanelButton, {
      props: { icon: IconStub, tooltipDirection: 'nw', keyshortcuts: 'Escape' },
      attrs: { 'aria-label': 'Cancel and close' },
      attachTo: document.body,
    }))
    await settle()
    const button = wrapper.get('button')
    const tooltip = wrapper.get('[data-component="Tooltip"]')
    expect(tooltip.attributes('data-direction')).toBe('nw')
    expect(tooltip.attributes('popover')).toBe('auto')
    expect(tooltip.attributes('aria-hidden')).toBe('true')
    expect(tooltip.attributes('role')).toBeUndefined()
    expect(tooltip.text()).toContain('Cancel and close')
    expect(button.attributes('aria-label')).toBeUndefined()
    // keybindingHints 存在时外层 span 无 id，tooltipId 挂在文本内层 span 上（React Tooltip.tsx:384/395）
    expect(tooltip.attributes('id')).toBeUndefined()
    const labelledSpan = tooltip.element.querySelector<HTMLSpanElement>('span[id]')!
    expect(button.attributes('aria-labelledby')).toBe(labelledSpan.id)
    expect(button.attributes('aria-keyshortcuts')).toBe('Escape')
    expect(button.attributes('data-component')).toBe('IconButton')
    expect(tooltip.find('[data-component="KeybindingHint"]').exists()).toBe(true)
  })

  it('renders the description tooltip and keeps aria-label (M14)', async () => {
    const wrapper = track(mount(SelectPanelButton, {
      props: { icon: IconStub, description: 'Dismiss this dialog' },
      attrs: { 'aria-label': 'Close' },
      attachTo: document.body,
    }))
    await settle()
    const button = wrapper.get('button')
    const tooltip = wrapper.get('[data-component="Tooltip"]')
    expect(button.attributes('aria-label')).toBe('Close')
    expect(tooltip.attributes('role')).toBe('tooltip')
    expect(button.attributes('aria-describedby')?.split(' ')).toContain(tooltip.attributes('id'))
    expect(button.attributes('aria-labelledby')).toBeUndefined()
  })

  it('composes loading announcement, label and tooltip ids like ButtonBase + Tooltip injection (L11)', async () => {
    const wrapper = track(mount(SelectPanelButton, {
      props: { id: 'compose', loading: true },
      attrs: { 'aria-label': 'Publish' },
      slots: { default: 'Publish' },
      attachTo: document.body,
    }))
    await settle()
    const button = wrapper.get('button')
    const tooltip = wrapper.get('[data-component="Tooltip"]')
    const tooltipId = tooltip.attributes('id')!
    // label 类型：cloneElement 以 tooltipId 覆盖 aria-labelledby，再叠加 ButtonBase 的 loading 组合
    expect(button.attributes('aria-labelledby')).toBe(`compose-label ${tooltipId}`)
    expect(button.attributes('aria-describedby')).toBe('compose-loading-announcement')
    // label 类型下 aria-label 被抑制（由 tooltip 提供标签）
    expect(button.attributes('aria-label')).toBeUndefined()
    expect(button.get('[data-component="text"]').attributes('id')).toBe('compose-label')
  })

  it('skips the tooltip for missing, empty, disabled or unsafe-disable cases (M14)', async () => {
    const noLabel = track(mount(SelectPanelButton, { props: { icon: IconStub }, attachTo: document.body }))
    await settle()
    expect(noLabel.find('[data-component="Tooltip"]').exists()).toBe(false)
    const emptyLabel = track(mount(SelectPanelButton, { props: { icon: IconStub }, attrs: { 'aria-label': '' }, attachTo: document.body }))
    await settle()
    expect(emptyLabel.find('[data-component="Tooltip"]').exists()).toBe(false)
    const disabled = track(mount(SelectPanelButton, { props: { icon: IconStub, disabled: true }, attrs: { 'aria-label': 'Close' }, attachTo: document.body }))
    await settle()
    expect(disabled.find('[data-component="Tooltip"]').exists()).toBe(false)
    const unsafe = track(mount(SelectPanelButton, { props: { icon: IconStub, unsafeDisableTooltip: true }, attrs: { 'aria-label': 'Close' }, attachTo: document.body }))
    await settle()
    expect(unsafe.find('[data-component="Tooltip"]').exists()).toBe(false)
  })

  it('intercepts Escape while the tooltip popover is open (M12)', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const outer = vi.fn()
    unregisters.push(registerEscapeHandler(outer))
    const wrapper = track(mount(SelectPanelButton, {
      props: { icon: IconStub },
      attrs: { 'aria-label': 'Cancel and close' },
      attachTo: document.body,
    }))
    await settle()
    const button = wrapper.get('button').element
    const tooltip = wrapper.get('[data-component="Tooltip"]').element
    button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(50)
    await settle()
    expect(tooltip.classList.contains(':popover-open')).toBe(true)
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    expect(tooltip.classList.contains(':popover-open')).toBe(false)
    expect(outer).not.toHaveBeenCalled()
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    expect(outer).toHaveBeenCalledOnce()
  })

  it('closes the tooltip on mouseleave and blur but not on non focus-visible focus (M14)', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const wrapper = track(mount(SelectPanelButton, {
      props: { icon: IconStub },
      attrs: { 'aria-label': 'Cancel and close' },
      attachTo: document.body,
    }))
    await settle()
    const button = wrapper.get('button').element
    const tooltip = wrapper.get('[data-component="Tooltip"]').element
    button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(50)
    await settle()
    expect(tooltip.classList.contains(':popover-open')).toBe(true)
    button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
    await settle()
    expect(tooltip.classList.contains(':popover-open')).toBe(false)
    button.dispatchEvent(new FocusEvent('focus', { bubbles: false }))
    await settle()
    expect(tooltip.classList.contains(':popover-open')).toBe(false)
  })

  it('lets consumer attrs override the aria-disabled loading default (React ButtonBase.tsx:102-104)', async () => {
    // React JSX 顺序：aria-disabled={loading ? true : undefined} 在 {...rest} 之前，后者获胜
    const overridden = track(mount(SelectPanelButton, { props: { loading: true }, attrs: { 'aria-disabled': 'false' }, slots: { default: 'Save' }, attachTo: document.body }))
    await settle()
    expect(overridden.get('button').attributes('aria-disabled')).toBe('false')
    const defaulted = track(mount(SelectPanelButton, { props: { loading: true }, slots: { default: 'Save' }, attachTo: document.body }))
    await settle()
    expect(defaulted.get('button').attributes('aria-disabled')).toBe('true')
  })

  it('stamps data-component="Octicon" onto leading/trailing visual svgs (React ButtonBase.tsx:30 + octicons-react dist/index.esm.mjs:110)', async () => {
    // ButtonBase 原样渲染 <Visual />；@primer/octicons-react 的每个图标 svg 自带 data-component="Octicon"
    const visuals = track(mount(SelectPanelButton, { props: { leadingVisual: PlainIconStub, trailingVisual: PlainIconStub }, slots: { default: 'Inbox' }, attachTo: document.body }))
    await settle()
    expect(visuals.get('[data-component="leadingVisual"] svg').attributes('data-component')).toBe('Octicon')
    expect(visuals.get('[data-component="trailingVisual"] svg').attributes('data-component')).toBe('Octicon')
  })
})
