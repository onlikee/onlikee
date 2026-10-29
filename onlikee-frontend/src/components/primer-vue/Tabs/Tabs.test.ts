// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Composable hosts mirror the source custom-component examples. */
import { afterEach, describe, expect, test, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { computed, defineComponent, h, nextTick, shallowRef, type PropType } from 'vue'
import { Tabs, useTab, useTabList, useTabPanel } from './index'
import { ActionList } from '../ActionList'
import { FeatureFlags } from '../FeatureFlags'

const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})
const Tab = defineComponent({
  props: { value: { type: String, required: true }, disabled: Boolean, custom: Boolean },
  setup(props, { slots }) {
    const { tabProps } = useTab(() => props)
    return () =>
      props.custom
        ? h(ActionList.Item, { ...tabProps.value, active: tabProps.value['aria-selected'] }, slots)
        : h('button', { ...tabProps.value, type: 'button' }, slots.default?.())
  },
})
const Panel = defineComponent({
  props: { value: { type: String, required: true } },
  setup(props, { slots }) {
    const { tabPanelProps } = useTabPanel(() => props)
    return () => h('div', tabPanelProps.value, slots.default?.())
  },
})
const List = defineComponent({
  props: {
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'horizontal' },
    custom: Boolean,
  },
  setup(props, { slots }) {
    const { tabListProps } = useTabList(() => ({
      'aria-label': 'Tabs',
      'aria-orientation': props.orientation,
    }))
    return () =>
      props.custom
        ? h(ActionList, tabListProps.value, slots)
        : h('div', tabListProps.value, slots.default?.())
  },
})
function fixture(
  options: {
    mode?: 'automatic' | 'manual'
    custom?: boolean
    controlled?: boolean
    orientation?: 'horizontal' | 'vertical'
    disabled?: string[]
  } = {},
) {
  const value = shallowRef('a')
  const values = shallowRef(['a', 'b', 'c'])
  const mode = shallowRef(options.mode ?? 'automatic')
  const onValueChange = vi.fn((selection: { value: string }) => {
    value.value = selection.value
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          Tabs,
          {
            id: 'tabs',
            activationMode: mode.value,
            ...(options.controlled
              ? { value: value.value, onValueChange }
              : { defaultValue: 'a', onValueChange }),
          },
          {
            default: () => [
              h(
                List,
                { custom: options.custom, orientation: options.orientation },
                {
                  default: () =>
                    values.value.map((value) =>
                      h(
                        Tab,
                        {
                          value,
                          custom: options.custom,
                          disabled: options.disabled?.includes(value),
                        },
                        () => value,
                      ),
                    ),
                },
              ),
              ...values.value.map((value) => h(Panel, { value }, () => `${value} content`)),
            ],
          },
        ),
    }),
    { attachTo: document.body },
  )
  wrappers.push(wrapper)
  return { wrapper, value, values, mode, onValueChange }
}
function tab(wrapper: VueWrapper, value: string) {
  return wrapper.get<HTMLElement>(`#tabs-tab-${value}`)
}

