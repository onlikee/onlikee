// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, h, nextTick, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import Admonition, { Admonition as NamedAdmonition } from './index'
import type { AdmonitionProps } from './index'
import { Link } from '../Link'

const wrappers: VueWrapper[] = []
function track<T extends VueWrapper>(wrapper: T): T {
  wrappers.push(wrapper)
  return wrapper
}
afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers.length = 0
})

describe('Admonition', () => {
  it('renders a static note with an accessible type and a decorative Octicon', () => {
    expect(Admonition).toBe(NamedAdmonition)
    const wrapper = track(mount(Admonition, { slots: { default: 'Read the documentation.' } }))
    expect(wrapper.attributes()).toMatchObject({
      role: 'note',
      'data-component': 'Admonition',
      'data-type': 'info',
    })
    expect(wrapper.attributes('aria-live')).toBeUndefined()
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.find('[class*="Title"]').exists()).toBe(false)
    expect(wrapper.get('svg.octicon-info').attributes('height')).toBe('16')
    expect(wrapper.get('svg').element.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(wrapper.get('span').text()).toBe('Information:')
    expect(wrapper.text()).toContain('Read the documentation.')
    expect(wrapper.vm.element).toBe(wrapper.element)
  })

  it.each([
    ['critical', 'stop', 'Critical'],
    ['info', 'info', 'Information'],
    ['success', 'check-circle', 'Success'],
    ['upsell', 'light-bulb', 'Recommendation'],
    ['warning', 'alert', 'Warning'],
  ] as const)('communicates %s through its icon and accessible text', (type, icon, label) => {
    const wrapper = track(mount(Admonition, { props: { type } }))
    expect(wrapper.get(`svg.octicon-${icon}`).attributes('height')).toBe('16')
    expect(wrapper.get('span').text()).toBe(`${label}:`)
  })

  it('supports a text title and a rich title slot with an explicit heading level', async () => {
    const wrapper = track(
      mount(Admonition, {
        props: { title: 'Fallback', titleAs: 'h3' },
        slots: { title: () => ['Configure ', h('code', 'config.yaml')], default: 'Instructions' },
      }),
    )
    expect(wrapper.get('h3').text()).toBe('Configure config.yaml')
    expect(wrapper.get('h3 code').text()).toBe('config.yaml')
    expect(wrapper.text()).not.toContain('Fallback')
    await wrapper.setProps({ titleAs: 'h4' })
    expect(wrapper.find('h3').exists()).toBe(false)
    expect(wrapper.get('h4 code').text()).toBe('config.yaml')
    const textTitle = track(mount(Admonition, { props: { title: 'Read first' } }))
    expect(textTitle.get('[class*="Title"]').element.tagName).toBe('DIV')
    expect(textTitle.get('[class*="Title"]').text()).toBe('Read first')
    await textTitle.setProps({ title: undefined })
    expect(textTitle.find('[class*="Title"]').exists()).toBe(false)
  })

  it('keeps icon, type label and state in sync when props change', async () => {
    const wrapper = track(mount(Admonition, { props: { type: 'warning' } as AdmonitionProps }))
    await wrapper.setProps({ type: 'success', typeLabel: '成功' })
    expect(wrapper.attributes('data-type')).toBe('success')
    expect(wrapper.find('svg.octicon-alert').exists()).toBe(false)
    expect(wrapper.find('svg.octicon-check-circle').exists()).toBe(true)
    expect(wrapper.get('span').text()).toBe('成功:')
    await wrapper.setProps({ typeLabel: '' })
    expect(wrapper.find('span').exists()).toBe(false)
    await wrapper.setProps({ type: undefined, typeLabel: undefined })
    expect(wrapper.attributes('data-type')).toBe('info')
    expect(wrapper.get('span').text()).toBe('Information:')
  })

  it('forwards native attributes and events while preserving internal markers', async () => {
    const onClick = vi.fn()
    const wrapper = track(
      mount(Admonition, {
        props: { type: 'warning', className: 'source-class' },
        attrs: {
          class: { 'vue-class': true },
          id: 'message',
          dir: 'rtl',
          style: { marginTop: '4px' },
          'aria-labelledby': 'external-title',
          'data-type': 'success',
          'data-component': 'other',
          onClick,
        },
      }),
    )
    expect(wrapper.attributes()).toMatchObject({
      id: 'message',
      dir: 'rtl',
      'aria-labelledby': 'external-title',
      'data-type': 'warning',
      'data-component': 'Admonition',
    })
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['source-class', 'vue-class', expect.stringContaining('Admonition')]),
    )
    expect(wrapper.attributes('className')).toBeUndefined()
    expect((wrapper.element as HTMLDivElement).style.marginTop).toBe('4px')
    expect(wrapper.get('svg').attributes('id')).toBeUndefined()
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders updated slot content, nested notes and interactive children without moving them', async () => {
    const title = ref('Before')
    const onClick = vi.fn()
    const wrapper = track(
      mount(() =>
        h(
          Admonition,
          { type: 'warning' },
          {
            title: () => title.value,
            default: () => [
              h('p', 'Instructions'),
              h(Admonition, { type: 'info', title: 'Nested' }, () =>
                h(Link, { as: 'button', onClick }, () => 'Details'),
              ),
            ],
          },
        ),
      ),
    )
    expect(wrapper.findAll('[data-component="Admonition"]')).toHaveLength(2)
    title.value = 'After'
    await nextTick()
    expect(wrapper.get('[class*="Title"]').text()).toBe('After')
    await wrapper.get('button').trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    expect(wrapper.get('button').element.closest('[aria-hidden="true"]')).toBeNull()
  })

  it('hydrates the server-rendered note with the same content and working links', async () => {
    const onClick = vi.fn()
    const Root = () =>
      h(Admonition, { title: 'Before you start', titleAs: 'h3' }, () =>
        h(Link, { as: 'button', onClick }, () => 'Details'),
      )
    const host = document.createElement('div')
    host.innerHTML = await renderToString(createSSRApp(Root))
    const before = host.innerHTML
    const warn = vi.spyOn(console, 'warn')
    const error = vi.spyOn(console, 'error')
    const app = createSSRApp(Root)
    try {
      app.mount(host)
      expect(host.innerHTML).toBe(before)
      expect(host.querySelector('h3')?.textContent).toBe('Before you start')
      host.querySelector('button')!.click()
      expect(onClick).toHaveBeenCalledOnce()
      expect(warn).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
    } finally {
      app.unmount()
      warn.mockRestore()
      error.mockRestore()
    }
  })
})
