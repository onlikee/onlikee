// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Independent slot and custom root fixtures. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { Comment, Fragment, defineComponent, h, nextTick } from 'vue'
import ButtonGroup, { ButtonGroup as NamedButtonGroup, type ButtonGroupInstance } from './index'
import { Button } from '../Button'
import { FeatureFlags } from '../FeatureFlags'

const wrappers: VueWrapper[] = []
function render(props: Record<string, unknown> = {}, content?: () => unknown): VueWrapper {
  const wrapper = mount(ButtonGroup, {
    props,
    slots: content ? { default: content } : {},
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}
const buttons = () => ['A', 'B', 'C'].map((label) => h('button', { type: 'button' }, label))
beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('ButtonGroup', () => {
  it('renders the default div without an implicit role and exports the same named component', () => {
    expect(ButtonGroup).toBe(NamedButtonGroup)
    const wrapper = render()
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('data-component')).toBe('ButtonGroup')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.element.children).toHaveLength(0)
  })

  it('wraps each button or link separately without changing their props', () => {
    const wrapper = render({}, () => [
      h(Button, { loading: true }, () => 'Loading'),
      h(Button, { as: 'a', href: '/link' }, () => 'Link'),
    ])
    expect(wrapper.element.children).toHaveLength(2)
    expect(wrapper.element.children[0]!.tagName).toBe('DIV')
    expect(wrapper.element.children[0]!.className).toContain('Item')
    expect(wrapper.get('button').attributes('data-loading')).toBe('true')
    expect(wrapper.get('a').attributes('href')).toBe('/link')
  })

  it('forwards attributes, style, classes and events while fixing the component marker', async () => {
    const click = vi.fn()
    const wrapper = render(
      {
        as: 'section',
        role: 'group',
        id: 'group',
        'aria-label': 'Actions',
        className: 'source',
        class: 'vue',
        style: { padding: '4px' },
        'data-component': 'Override',
        onClick: click,
      },
      buttons,
    )
    expect(wrapper.element.tagName).toBe('SECTION')
    expect(wrapper.attributes()).toMatchObject({
      role: 'group',
      id: 'group',
      'aria-label': 'Actions',
      'data-component': 'ButtonGroup',
    })
    expect(wrapper.classes()).toEqual(['source', 'vue', expect.stringContaining('ButtonGroup')])
    expect((wrapper.element as HTMLElement).style.padding).toBe('4px')
    await wrapper.get('button').trigger('click')
    expect(click).toHaveBeenCalledOnce()
    expect(wrapper.attributes('as')).toBeUndefined()
    expect(wrapper.attributes('className')).toBeUndefined()
  })

  it('keeps empty conditional items, ignores template comments, and preserves explicit fragments', () => {
    const wrapper = render({}, () => [
      h(Comment, 'source comment'),
      h(Comment, 'v-if'),
      h(Fragment, {}, [h('button', 'A'), h('button', 'B')]),
    ])
    expect(wrapper.element.children).toHaveLength(2)
    expect(wrapper.element.children[0]!.childElementCount).toBe(0)
    expect(wrapper.element.children[1]!.querySelectorAll('button')).toHaveLength(2)
  })

  it('wraps each v-for entry and updates the list', async () => {
    const Fixture = defineComponent({
      components: { ButtonGroup },
      props: { labels: { type: Array<string>, required: true } },
      template:
        '<ButtonGroup><button v-for="label in labels" :key="label">{{ label }}</button></ButtonGroup>',
    })
    const wrapper = mount(Fixture, { props: { labels: ['A', 'B'] } })
    wrappers.push(wrapper)
    const group = wrapper.get('[data-component="ButtonGroup"]')
    expect(group.element.children).toHaveLength(2)
    await wrapper.setProps({ labels: ['B', 'C', 'D'] })
    expect(group.element.children).toHaveLength(3)
    expect(wrapper.findAll('button').map((button) => button.text())).toEqual(['B', 'C', 'D'])
  })

  it('does not enable roving focus for an ordinary group', async () => {
    const wrapper = render({ role: 'group' }, buttons)
    await nextTick()
    const nodes = wrapper.findAll('button')
    ;(nodes[0]!.element as HTMLElement).focus()
    await nodes[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(nodes[0]!.element)
    expect(nodes.map((node) => node.attributes('tabindex'))).toEqual([
      undefined,
      undefined,
      undefined,
    ])
  })

  it('enables horizontal wrapping only for a toolbar and skips disabled buttons', async () => {
    const wrapper = render({ role: 'toolbar' }, () => [
      h('button', 'A'),
      h('button', { disabled: true }, 'Disabled'),
      h('button', 'C'),
    ])
    await nextTick()
    const nodes = wrapper.findAll('button')
    ;(nodes[0]!.element as HTMLElement).focus()
    await nodes[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(nodes[2]!.element)
    await nodes[2]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(nodes[0]!.element)
    await nodes[0]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(nodes[2]!.element)
    await nodes[2]!.trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(nodes[2]!.element)
    await nodes[2]!.trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(nodes[2]!.element)
  })

  it('cleans up and restores tabindex when the toolbar role changes', async () => {
    const wrapper = render({ role: 'toolbar' }, buttons)
    await nextTick()
    const nodes = wrapper.findAll('button')
    expect(nodes[1]!.attributes('tabindex')).toBe('-1')
    await wrapper.setProps({ role: 'group' })
    expect(nodes.map((node) => node.attributes('tabindex'))).toEqual([
      undefined,
      undefined,
      undefined,
    ])
    ;(nodes[0]!.element as HTMLElement).focus()
    await nodes[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(nodes[0]!.element)
    await wrapper.setProps({ role: 'toolbar' })
    await nodes[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(nodes[1]!.element)
  })

  it.each([false, true])(
    'exposes and clears its element with the merged-ref feature flag %s',
    async (enabled) => {
      const wrapper = mount(FeatureFlags, {
        props: { flags: { primer_react_merged_forwarded_refs: enabled } },
        slots: { default: () => h(ButtonGroup, { role: 'toolbar' }, buttons) },
        attachTo: document.body,
      })
      wrappers.push(wrapper)
      await nextTick()
      const group = wrapper.findComponent(ButtonGroup)
      const instance = group.vm as unknown as ButtonGroupInstance
      expect(instance.element).toBe(group.element)
      const node = group.get('button').element as HTMLElement
      node.focus()
      await group.get('button').trigger('keydown', { key: 'ArrowRight' })
      expect(document.activeElement?.textContent).toBe('B')
      wrapper.unmount()
      wrappers.splice(wrappers.indexOf(wrapper), 1)
      expect(instance.element).toBeNull()
      expect(node.getAttribute('tabindex')).toBeNull()
    },
  )

  it('supports a custom root and retains its component ref', async () => {
    const Root = defineComponent({
      props: { label: { type: String, required: true } },
      setup:
        (props, { slots }) =>
        () =>
          h('section', { 'aria-label': props.label }, slots.default?.()),
    })
    const wrapper = render({ as: Root, label: 'Custom toolbar', role: 'toolbar' }, buttons)
    await nextTick()
    expect(wrapper.element.tagName).toBe('SECTION')
    expect(wrapper.attributes('aria-label')).toBe('Custom toolbar')
    expect((wrapper.vm as unknown as { element: { $el: Element } }).element.$el).toBe(
      wrapper.element,
    )
    const first = wrapper.get('button')
    ;(first.element as HTMLElement).focus()
    await first.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement?.textContent).toBe('B')
  })

  it('supports a callback ref through the Vue public instance', () => {
    const observed: Array<Element | null> = []
    const Fixture = defineComponent({
      render: () =>
        h(
          ButtonGroup,
          {
            ref: (instance) =>
              observed.push(
                ((instance as unknown as ButtonGroupInstance | null)?.element as Element | null) ??
                  null,
              ),
          },
          buttons,
        ),
    })
    const wrapper = mount(Fixture)
    wrappers.push(wrapper)
    expect(observed).toContain(wrapper.get('[data-component="ButtonGroup"]').element)
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(observed.at(-1)).toBeNull()
  })
})