describe('Tabs composables', () => {
  test('headless context adds no element and associates tabs and panels', () => {
    const { wrapper } = fixture()
    expect(wrapper.findAll('[role="tablist"]')).toHaveLength(1)
    expect(tab(wrapper, 'a').attributes('aria-controls')).toBe('tabs-panel-a')
    expect(wrapper.get('#tabs-panel-a').attributes('aria-labelledby')).toBe('tabs-tab-a')
    expect(wrapper.get<HTMLElement>('#tabs-panel-b').element.hidden).toBe(true)
    expect(wrapper.get('#tabs-panel-a').attributes('data-selected')).toBe('')
    expect(wrapper.get('[role="tablist"]').attributes('aria-orientation')).toBe('horizontal')
  })
  test.each([false, true])(
    'focus and mousedown select with controlled=%s; repeated selection emits nothing',
    async (controlled) => {
      const { wrapper, onValueChange, value } = fixture({ controlled })
      tab(wrapper, 'b').element.focus()
      await nextTick()
      expect(tab(wrapper, 'b').attributes('aria-selected')).toBe('true')
      await tab(wrapper, 'b').trigger('mousedown', { button: 0 })
      expect(onValueChange).toHaveBeenCalledTimes(1)
      await tab(wrapper, 'c').trigger('mousedown', { button: 0 })
      expect(tab(wrapper, 'c').attributes('aria-selected')).toBe('true')
      if (controlled) {
        value.value = 'a'
        await nextTick()
        expect(tab(wrapper, 'a').attributes('aria-selected')).toBe('true')
        expect(onValueChange).toHaveBeenCalledTimes(2)
      }
    },
  )
  test.each(['ArrowRight', 'ArrowLeft', 'Home', 'End'])(
    'navigates horizontal lists with %s',
    async (key) => {
      const { wrapper } = fixture()
      tab(wrapper, 'b').element.focus()
      await nextTick()
      await tab(wrapper, 'b').trigger('keydown', { key })
      const target = key === 'ArrowRight' || key === 'End' ? 'c' : 'a'
      expect(document.activeElement).toBe(tab(wrapper, target).element)
      expect(tab(wrapper, target).attributes('aria-selected')).toBe('true')
      expect(wrapper.findAll('[role="tab"][tabindex="0"]')).toHaveLength(1)
    },
  )
  test('wraps, ignores perpendicular keys and skips aria-disabled tabs', async () => {
    const { wrapper } = fixture({ disabled: ['b'] })
    tab(wrapper, 'a').element.focus()
    await tab(wrapper, 'a').trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(tab(wrapper, 'a').element)
    await tab(wrapper, 'a').trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tab(wrapper, 'c').element)
    await tab(wrapper, 'c').trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tab(wrapper, 'a').element)
    await tab(wrapper, 'a').trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(tab(wrapper, 'c').element)
    await tab(wrapper, 'b').trigger('mousedown', { button: 0 })
    expect(tab(wrapper, 'b').attributes('aria-selected')).toBe('false')
  })
  test.each(['Enter', ' '])(
    'manual mode tracks focused rather than selected tab and commits with %s',
    async (key) => {
      const { wrapper, onValueChange } = fixture({ mode: 'manual' })
      tab(wrapper, 'a').element.focus()
      await tab(wrapper, 'a').trigger('keydown', { key: 'ArrowRight' })
      await tab(wrapper, 'b').trigger('keydown', { key: 'ArrowRight' })
      expect(document.activeElement).toBe(tab(wrapper, 'c').element)
      expect(tab(wrapper, 'a').attributes('aria-selected')).toBe('true')
      expect(tab(wrapper, 'a').element.tabIndex).toBe(-1)
      expect(tab(wrapper, 'c').element.tabIndex).toBe(0)
      expect(onValueChange).not.toHaveBeenCalled()
      await tab(wrapper, 'c').trigger('keydown', { key })
      expect(tab(wrapper, 'c').attributes('aria-selected')).toBe('true')
      expect(onValueChange).toHaveBeenCalledWith({ value: 'c' })
    },
  )
  test('vertical ActionList and ActionList.Item integrate role, focus, disabled items and active state', async () => {
    const { wrapper } = fixture({ custom: true, orientation: 'vertical', disabled: ['b'] })
    const first = tab(wrapper, 'a')
    expect(wrapper.get('[role="tablist"]').element.tagName).toBe('UL')
    expect(first.attributes('data-active')).toBe('true')
    first.element.focus()
    await first.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(tab(wrapper, 'c').element)
    expect(tab(wrapper, 'c').attributes('aria-selected')).toBe('true')
    expect(tab(wrapper, 'c').attributes('data-active')).toBe('true')
    await tab(wrapper, 'c').trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(first.element)
    expect(wrapper.findAll('[role="tab"][tabindex="0"]')).toHaveLength(1)
  })
  test('reactive options update mode, children, value and ARIA props without stale closures', async () => {
    const { wrapper, mode, values } = fixture()
    mode.value = 'manual'
    values.value = ['a', 'c', 'd']
    await nextTick()
    tab(wrapper, 'a').element.focus()
    await tab(wrapper, 'a').trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(tab(wrapper, 'd').element)
    expect(tab(wrapper, 'a').attributes('aria-selected')).toBe('true')
    await tab(wrapper, 'd').trigger('keydown', { key: 'Enter' })
    expect(wrapper.get<HTMLElement>('#tabs-panel-d').element.hidden).toBe(false)
  })
  test.each([false, true])(
    'forwards object and callback refs and cleans them with merged-ref flag=%s',
    async (enabled) => {
      const output = shallowRef<HTMLDivElement | null>(null)
      const callback = vi.fn()
      const useCallback = shallowRef(false)
      const RefList = defineComponent({
        setup() {
          const options = computed(() => ({
            'aria-label': 'Ref list',
            ref: useCallback.value ? callback : output,
          }))
          const { tabListProps } = useTabList(options)
          return () => h('div', tabListProps.value)
        },
      })
      const wrapper = mount(FeatureFlags, {
        props: { flags: { primer_react_merged_forwarded_refs: enabled } },
        slots: { default: () => h(RefList) },
      })
      wrappers.push(wrapper)
      expect(output.value).toBe(wrapper.get('[role="tablist"]').element)
      useCallback.value = true
      await nextTick()
      expect(output.value).toBeNull()
      expect(callback).toHaveBeenLastCalledWith(wrapper.get('[role="tablist"]').element)
      wrapper.unmount()
      wrappers.pop()
      expect(callback).toHaveBeenLastCalledWith(null)
    },
  )
  test('hooks reject missing Tabs context', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => mount(Tab, { props: { value: 'a' } })).toThrow('within a <Tabs>')
    expect(() => mount(Panel, { props: { value: 'a' } })).toThrow('within a <Tabs>')
  })
})
