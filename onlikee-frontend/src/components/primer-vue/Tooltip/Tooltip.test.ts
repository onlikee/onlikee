// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Independent tooltip test fixtures. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import {
  Comment,
  createSSRApp,
  defineComponent,
  Fragment,
  h,
  nextTick,
  onMounted,
  onBeforeUnmount,
  ref,
  useTemplateRef,
} from 'vue'
import { renderToString } from '@vue/server-renderer'
import { FeatureFlags } from '../FeatureFlags'
import * as tooltipExports from './index'
import { registerEscapeHandler } from '../internal/documentRegistries'
import Tooltip from './Tooltip.vue'
import { IconButton } from '../Button'
import { PLATFORM_OVERRIDE_KEY, type Platform } from '../KeybindingHint/platform'

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

describe('Tooltip (Tooltip public component)', () => {
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

  it('replaces aria-labelledby for label tooltips like the source contract', async () => {
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
    expect(button.attributes('aria-labelledby')).toBe(tooltip.attributes('id'))
    expect(button.attributes('aria-describedby')).toBeUndefined()
    expect(tooltip.attributes('role')).toBeUndefined()
  })

  it('uses generated ids for empty values and updates explicit ids reactively', async () => {
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Action name', type: 'label', id: '' },
        slots: {
          default: () => h('button', { 'aria-labelledby': 'own-label', type: 'button' }, 'Trigger'),
        },
        attachTo: document.body,
      }),
    )
    await settle()
    const generatedId = wrapper.get('[data-component="Tooltip"]').attributes('id')
    expect(generatedId).toBeTruthy()
    expect(wrapper.get('button').attributes('aria-labelledby')).toBe(generatedId)

    await wrapper.setProps({ id: 'updated-tip' })
    await settle()
    expect(wrapper.get('[data-component="Tooltip"]').attributes('id')).toBe('updated-tip')
    expect(wrapper.get('button').attributes('aria-labelledby')).toBe('updated-tip')
  })

  it('keeps the consumer class before the tooltip module class', async () => {
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Tip', className: 'consumer-tooltip' },
        slots: { default: () => h('button', { type: 'button' }, 'Trigger') },
        attachTo: document.body,
      }),
    )
    await settle()
    expect(wrapper.get('[data-component="Tooltip"]').attributes('class')?.split(' ')[0]).toBe(
      'consumer-tooltip',
    )
  })

  it('lets data attributes override defaults while keeping semantic tooltip attributes fixed', async () => {
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Tip' },
        attrs: {
          'data-component': 'ConsumerTooltip',
          'data-direction': 'consumer-direction',
          role: 'alert',
          'aria-hidden': 'false',
        },
        slots: { default: () => h('button', { type: 'button' }, 'Trigger') },
        attachTo: document.body,
      }),
    )
    await settle()
    const tooltip = wrapper.get('[data-component="ConsumerTooltip"]')
    expect(tooltip.attributes('data-direction')).toBe('consumer-direction')
    expect(tooltip.attributes('role')).toBe('tooltip')
    expect(tooltip.attributes('aria-hidden')).toBe('true')
  })

  it('moves the tooltip id when aria-label is added or removed', async () => {
    const Parent = defineComponent({
      props: { label: { type: String, default: undefined } },
      setup: (props) => () =>
        h(
          Tooltip,
          {
            text: 'Action description',
            keybindingHint: 'Mod+K',
            ...(props.label === undefined ? {} : { 'aria-label': props.label }),
          },
          { default: () => h('button', { type: 'button' }, 'Trigger') },
        ),
    })
    const wrapper = track(
      mount(Parent, { props: { label: 'Tooltip label' }, attachTo: document.body }),
    )
    await settle()
    const tooltip = wrapper.get('[data-component="Tooltip"]')
    expect(tooltip.attributes('id')).toBeTruthy()
    expect(tooltip.element.querySelector('span[id]')).toBeNull()

    await wrapper.setProps({ label: undefined })
    await settle()
    expect(wrapper.get('[data-component="Tooltip"]').attributes('id')).toBeUndefined()
    expect(wrapper.get('[data-component="Tooltip"]').element.querySelector('span[id]')).toBeTruthy()
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

  it.each(['Tooltip', 'IconButton'] as const)(
    'updates visible and accessible shortcuts together through %s',
    async (component) => {
      const platform = ref<Platform | null>('apple')
      const options = {
        global: { provide: { [PLATFORM_OVERRIDE_KEY as symbol]: platform } },
        attachTo: document.body,
      }
      const wrapper = track(
        component === 'Tooltip'
          ? mount(Tooltip, {
              ...options,
              props: { text: 'Open', type: 'label', keybindingHint: ['Mod+K', 'Meta+K'] },
              slots: { default: () => h('button', { type: 'button' }, 'Trigger') },
            })
          : mount(IconButton, {
              ...options,
              props: { icon: IconStub, 'aria-label': 'Open', keybindingHint: ['Mod+K', 'Meta+K'] },
            }),
      )
      await settle()
      const button = wrapper.get('button')
      const labelId = button.attributes('aria-labelledby')!
      const label = () => document.getElementById(labelId)!.textContent
      const symbols = () =>
        wrapper.findAll('[data-kbd-chord] span[aria-hidden]').map((node) => node.text())
      expect(label()).toContain('(command k or command k)')
      expect(symbols()).toEqual(['⌘', 'K', '⌘', 'K'])
      platform.value = 'windows'
      await settle()
      expect(label()).toContain('(control k or Windows k)')
      expect(symbols()).toEqual(['⌃', 'K', 'Win', 'K'])
      platform.value = 'other'
      await settle()
      expect(label()).toContain('(control k or meta k)')
      expect(symbols()).toEqual(['⌃', 'K', 'Meta', 'K'])
      expect(button.attributes('aria-labelledby')).toBe(labelId)
      expect(wrapper.findAll('[data-component="Tooltip"]')).toHaveLength(1)
    },
  )

  it.each(['Tooltip', 'IconButton'] as const)(
    'hydrates %s shortcuts and labels together without mismatches',
    async (component) => {
      const platformGetter = vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Linux')
      const render = () =>
        component === 'Tooltip'
          ? h(Tooltip, { text: 'Open', type: 'label', keybindingHint: 'Mod+K' }, () =>
              h('button', { type: 'button' }, 'Trigger'),
            )
          : h(IconButton, { icon: IconStub, 'aria-label': 'Open', keybindingHint: 'Mod+K' })
      const host = document.createElement('div')
      document.body.append(host)
      host.innerHTML = await renderToString(createSSRApp({ render }))
      expect(host.textContent).toContain('(control k)')
      const trigger = host.querySelector('button')!
      const labelId = trigger.getAttribute('aria-labelledby')!
      platformGetter.mockReturnValue('iPhone')
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      const app = createSSRApp({ render })
      try {
        app.mount(host)
        await settle()
        expect(host.querySelector('button')).toBe(trigger)
        expect(trigger.getAttribute('aria-labelledby')).toBe(labelId)
        expect(document.getElementById(labelId)!.textContent).toContain('(command k)')
        expect(
          Array.from(host.querySelectorAll('[data-kbd-chord] span[aria-hidden]')).map(
            (node) => node.textContent,
          ),
        ).toEqual(['⌘', 'K'])
        expect(warn).not.toHaveBeenCalled()
        expect(error).not.toHaveBeenCalled()
      } finally {
        app.unmount()
      }
    },
  )

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

  it('rejects non-element and multiple children like React.Children.only', async () => {
    const captured: unknown[] = []
    const Parent = defineComponent({
      errorCaptured(error: unknown) {
        captured.push(error)
        return false
      },
      render: () =>
        h(
          Tooltip,
          { text: 'tip' },
          {
            default: () => [
              h('button', { type: 'button' }, 'One'),
              h('button', { type: 'button' }, 'Two'),
            ],
          },
        ),
    })
    const wrapper = track(mount(Parent, { attachTo: document.body }))
    await settle()
    expect(captured).toHaveLength(1)
    expect((captured[0] as Error).message).toBe(
      'React.Children.only expected to receive a single React element child.',
    )
    expect(wrapper.find('[data-component="Tooltip"]').exists()).toBe(false)
  })

  it('rejects text children like React.Children.only', async () => {
    const captured: unknown[] = []
    const Parent = defineComponent({
      errorCaptured(error: unknown) {
        captured.push(error)
        return false
      },
      render: () => h(Tooltip, { text: 'tip' }, { default: () => 'plain text' }),
    })
    track(mount(Parent, { attachTo: document.body }))
    await settle()
    expect(captured).toHaveLength(1)
    expect((captured[0] as Error).message).toBe(
      'React.Children.only expected to receive a single React element child.',
    )
  })

  it('returns a fragment trigger without a tooltip context or tooltip element', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Outer tooltip' },
        slots: {
          default: () =>
            h(Fragment, null, [h(IconButton, { icon: IconStub, 'aria-label': 'Inner action' })]),
        },
        attachTo: document.body,
      }),
    )
    await settle()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('does not support a React Fragment'))
    expect(wrapper.findAll('button')).toHaveLength(1)
    expect(wrapper.findAll('[data-component="Tooltip"]')).toHaveLength(1)
    expect(wrapper.get('[data-component="Tooltip"]').text()).toBe('Inner action')
  })

  it('inherits the outer tooltip context through a fragment trigger', async () => {
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Outer tooltip' },
        slots: {
          default: () =>
            h(
              Tooltip,
              { text: 'Inner tooltip' },
              {
                default: () =>
                  h(Fragment, null, [
                    h(IconButton, { icon: IconStub, 'aria-label': 'Inner action' }),
                  ]),
              },
            ),
        },
        attachTo: document.body,
      }),
    )
    await settle()
    expect(wrapper.findAll('[data-component="Tooltip"]')).toHaveLength(1)
    expect(wrapper.get('[data-component="Tooltip"]').text()).toBe('Outer tooltip')
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
      'expects a single React element that contains interactive content',
    )
  })

  it('suppresses nested IconButton tooltips through the tooltip context', async () => {
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Outer tooltip' },
        slots: {
          default: () => h(IconButton, { icon: IconStub, 'aria-label': 'Inner action' }),
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

describe('Tooltip trigger refs and public contract', () => {
  it('exposes only the source component at runtime and provides its slot marker', () => {
    expect(Object.keys(tooltipExports)).toEqual(['Tooltip'])
    expect(tooltipExports.Tooltip.__SLOT__.description).toBe('Tooltip')
  })

  for (const enabled of [false, true]) {
    it(
      'forwards DOM objects and respects child ref precedence with merging ' + enabled,
      async () => {
        const forwardedRef = { current: null as HTMLElement | null }
        const ownRef = vi.fn()
        const wrapper = track(
          mount(FeatureFlags, {
            props: { flags: { primer_react_merged_forwarded_refs: enabled } },
            slots: {
              default: () =>
                h(
                  Tooltip,
                  { text: 'Tip', forwardedRef },
                  {
                    default: () => h('button', { ref: ownRef, type: 'button' }, 'Trigger'),
                  },
                ),
            },
            attachTo: document.body,
          }),
        )
        await settle()
        const button = wrapper.get('button').element
        expect(forwardedRef.current).toBe(button)
        expect(wrapper.findComponent(Tooltip).vm.element).toBe(button)
        if (enabled) expect(ownRef.mock.calls.map(([element]) => element)).toContain(button)
        else expect(ownRef).not.toHaveBeenCalled()
        wrapper.unmount()
        wrappers.splice(wrappers.indexOf(wrapper), 1)
        expect(forwardedRef.current).toBeNull()
        if (enabled) expect(ownRef.mock.calls.at(-1)?.[0]).toBeNull()
      },
    )

    it('preserves a child ref without a forwarded ref with merging ' + enabled, async () => {
      const ownRef = vi.fn()
      const wrapper = track(
        mount(FeatureFlags, {
          props: { flags: { primer_react_merged_forwarded_refs: enabled } },
          slots: {
            default: () =>
              h(
                Tooltip,
                { text: 'Tip' },
                {
                  default: () => h('button', { ref: ownRef, type: 'button' }, 'Trigger'),
                },
              ),
          },
          attachTo: document.body,
        }),
      )
      await settle()
      expect(ownRef.mock.calls.map(([element]) => element)).toContain(wrapper.get('button').element)
    })

    it(
      'forwards callbacks while keeping positioning functional with merging ' + enabled,
      async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        const forwardedRef = vi.fn()
        const wrapper = track(
          mount(FeatureFlags, {
            props: { flags: { primer_react_merged_forwarded_refs: enabled } },
            slots: {
              default: () =>
                h(
                  Tooltip,
                  { text: 'Tip', forwardedRef },
                  {
                    default: () => h('button', { type: 'button' }, 'Trigger'),
                  },
                ),
            },
            attachTo: document.body,
          }),
        )
        await settle()
        const button = wrapper.get('button').element
        expect(forwardedRef).toHaveBeenCalledWith(button)
        button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
        await vi.advanceTimersByTimeAsync(50)
        expect(
          wrapper.get('[data-component="Tooltip"]').element.classList.contains(':popover-open'),
        ).toBe(true)
        wrapper.unmount()
        wrappers.splice(wrappers.indexOf(wrapper), 1)
        expect(forwardedRef).toHaveBeenLastCalledWith(null)
      },
    )
  }

  it('cleans up replaced callback refs and uses their cleanup instead of a null callback', async () => {
    const cleanup = vi.fn()
    const previous = vi.fn((element: HTMLElement | null) => (element ? cleanup : undefined))
    const next = { current: null as HTMLElement | null }
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Tip', forwardedRef: previous },
        slots: { default: () => h('button', { type: 'button' }, 'Trigger') },
        attachTo: document.body,
      }),
    )
    await settle()
    const button = wrapper.get('button').element
    await wrapper.setProps({ forwardedRef: next })
    await settle()
    expect(cleanup).toHaveBeenCalledOnce()
    expect(previous.mock.calls.every(([element]) => element === button)).toBe(true)
    expect(next.current).toBe(button)
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(next.current).toBeNull()
  })

  it('clears replaced objects and forwards a replacement trigger', async () => {
    const previous = { current: null as HTMLElement | null }
    const next = { current: null as HTMLElement | null }
    const Parent = defineComponent({
      props: { replacement: Boolean },
      setup: (props) => () =>
        h(
          Tooltip,
          { text: 'Tip', forwardedRef: props.replacement ? next : previous },
          {
            default: () =>
              h('button', { key: String(props.replacement), type: 'button' }, 'Trigger'),
          },
        ),
    })
    const wrapper = track(mount(Parent, { attachTo: document.body }))
    await settle()
    const original = wrapper.get('button').element
    expect(previous.current).toBe(original)
    await wrapper.setProps({ replacement: true })
    await settle()
    expect(previous.current).toBeNull()
    expect(next.current).toBe(wrapper.get('button').element)
    expect(next.current).not.toBe(original)
    expect(wrapper.get('[data-component="Tooltip"]').attributes('popover')).toBe('auto')
  })

  it('warns and avoids popover setup for an invalid custom trigger ref', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const Invalid = defineComponent({
      setup(_props, { expose }) {
        expose({ element: {} })
        return () => h('button', 'Trigger')
      },
    })
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Tip' },
        slots: { default: () => h(Invalid) },
        attachTo: document.body,
      }),
    )
    await settle()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('ref to resolve to an HTML element'))
    expect(wrapper.get('[data-component="Tooltip"]').attributes('popover')).toBeUndefined()
    await wrapper.get('button').trigger('focus')
  })

  it('does not filter comment nodes from the strict trigger slot', async () => {
    const captured: unknown[] = []
    const Parent = defineComponent({
      errorCaptured(error: unknown) {
        captured.push(error)
        return false
      },
      render: () =>
        h(
          Tooltip,
          { text: 'Tip' },
          {
            default: () => [h(Comment), h('button', { type: 'button' }, 'Trigger')],
          },
        ),
    })
    track(mount(Parent, { attachTo: document.body }))
    await settle()
    expect(captured).toHaveLength(1)
  })

  it('labels custom button triggers and preserves their ref and click behavior', async () => {
    const ButtonTrigger = defineComponent({
      setup(_, { expose }) {
        const element = useTemplateRef<HTMLButtonElement>('element')
        expose({ element })
        return () => h('button', { ref: 'element', type: 'button' })
      },
    })
    const click = vi.fn()
    const forwardedRef = { current: null as HTMLElement | null }
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Copy code', type: 'label', forwardedRef },
        slots: { default: () => h(ButtonTrigger, { onClick: click }) },
        attachTo: document.body,
      }),
    )
    await settle()
    expect(forwardedRef.current).toBe(wrapper.get('button').element)
    expect(wrapper.get('button').attributes('aria-labelledby')).toBe(
      wrapper.get('[data-component="Tooltip"]').attributes('id'),
    )
    await wrapper.get('button').trigger('click')
    expect(click).toHaveBeenCalledOnce()
  })
})

