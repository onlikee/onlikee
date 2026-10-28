// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, shallowRef } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createMemoryHistory, createRouter, RouterLink } from 'vue-router'
import TopicTag, { TopicTag as NamedTopicTag, TopicTagGroup, type TopicTagInstance } from './index'
import { Link } from '../Link'
import { Stack } from '../Stack'
import { VisuallyHidden } from '../VisuallyHidden'

const wrappers: VueWrapper[] = []
function render(
  props: Record<string, unknown> = {},
  content: () => unknown = () => 'react',
): VueWrapper {
  const wrapper = mount(TopicTag, { props, slots: { default: content }, attachTo: document.body })
  wrappers.push(wrapper)
  return wrapper
}

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('TopicTag', () => {
  it('exports the compound component and renders a bare anchor by default', () => {
    expect(TopicTag).toBe(NamedTopicTag)
    expect(TopicTag.Group).toBe(TopicTagGroup)
    const wrapper = render()
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.text()).toBe('react')
    for (const attr of ['href', 'type', 'role', 'tabindex', 'data-component'])
      expect(wrapper.attributes(attr)).toBeUndefined()
  })

  it('merges classes and forwards attributes, styles and events to the root', async () => {
    const click = vi.fn((event: MouseEvent) => event.preventDefault())
    const wrapper = render({
      href: '#react',
      id: 'topic',
      target: '_blank',
      rel: 'nofollow',
      'aria-label': 'React topic',
      'data-component': 'CustomTopic',
      className: 'source-class',
      class: 'vue-class',
      style: { padding: '4px' },
      onClick: click,
    })
    expect(wrapper.attributes()).toMatchObject({
      href: '#react',
      id: 'topic',
      target: '_blank',
      rel: 'nofollow',
      'aria-label': 'React topic',
      'data-component': 'CustomTopic',
    })
    expect(wrapper.classes()).toEqual([
      'source-class',
      'vue-class',
      expect.stringContaining('prc-TopicTag-TopicTag'),
    ])
    expect((wrapper.element as HTMLElement).style.padding).toBe('4px')
    await wrapper.trigger('click')
    expect(click).toHaveBeenCalledOnce()
    expect(click.mock.calls[0]![0].target).toBe(wrapper.element)
    expect(wrapper.attributes('className')).toBeUndefined()
    await wrapper.setProps({ href: '#vue', className: 'updated' })
    expect(wrapper.attributes('href')).toBe('#vue')
    expect(wrapper.classes()).toContain('updated')
    expect(wrapper.classes()).not.toContain('source-class')
  })

  it('retains native button defaults and disabled activation behavior', async () => {
    const click = vi.fn()
    const wrapper = render({ as: 'button', onClick: click })
    expect(wrapper.attributes('type')).toBeUndefined()
    expect((wrapper.element as HTMLButtonElement).type).toBe('submit')
    ;(wrapper.element as HTMLButtonElement).click()
    expect(click).toHaveBeenCalledOnce()
    await wrapper.setProps({ disabled: true, type: 'button' })
    ;(wrapper.element as HTMLButtonElement).click()
    expect(click).toHaveBeenCalledOnce()
    expect(wrapper.attributes('as')).toBeUndefined()
  })

  it('updates the exposed ref when changing native roots and clears it on unmount', async () => {
    const wrapper = render({ href: '#react' })
    const instance = wrapper.vm as unknown as TopicTagInstance<'a' | 'button' | 'span'>
    instance.element?.focus()
    expect(document.activeElement).toBe(wrapper.element)
    await wrapper.setProps({ as: 'button' })
    expect(instance.element).toBeInstanceOf(HTMLButtonElement)
    await wrapper.setProps({ as: 'span' })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(instance.element).toBe(wrapper.element)
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(instance.element).toBeNull()
  })

  it('forwards custom component props, events, dynamic slot content and public refs', async () => {
    const text = shallowRef('react')
    const activate = vi.fn()
    const CustomTopic = defineComponent({
      props: { destination: { type: String, required: true } },
      emits: ['activate'],
      setup: (props, { slots, emit, expose }) => {
        expose({ label: 'custom-topic' })
        return () =>
          h('a', { href: props.destination, onClick: () => emit('activate') }, slots.default?.())
      },
    })
    const wrapper = render(
      { as: CustomTopic, destination: '#custom', onActivate: activate },
      () => text.value,
    )
    expect(wrapper.attributes('href')).toBe('#custom')
    expect((wrapper.vm as unknown as { element: { label: string } }).element.label).toBe(
      'custom-topic',
    )
    await wrapper.trigger('click')
    expect(activate).toHaveBeenCalledOnce()
    text.value = 'vue'
    await nextTick()
    expect(wrapper.text()).toBe('vue')
  })

  it('composes Group, Link, Stack and accessible rich slot content without extra tag wrappers', () => {
    const wrapper = mount(TopicTag.Group, {
      props: {
        id: 'topics',
        className: 'source-group',
        class: 'vue-group',
        'aria-label': 'Topics',
      },
      slots: {
        default: () => [
          h(TopicTag, { as: Link, href: '#react' }, () =>
            h(Stack, { direction: 'horizontal', gap: 'none' }, () => [
              h('strong', 'react'),
              h(VisuallyHidden, {}, () => ' topic'),
            ]),
          ),
          h(TopicTag, { as: 'button', type: 'button' }, () => 'vue'),
        ],
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes()).toMatchObject({ id: 'topics', 'aria-label': 'Topics' })
    expect(wrapper.classes()).toEqual([
      'source-group',
      'vue-group',
      expect.stringContaining('prc-TopicTagGroup-TopicTagGroup'),
    ])
    expect(Array.from(wrapper.element.children as HTMLCollection, (node) => node.tagName)).toEqual([
      'A',
      'BUTTON',
    ])
    expect(wrapper.get('a').classes()).toEqual(
      expect.arrayContaining([
        expect.stringContaining('prc-Link-Link'),
        expect.stringContaining('prc-TopicTag-TopicTag'),
      ]),
    )
    expect(wrapper.get('strong').text()).toBe('react')
    expect(wrapper.get('a').text()).toBe('react topic')
  })

  it('navigates through RouterLink and preserves link attributes and listener delivery', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: ['/start', '/topics/react'].map((path) => ({
        path,
        component: { render: () => null },
      })),
    })
    await router.push('/start')
    const click = vi.fn()
    const wrapper = mount(TopicTag, {
      props: { as: RouterLink, to: '/topics/react', onClick: click },
      slots: { default: () => 'react' },
      global: { plugins: [router] },
    })
    wrappers.push(wrapper)
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/topics/react')
    await wrapper.trigger('click', { button: 0 })
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/topics/react'))
    expect(click).toHaveBeenCalledOnce()
    expect(wrapper.attributes('aria-current')).toBe('page')
  })

  it('hydrates a group with Link and updates it without hydration warnings', async () => {
    const label = shallowRef('react')
    const App = {
      render: () =>
        h(TopicTag.Group, {}, () => h(TopicTag, { as: Link, href: '#react' }, () => label.value)),
    }
    const container = document.createElement('div')
    document.body.append(container)
    container.innerHTML = await renderToString(createSSRApp(App))
    const anchor = container.querySelector('a')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const app = createSSRApp(App)
    try {
      app.mount(container)
      expect(container.querySelector('a')).toBe(anchor)
      label.value = 'vue'
      await nextTick()
      expect(anchor?.textContent).toBe('vue')
      expect(warn).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
    } finally {
      app.unmount()
    }
  })
})
