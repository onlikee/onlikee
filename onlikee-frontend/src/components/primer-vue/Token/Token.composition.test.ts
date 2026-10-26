// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Token, IssueLabelToken } from './index'
import { Label } from '../Label'
import { GitBranchIcon } from '@onlikee/octicons-vue'

const components = [
  { name: 'Token', component: Token },
  { name: 'IssueLabelToken', component: IssueLabelToken },
]
const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})

it.each(components)(
  '$name updates its action targets when only onRemove changes',
  async ({ component }) => {
    const first = vi.fn()
    const second = vi.fn()
    const click = vi.fn()
    const wrapper = mount(component, { props: { text: 'Alpha', as: 'button', onClick: click } })
    wrappers.push(wrapper)
    expect(wrapper.element.tagName).toBe('BUTTON')
    await wrapper.setProps({ onRemove: first })
    expect(wrapper.element.tagName).toBe('SPAN')
    const remove = wrapper.get('[class*="token__remove_"]')
    expect(remove.element.tagName).toBe('SPAN')
    expect(remove.attributes('aria-hidden')).toBe('true')
    await remove.trigger('click')
    expect(first).toHaveBeenCalledOnce()
    expect(click).not.toHaveBeenCalled()
    await wrapper.setProps({ onRemove: second })
    await remove.trigger('click')
    expect(first).toHaveBeenCalledOnce()
    expect(second).toHaveBeenCalledOnce()
    await wrapper.setProps({ onRemove: undefined })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.find('[class*="token__remove_"]').exists()).toBe(false)
    await wrapper.trigger('click')
    expect(click).toHaveBeenCalledOnce()
  },
)

it.each(components)(
  '$name invokes keydown before removal even if default is prevented',
  async ({ component }) => {
    const order: string[] = []
    const wrapper = mount(component, {
      props: { text: 'Alpha', hideRemoveButton: true, onRemove: () => order.push('remove') },
      attrs: {
        onKeydown: (event: KeyboardEvent) => {
          event.preventDefault()
          order.push('keydown')
        },
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.find('[class*="token__remove_"]').exists()).toBe(false)
    await wrapper.trigger('keydown', { key: 'Backspace' })
    await wrapper.trigger('keydown', { key: 'Delete' })
    await wrapper.trigger('keydown', { key: 'Enter' })
    expect(order).toEqual(['keydown', 'remove', 'keydown', 'remove', 'keydown'])
  },
)

it.each(components)(
  '$name normalizes native styles and keeps attribute overrides',
  ({ component }) => {
    const wrapper = mount(component, {
      props: { text: 'Alpha', id: 42, as: 'a', href: '#alpha', className: 'custom' },
      attrs: { class: 'native', style: { marginTop: 3, opacity: 0.5 }, 'data-size': 'large' },
    })
    wrappers.push(wrapper)
    const element = wrapper.element as HTMLElement
    expect(element.tagName).toBe('A')
    expect(element.id).toBe('42')
    expect(element.style.marginTop).toBe('3px')
    expect(element.style.opacity).toBe('0.5')
    expect(element.getAttribute('data-size')).toBe('large')
    expect(element.getAttribute('text')).toBe('Alpha')
    expect(wrapper.get('[class*="token__text_"]').text()).toBe('Alpha')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['custom', 'native']))
  },
)

it('updates rich text, native leading visuals and component leading visuals', async () => {
  const wrapper = mount(Token, {
    props: { text: h(Label, null, () => 'Verified'), leadingVisual: GitBranchIcon },
  })
  wrappers.push(wrapper)
  expect(wrapper.get('[data-component="Label"]').text()).toBe('Verified')
  expect(wrapper.find('[class*="token__leading_"] svg').exists()).toBe(true)
  await wrapper.setProps({ text: ['Next ', h('strong', 'event')], leadingVisual: 'i' })
  expect(wrapper.text()).toBe('Next event')
  expect(wrapper.find('[class*="token__leading_"] i').exists()).toBe(true)
  await wrapper.setProps({ size: 'small' })
  expect(wrapper.find('[class*="token__leading_"]').exists()).toBe(false)
})

it.each(components)(
  '$name clears its DOM ref after tag changes and unmount',
  async ({ component }) => {
    const wrapper = mount(component, {
      props: { text: 'Alpha', as: 'button' },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    const instance = wrapper.vm
    expect(instance.element).toBe(wrapper.element)
    instance.focus()
    expect(document.activeElement).toBe(wrapper.element)
    await wrapper.setProps({ as: 'a', href: '#alpha' })
    expect(instance.element).toBe(wrapper.element)
    expect(instance.element?.tagName).toBe('A')
    wrapper.unmount()
    wrappers.pop()
    expect(instance.element).toBeNull()
  },
)

it('hydrates rich text and independent Token actions without replacing server nodes', async () => {
  const click = vi.fn()
  const remove = vi.fn()
  const content = () =>
    h('div', [
      h(Token, {
        as: 'button',
        text: h(Label, null, () => 'Verified'),
        leadingVisual: GitBranchIcon,
        onClick: click,
        onRemove: remove,
      }),
      h(IssueLabelToken, {
        as: 'a',
        href: '#issue',
        text: 'Issue',
        fillColor: 'lightpink',
        onRemove: remove,
      }),
    ])
  const container = document.createElement('div')
  container.innerHTML = await renderToString(createSSRApp(content))
  document.body.append(container)
  const serverButton = container.querySelector('button')!
  const warn = vi.spyOn(console, 'warn')
  const error = vi.spyOn(console, 'error')
  const app = createSSRApp(content)
  try {
    app.mount(container)
    await flushPromises()
    expect(container.querySelector('button')).toBe(serverButton)
    serverButton.click()
    expect(click).toHaveBeenCalledOnce()
    serverButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }))
    await nextTick()
    expect(remove).toHaveBeenCalledOnce()
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  } finally {
    app.unmount()
    container.remove()
  }
})