describe('Tooltip input events and cleanup', () => {
  it('uses the short delay by default and Escape consumes only an open tooltip', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Tip' },
        slots: { default: () => h('button', 'Trigger') },
        attachTo: document.body,
      }),
    )
    await settle()
    const tooltip = wrapper.get('[data-component="Tooltip"]').element
    const button = wrapper.get('button').element
    const closedEscape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    button.dispatchEvent(closedEscape)
    expect(closedEscape.defaultPrevented).toBe(false)
    button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(49)
    expect(tooltip.classList.contains(':popover-open')).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(tooltip.classList.contains(':popover-open')).toBe(true)
    const openEscape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    button.dispatchEvent(openEscape)
    expect(openEscape.defaultPrevented).toBe(true)
    expect(tooltip.classList.contains(':popover-open')).toBe(false)
  })

  it('opens only for visible focus and calls the original handler after opening', async () => {
    const calls: boolean[] = []
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Tip' },
        slots: {
          default: () =>
            h(
              'button',
              {
                onFocus: () =>
                  calls.push(
                    wrapper
                      .get('[data-component="Tooltip"]')
                      .element.classList.contains(':popover-open'),
                  ),
              },
              'Trigger',
            ),
        },
        attachTo: document.body,
      }),
    )
    await settle()
    const button = wrapper.get('button').element
    const matches = button.matches.bind(button)
    const matchSpy = vi
      .spyOn(button, 'matches')
      .mockImplementation((selector) => (selector === ':focus-visible' ? false : matches(selector)))
    button.dispatchEvent(new FocusEvent('focus'))
    expect(calls).toEqual([])
    matchSpy.mockImplementation((selector) =>
      selector === ':focus-visible' ? true : matches(selector),
    )
    button.dispatchEvent(new FocusEvent('focus'))
    expect(calls).toEqual([true])
    button.dispatchEvent(new FocusEvent('blur'))
    expect(
      wrapper.get('[data-component="Tooltip"]').element.classList.contains(':popover-open'),
    ).toBe(false)
  })

  it('blocks new tooltip openings without forcibly hiding an already open tooltip', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Tip' },
        slots: { default: () => h('button', 'Trigger') },
        attachTo: document.body,
      }),
    )
    await settle()
    const button = wrapper.get('button')
    const tooltip = wrapper.get('[data-component="Tooltip"]').element
    await button.trigger('mouseover')
    await vi.advanceTimersByTimeAsync(50)
    expect(tooltip.classList.contains(':popover-open')).toBe(true)
    await wrapper.setProps({ _privateDisableTooltip: true })
    expect(tooltip.classList.contains(':popover-open')).toBe(true)
    await button.trigger('mouseleave')
    expect(tooltip.classList.contains(':popover-open')).toBe(false)
    await button.trigger('mouseover')
    await vi.advanceTimersByTimeAsync(50)
    expect(tooltip.classList.contains(':popover-open')).toBe(false)
  })

  it('honors the source private disable prop and hides ten milliseconds after touchend', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const touch = vi.fn()
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Tip', _privateDisableTooltip: true },
        slots: { default: () => h('button', { onTouchend: touch }, 'Trigger') },
        attachTo: document.body,
      }),
    )
    await settle()
    const button = wrapper.get('button').element
    const tooltip = wrapper.get('[data-component="Tooltip"]').element
    button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(50)
    expect(tooltip.classList.contains(':popover-open')).toBe(false)
    await wrapper.setProps({ _privateDisableTooltip: false })
    button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(50)
    expect(tooltip.classList.contains(':popover-open')).toBe(true)
    button.dispatchEvent(new Event('touchend'))
    expect(touch).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(9)
    expect(tooltip.classList.contains(':popover-open')).toBe(true)
    await vi.advanceTimersByTimeAsync(1)
    expect(tooltip.classList.contains(':popover-open')).toBe(false)
  })

  it('cancels delayed opening on leave and clears scheduled work on unmount', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Tip', delay: 'long' },
        slots: { default: () => h('button', 'Trigger') },
        attachTo: document.body,
      }),
    )
    await settle()
    const button = wrapper.get('button').element
    button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    button.dispatchEvent(new MouseEvent('mouseleave'))
    await vi.advanceTimersByTimeAsync(1200)
    expect(
      wrapper.get('[data-component="Tooltip"]').element.classList.contains(':popover-open'),
    ).toBe(false)
    button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(vi.getTimerCount()).toBe(0)
  })
})

