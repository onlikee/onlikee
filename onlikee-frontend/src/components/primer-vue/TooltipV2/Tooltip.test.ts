// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Independent tooltip test fixtures. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import Tooltip from './Tooltip.vue'
import SelectPanelButton from '../SelectPanel/SelectPanelButton.vue'

const wrappers: VueWrapper[] = []
async function settle() {
  await nextTick()
  await flushPromises()
  await nextTick()
}
afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers.length = 0
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.useRealTimers()
})
function track<T extends VueWrapper>(wrapper: T): T {
  wrappers.push(wrapper)
  return wrapper
}

const IconStub = defineComponent({
  name: 'IconStub',
  render: () => h('svg', { 'data-component': 'Octicon' }),
})

describe('Tooltip (TooltipV2 public component)', () => {
  it('appends the tooltip id to an existing aria-describedby for description tooltips', async () => {
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'More context' },
        slots: {
          default: () => h('button', { 'aria-describedby': 'own-desc', type: 'button' }, 'Trigger'),
        },
        attachTo: document.body,
      }),
    )
    await settle()
    const button = wrapper.get('button')
    const tooltip = wrapper.get('[data-component="Tooltip"]')
    const tooltipId = tooltip.attributes('id')!
    expect(tooltipId).toBeTruthy()
    expect(button.attributes('aria-describedby')).toBe(`own-desc ${tooltipId}`)
    expect(button.attributes('aria-labelledby')).toBeUndefined()
    expect(tooltip.attributes('role')).toBe('tooltip')
    expect(tooltip.attributes('aria-hidden')).toBe('true')
    expect(tooltip.attributes('popover')).toBe('auto')
    expect(tooltip.text()).toBe('More context')
  })

  it('composes aria-labelledby for label tooltips and keeps the trigger label (Vue adaptation)', async () => {
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Close dialog', type: 'label' },
        slots: {
          default: () => h('button', { 'aria-labelledby': 'own-label', type: 'button' }, 'X'),
        },
        attachTo: document.body,
      }),
    )
    await settle()
    const button = wrapper.get('button')
    const tooltip = wrapper.get('[data-component="Tooltip"]')
    expect(button.attributes('aria-labelledby')).toBe(`own-label ${tooltip.attributes('id')}`)
    expect(button.attributes('aria-describedby')).toBeUndefined()
    expect(tooltip.attributes('role')).toBeUndefined()
  })

  it('opens on hover capture after the configured delay and composes original handlers', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const calls: string[] = []
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Delayed tip', delay: 'medium' },
        slots: {
          default: () =>
            h(
              'button',
              {
                type: 'button',
                onMouseenter: () => calls.push('original-mouseenter'),
                onMouseleave: () => calls.push('original-mouseleave'),
                onBlur: () => calls.push('original-blur'),
              },
              'Trigger',
            ),
        },
        attachTo: document.body,
      }),
    )
    await settle()
    const button = wrapper.get('button').element
    const tooltip = wrapper.get('[data-component="Tooltip"]').element
    button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(399)
    expect(tooltip.classList.contains(':popover-open')).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await settle()
    expect(tooltip.classList.contains(':popover-open')).toBe(true)
    expect(calls).toEqual(['original-mouseenter'])
    button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
    await settle()
    expect(tooltip.classList.contains(':popover-open')).toBe(false)
    expect(calls).toEqual(['original-mouseenter', 'original-mouseleave'])
    button.dispatchEvent(new FocusEvent('blur'))
    expect(calls).toEqual(['original-mouseenter', 'original-mouseleave', 'original-blur'])
  })

  it('renders keybinding hints with the accessible summary and moves the id to the inner span', async () => {
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Command palette', keybindingHint: ['Mod+K', 'Mod+Shift+P'] },
        slots: { default: () => h('button', { type: 'button' }, 'Trigger') },
        attachTo: document.body,
      }),
    )
    await settle()
    const tooltip = wrapper.get('[data-component="Tooltip"]')
    const tooltipId = wrapper.get('button').attributes('aria-describedby')!
    expect(tooltip.attributes('id')).toBeUndefined()
    const inner = tooltip.element.querySelector<HTMLSpanElement>('span[id]')!
    expect(inner.id).toBe(tooltipId)
    // jsdom 平台为 other：mod → control；Mod+Shift+P 排序后 shift 在前（mod 无排序优先级）
    expect(inner.textContent).toContain('(control k or shift control p)')
    const container = tooltip.get('[data-component="Tooltip.KeybindingHintContainer"]')
    expect(container.attributes('aria-hidden')).toBe('true')
    expect(container.findAll('[data-component="KeybindingHint"]')).toHaveLength(2)
    expect(container.text()).toContain('or')
  })

  it('keeps the outer span id when the tooltip itself carries an aria-label', async () => {
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Labeled tip', keybindingHint: 'Mod+K' },
        attrs: { 'aria-label': 'External label' },
        slots: { default: () => h('button', { type: 'button' }, 'Trigger') },
        attachTo: document.body,
      }),
    )
    await settle()
    const tooltip = wrapper.get('[data-component="Tooltip"]')
    expect(tooltip.attributes('id')).toBeTruthy()
    expect(tooltip.element.querySelector('span[id]')).toBeNull()
  })

  it('warns and renders children as-is for non-element or multiple triggers (Vue adaptation)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'tip' },
        slots: {
          default: () => [
            h('button', { type: 'button' }, 'One'),
            h('button', { type: 'button' }, 'Two'),
          ],
        },
        attachTo: document.body,
      }),
    )
    await settle()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('single interactive element'))
    expect(wrapper.findAll('button')).toHaveLength(2)
    expect(wrapper.find('[data-component="Tooltip"]').exists()).toBe(true)
  })

  it('throws the interactive-content invariant for non-interactive triggers', async () => {
    const captured: unknown[] = []
    const Parent = defineComponent({
      errorCaptured(error: unknown) {
        captured.push(error)
        return false
      },
      render: () =>
        h(Tooltip, { text: 'tip' }, { default: () => h('span', {}, 'Not interactive') }),
    })
    track(mount(Parent, { attachTo: document.body }))
    await settle()
    expect(captured).toHaveLength(1)
    expect((captured[0] as Error).message).toContain(
      'expects a single element that contains interactive content',
    )
  })

  it('suppresses nested SelectPanelButton tooltips through the tooltip context', async () => {
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Outer tooltip' },
        slots: {
          default: () => h(SelectPanelButton, { icon: IconStub, 'aria-label': 'Inner action' }),
        },
        attachTo: document.body,
      }),
    )
    await settle()
    const tooltips = wrapper.findAll('[data-component="Tooltip"]')
    expect(tooltips).toHaveLength(1)
    expect(tooltips[0]!.text()).toBe('Outer tooltip')
    // 内层按钮检测到外部 tooltip：保留自身 aria-label，不再渲染第二个 tooltip
    expect(wrapper.get('button').attributes('aria-label')).toBe('Inner action')
  })
})
