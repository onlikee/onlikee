// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Independent consumers verify scoped context. */
import { afterEach, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, type Component } from 'vue'
import { FeatureFlags, useFeatureFlag, type FeatureFlagValues } from './index'
import { Portal, registerPortalRoot } from '../Portal'
import { Timeline } from '../Timeline'
import { Button, IconButton, LinkButton } from '../Button'

const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})

it('updates inherited flags through Portal and keeps siblings outside the scope isolated', async () => {
  const target = document.createElement('div')
  document.body.append(target)
  registerPortalRoot(target, 'feature-flags-test')
  const flags = ref<FeatureFlagValues>({
    primer_react_timeline_list_semantics: true,
    primer_react_button_loading_disabled_styles: true,
  })
  const childFlags = ref<FeatureFlagValues>({})
  const Content = defineComponent({
    setup: () => () => [
      h(Timeline, {}, () => [h(Timeline.Item, {}, () => 'Event'), h(Timeline.Break)]),
      h(Button, { loading: true }, () => 'Save'),
    ],
  })
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h('main', [
          h(FeatureFlags, { flags: flags.value }, () => [
            h('section', { 'data-zone': 'parent' }, [h(Content)]),
            h(FeatureFlags, { flags: childFlags.value }, () =>
              h(Portal, { containerName: 'feature-flags-test' }, () => h(Content)),
            ),
          ]),
          h('section', { 'data-zone': 'sibling' }, [h(Content)]),
        ]),
    }),
  )
  wrappers.push(wrapper)
  async function check(parent: boolean, child: boolean) {
    await nextTick()
    await flushPromises()
    const parentRoot = wrapper.get('[data-zone="parent"]').element
    const siblingRoot = wrapper.get('[data-zone="sibling"]').element
    for (const [root, enabled] of [
      [parentRoot, parent],
      [target, child],
      [siblingRoot, false],
    ] as const) {
      expect(root.querySelector('ol[role="list"]') !== null).toBe(enabled)
      expect(root.querySelector('li[role="presentation"]') !== null).toBe(enabled)
      expect(root.querySelector('button')?.hasAttribute('data-loading-disabled-styles')).toBe(
        enabled,
      )
    }
  }
  await check(true, true)
  flags.value.primer_react_timeline_list_semantics = false
  flags.value.primer_react_button_loading_disabled_styles = false
  await check(false, false)
  flags.value = {
    primer_react_timeline_list_semantics: true,
    primer_react_button_loading_disabled_styles: true,
  }
  childFlags.value = {
    primer_react_timeline_list_semantics: undefined,
    primer_react_button_loading_disabled_styles: false,
  }
  await check(true, false)
  childFlags.value = {}
  await check(true, true)
})

it('returns a reactive boolean ref without adding a provider wrapper', async () => {
  const Consumer = defineComponent({
    setup() {
      const enabled = useFeatureFlag('example')
      const unknown = useFeatureFlag('unknown')
      return () => h('output', `${enabled.value}/${unknown.value}`)
    },
  })
  const wrapper = mount(FeatureFlags, {
    props: { flags: { example: true } },
    slots: { default: () => h(Consumer) },
  })
  wrappers.push(wrapper)
  expect(wrapper.html()).toBe('<output>true/false</output>')
  expect(wrapper.text()).toBe('true/false')
  await wrapper.setProps({ flags: { example: false } })
  expect(wrapper.text()).toBe('false/false')
})

it.each([Button, IconButton, LinkButton])(
  'updates loading styles through the $name wrapper without replacing its native element',
  async (component) => {
    const click = vi.fn()
    const wrapper = mount(FeatureFlags, {
      props: { flags: { primer_react_button_loading_disabled_styles: false } },
      slots: {
        default: () =>
          h(
            component as Component,
            {
              loading: true,
              onClick: click,
              ...(component === IconButton
                ? { icon: 'svg', 'aria-label': 'Save', unsafeDisableTooltip: true }
                : {}),
              ...(component === LinkButton ? { href: '#save' } : {}),
            },
            () => 'Save',
          ),
      },
    })
    wrappers.push(wrapper)
    const node = wrapper.get(component === LinkButton ? 'a' : 'button')
    expect(node.attributes('data-loading-disabled-styles')).toBeUndefined()
    await wrapper.setProps({ flags: { primer_react_button_loading_disabled_styles: true } })
    expect(wrapper.get(component === LinkButton ? 'a' : 'button').element).toBe(node.element)
    expect(node.attributes('data-loading-disabled-styles')).toBe('true')
    expect(node.attributes('aria-disabled')).toBe('true')
    expect(node.attributes('disabled')).toBeUndefined()
    await node.trigger('click')
    expect(click).not.toHaveBeenCalled()
    await wrapper.setProps({ flags: {} })
    expect(node.attributes('data-loading-disabled-styles')).toBeUndefined()
  },
)