it('updates merged ref behavior when the feature flag changes', async () => {
  const forwardedRef = { current: null as HTMLElement | null }
  const ownRef = vi.fn()
  const wrapper = track(
    mount(FeatureFlags, {
      props: { flags: { primer_react_merged_forwarded_refs: false } },
      slots: {
        default: () =>
          h(
            Tooltip,
            { text: 'Tip', forwardedRef },
            {
              default: () => h('button', { ref: ownRef, type: 'button' }, 'Trigger'),
            },
          ),
      },
      attachTo: document.body,
    }),
  )
  await settle()
  expect(ownRef).not.toHaveBeenCalled()
  await wrapper.setProps({ flags: { primer_react_merged_forwarded_refs: true } })
  await settle()
  expect(forwardedRef.current).toBe(wrapper.get('button').element)
  expect(ownRef.mock.calls.map(([element]) => element)).toContain(forwardedRef.current)
  await wrapper.setProps({ flags: { primer_react_merged_forwarded_refs: false } })
  await settle()
  expect(forwardedRef.current).toBe(wrapper.get('button').element)
  expect(ownRef.mock.calls.at(-1)?.[0]).toBeNull()
})

it('composes Vue merged event arrays in their original order', async () => {
  const calls: string[] = []
  const wrapper = track(
    mount(Tooltip, {
      props: { text: 'Tip' },
      slots: {
        default: () =>
          h(
            'button',
            { onBlur: [() => calls.push('first'), () => calls.push('second')] },
            'Trigger',
          ),
      },
      attachTo: document.body,
    }),
  )
  await settle()
  await wrapper.get('button').trigger('blur')
  expect(calls).toEqual(['first', 'second'])
})

