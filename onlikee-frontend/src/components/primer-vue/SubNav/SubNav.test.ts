// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, shallowRef } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { SubNav } from './index'
import { TextInput } from '../TextInput'
import { Textarea } from '../Textarea'
import { Button } from '../Button'
import { Text } from '../Text'

const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})

it('composes links, search and actions without intercepting native events', async () => {
  const click = vi.fn()
  const wrapper = mount(SubNav, {
    props: { label: 'Repository' },
    slots: {
      default: () => [
        h(SubNav.Links, null, () => [
          h(SubNav.Link, { href: '#code', selected: true }, () => h(Text, null, () => 'Code')),
          h(SubNav.Link, { href: '#issues', selected: false, onClick: click }, () => 'Issues'),
        ]),
        h(TextInput, { 'aria-label': 'Search' }),
      ],
      actions: () => h(Button, null, () => 'New'),
    },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  expect(wrapper.element.tagName).toBe('NAV')
  expect(wrapper.attributes('aria-label')).toBe('Repository')
  expect(wrapper.get('.SubNav-body').element.children).toHaveLength(2)
  expect(wrapper.get('.SubNav-actions button').text()).toBe('New')
  const links = wrapper.findAll('a')
  expect(links[0]?.attributes('aria-current')).toBe('true')
  expect(links[1]?.attributes('aria-current')).toBe('false')
  await links[1]?.trigger('click')
  expect(click).toHaveBeenCalledTimes(1)
  expect(links[0]?.attributes('aria-current')).toBe('true')
  wrapper.get('input').element.focus()
  expect(document.activeElement).toBe(wrapper.get('input').element)
})

it('preserves attribute precedence, action prop precedence, and native link refs', async () => {
  const root = shallowRef<{ element: HTMLElement | null } | null>(null)
  const link = shallowRef<{ element: HTMLAnchorElement | null } | null>(null)
  const selected = shallowRef<boolean | undefined>(undefined)
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          SubNav,
          {
            ref: root,
            label: 'Default',
            'aria-label': 'Override',
            'data-component': 'ignored',
            actions: h('button', 'Prop action'),
          },
          {
            default: () =>
              h(
                SubNav.Link,
                { ref: link, selected: selected.value, href: '#x', style: { padding: 10 } },
                () => 'Link',
              ),
            actions: () => 'Ignored slot',
          },
        ),
    }),
  )
  wrappers.push(wrapper)
  expect(root.value?.element).toBe(wrapper.element)
  expect(link.value?.element).toBe(wrapper.get('a').element)
  expect(wrapper.attributes('aria-label')).toBe('Override')
  expect(wrapper.attributes('data-component')).toBe('SubNav')
  expect(wrapper.get('.SubNav-actions').text()).toBe('Prop action')
  expect(wrapper.get('a').attributes('aria-current')).toBeUndefined()
  expect(wrapper.get('a').element.style.padding).toBe('10px')
  selected.value = true
  await nextTick()
  expect(wrapper.get('a').attributes('aria-current')).toBe('true')
  const override = mount(SubNav.Link, {
    props: { selected: true, to: '/only-an-attribute' },
    attrs: { 'aria-current': 'page', 'data-selected': false, 'data-component': 'ignored' },
  })
  wrappers.push(override)
  expect(override.attributes()).toMatchObject({
    'aria-current': 'page',
    'data-selected': 'false',
    'data-component': 'SubNav.Link',
    to: '/only-an-attribute',
  })
  expect(override.attributes('href')).toBeUndefined()
})

it('hydrates nested input descriptions without warnings', async () => {
  const Root = {
    render: () =>
      h(SubNav, { label: 'Search navigation' }, () => [
        h(SubNav.Links, null, () => h(SubNav.Link, { href: '#all', selected: true }, () => 'All')),
        h(TextInput, { characterLimit: 10, defaultValue: 'abc' }),
        h(Textarea, { characterLimit: 10, defaultValue: 'Details', autoSize: true }),
      ]),
  }
  const host = document.createElement('div')
  host.innerHTML = await renderToString(createSSRApp(Root))
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const app = createSSRApp(Root)
  app.mount(host)
  expect(warn).not.toHaveBeenCalled()
  const id = host.querySelector('input')?.getAttribute('aria-describedby')
  expect(host.querySelector(`[id="${id}"]`)?.textContent).toBe('You can enter up to 10 characters')
  app.unmount()
  warn.mockRestore()
})