it('rejects disabled trigger buttons like the source invariant', async () => {
  const captured: unknown[] = []
  const Parent = defineComponent({
    errorCaptured(error: unknown) {
      captured.push(error)
      return false
    },
    render: () =>
      h(Tooltip, { text: 'Tip' }, { default: () => h('button', { disabled: true }, 'Trigger') }),
  })
  track(mount(Parent, { attachTo: document.body }))
  await settle()
  expect(captured).toHaveLength(1)
  expect((captured[0] as Error).message).toContain('interactive content')
})

it('opens and closes for keyboard focus in two-level interactive descendants', async () => {
  const focus = vi.fn()
  const blur = vi.fn()
  const wrapper = track(
    mount(Tooltip, {
      props: { text: 'Group help' },
      slots: {
        default: () =>
          h('div', { onFocus: focus, onBlur: blur }, [
            h('span', [h('button', 'First'), h('button', 'Second')]),
          ]),
      },
      attachTo: document.body,
    }),
  )
  await settle()
  const button = wrapper.get('button').element
  const matches = button.matches.bind(button)
  vi.spyOn(button, 'matches').mockImplementation((selector) =>
    selector === ':focus-visible' ? true : matches(selector),
  )
  button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
  expect(
    wrapper.get('[data-component="Tooltip"]').element.classList.contains(':popover-open'),
  ).toBe(true)
  expect(focus).toHaveBeenCalledOnce()
  button.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
  expect(
    wrapper.get('[data-component="Tooltip"]').element.classList.contains(':popover-open'),
  ).toBe(false)
  expect(blur).toHaveBeenCalledOnce()
})

it('closes an open tooltip before its mounted parent overlay consumes Escape', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  const parentEscape = vi.fn((event: KeyboardEvent) => event.preventDefault())
  const Parent = defineComponent({
    setup() {
      let cleanup: (() => void) | undefined
      onMounted(() => {
        cleanup = registerEscapeHandler(parentEscape)
      })
      onBeforeUnmount(() => cleanup?.())
      return () => h(Tooltip, { text: 'Tip' }, { default: () => h('button', 'Trigger') })
    },
  })
  const wrapper = track(mount(Parent, { attachTo: document.body }))
  await settle()
  const button = wrapper.get('button').element
  button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
  await vi.advanceTimersByTimeAsync(50)
  button.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
  )
  expect(parentEscape).not.toHaveBeenCalled()
  expect(
    wrapper.get('[data-component="Tooltip"]').element.classList.contains(':popover-open'),
  ).toBe(false)
  button.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
  )
  expect(parentEscape).toHaveBeenCalledOnce()
})

it('keeps the interactive-content invariant development-only like the source', async () => {
  vi.stubEnv('DEV', false)
  const wrapper = track(
    mount(Tooltip, {
      props: { text: 'Tip' },
      slots: { default: () => h('span', 'Not interactive') },
      attachTo: document.body,
    }),
  )
  await settle()
  expect(wrapper.get('[data-component="Tooltip"]').attributes('popover')).toBe('auto')
})
