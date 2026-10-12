// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Independent custom link and reactive slot fixtures. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import {
  Fragment,
  createSSRApp,
  defineComponent,
  h,
  nextTick,
  shallowRef,
  type Component,
} from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Breadcrumb, Breadcrumbs, BreadcrumbsItem, type BreadcrumbsItemInstance } from './index'
import { registerEscapeHandler } from '../internal/documentRegistries'

const wrappers: VueWrapper[] = []
let containerWidth = 800
let itemWidth = 100
let observerCallback: ResizeObserverCallback
const observe = vi.fn()
const disconnect = vi.fn()

function items(count: number, label = 'Item') {
  return Array.from({ length: count }, (_, index) =>
    h(
      BreadcrumbsItem as Component,
      { href: `#${index}`, id: `crumb-${index}`, selected: index === count - 1 },
      () => `${label} ${index}`,
    ),
  )
}
async function settle() {
  await nextTick()
  await flushPromises()
  await nextTick()
}
async function render(count = 6, props: Record<string, unknown> = { overflow: 'menu' }) {
  const wrapper = mount(Breadcrumbs, {
    props,
    slots: { default: () => items(count) },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  await settle()
  return wrapper
}
function resize(width: number) {
  containerWidth = width
  observerCallback([{ contentRect: { width } } as ResizeObserverEntry], {} as ResizeObserver)
}
function visibleLabels(wrapper: VueWrapper) {
  return wrapper.findAll('ol > li > [data-component="Breadcrumbs.Item"]').map((node) => node.text())
}

beforeEach(() => {
  containerWidth = 800
  itemWidth = 100
  observe.mockClear()
  disconnect.mockClear()
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.tagName === 'NAV' ? containerWidth : this.tagName === 'LI' ? itemWidth : 28
  })
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        observerCallback = callback
      }
      observe = observe
      disconnect = disconnect
      unobserve = vi.fn()
    },
  )
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('Breadcrumbs source contracts', () => {
  it('exports the deprecated alias and compound Item', () => {
    expect(Breadcrumb).toBe(Breadcrumbs)
    expect(Breadcrumbs.Item).toBe(BreadcrumbsItem)
  })

  it('uses the default nav, wrapper items and fixed navigation name without observing wrap', async () => {
    const wrapper = await render(3, {
      className: 'source',
      class: 'vue',
      style: { paddingTop: 4 },
      'aria-label': 'Override',
    })
    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes()).toMatchObject({
      'aria-label': 'Breadcrumbs',
      'data-component': 'Breadcrumbs',
      'data-overflow': 'wrap',
      'data-variant': 'normal',
    })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['source', 'vue']))
    expect((wrapper.element as HTMLElement).style.paddingTop).toBe('4px')
    expect(wrapper.findAll('ol > li')).toHaveLength(3)
    expect(wrapper.find('ol svg').exists()).toBe(false)
    expect(wrapper.find('details').exists()).toBe(false)
    expect(observe).not.toHaveBeenCalled()
  })

  it('preserves text children before collapsing and renders an empty list', async () => {
    const wrapper = mount(Breadcrumbs, {
      slots: { default: () => ['Plain', h(BreadcrumbsItem as Component, null, () => 'Leaf')] },
    })
    wrappers.push(wrapper)
    expect(wrapper.findAll('li').map((node) => node.text())).toEqual(['Plain', 'Leaf'])
    expect((await render(0)).findAll('li')).toHaveLength(0)
  })

  it('keeps an explicit Fragment as one breadcrumb child', () => {
    const wrapper = mount(Breadcrumbs, {
      slots: {
        default: () => [
          h(Fragment, null, items(2)),
          h(BreadcrumbsItem as Component, null, () => 'Leaf'),
        ],
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.findAll('ol > li')).toHaveLength(2)
    expect(wrapper.get('ol > li').findAll('a')).toHaveLength(2)
  })

  it.each([
    ['menu', 800, 6, [2, 3, 4, 5], 2],
    ['menu', 544, 3, [0, 1, 2], null],
    ['menu', 543, 3, [2], 2],
    ['menu', 320, 2, [0, 1], null],
    ['menu', 150, 2, [1], 1],
    ['menu-with-root', 800, 6, [0, 3, 4, 5], 2],
    ['menu-with-root', 800, 4, [0, 1, 2, 3], 0],
    ['menu-with-root', 300, 3, [0, 2], 1],
    ['menu-with-root', 200, 3, [2], 2],
  ])('matches %s at width %i for %i items', async (overflow, width, count, visible, hidden) => {
    containerWidth = width
    const wrapper = await render(count, { overflow })
    expect(visibleLabels(wrapper)).toEqual(visible.map((index) => `Item ${index}`))
    const summary = wrapper.find('summary')
    expect(summary.exists()).toBe(hidden !== null)
    if (hidden !== null)
      expect(summary.attributes('aria-label') ?? summary.attributes('aria-labelledby')).toBeTruthy()
    if (hidden !== null) expect(wrapper.get('[data-component="Tooltip"]')).toBeTruthy()
    if (hidden !== null)
      expect(wrapper.get('[data-component="ActionList"]').findAll('li')).toHaveLength(hidden)
  })

  it('includes the source separator allowance when deciding to collapse', async () => {
    containerWidth = 550
    itemWidth = 180
    const wrapper = await render(3)
    expect(visibleLabels(wrapper)).toEqual(['Item 1', 'Item 2'])
  })

  it('moves links into Details/ActionList without duplicate IDs or hidden measurement copies', async () => {
    const wrapper = await render()
    expect(wrapper.get('details').attributes('data-component')).toBe('Breadcrumbs.MenuItem')
    expect(wrapper.get('summary').attributes()).toMatchObject({
      role: 'button',
      'data-component': 'IconButton',
      'data-variant': 'invisible',
      'data-size': 'small',
      'aria-expanded': 'false',
    })
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('[data-collapsed]').exists()).toBe(false)
    expect(wrapper.findAll('a')).toHaveLength(6)
    for (let index = 0; index < 6; index++)
      expect(wrapper.findAll(`#crumb-${index}`)).toHaveLength(1)
    expect(wrapper.get('[data-component="ActionList"] a').attributes('data-component')).toBe('Link')
    expect(wrapper.findAll('ol > li > span > svg')).toHaveLength(5)
  })

  it('toggles native details and returns focus on Escape', async () => {
    const wrapper = await render()
    const summary = wrapper.get('summary')
    await summary.trigger('click')
    expect((wrapper.get('details').element as HTMLDetailsElement).open).toBe(true)
    expect(summary.attributes('aria-expanded')).toBe('true')
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    await settle()
    expect((wrapper.get('details').element as HTMLDetailsElement).open).toBe(false)
    expect(summary.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(summary.element)
  })

  it('respects consumed Escape and nested registry handlers', async () => {
    const wrapper = await render()
    await wrapper.get('summary').trigger('click')
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    event.preventDefault()
    document.body.dispatchEvent(event)
    await settle()
    expect(wrapper.get('summary').attributes('aria-expanded')).toBe('true')
    const cleanup = registerEscapeHandler((event) => event.preventDefault())
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    await settle()
    expect(wrapper.get('summary').attributes('aria-expanded')).toBe('true')
    cleanup()
  })

  it('closes on primary outside mousedown but ignores menu, trigger and auxiliary clicks', async () => {
    const wrapper = await render()
    const summary = wrapper.get('summary')
    await summary.trigger('click')
    for (const target of [
      summary.element,
      wrapper.get('[data-component="ActionList"] a').element,
    ]) {
      target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
      await settle()
      expect(summary.attributes('aria-expanded')).toBe('true')
    }
    document.body.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true }))
    await settle()
    expect(summary.attributes('aria-expanded')).toBe('true')
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await settle()
    expect(summary.attributes('aria-expanded')).toBe('false')
  })

  it('rounds resize measurements, restores items and disconnects when switching to wrap', async () => {
    const wrapper = await render()
    expect(observe).toHaveBeenCalledOnce()
    resize(543.6)
    await settle()
    expect(visibleLabels(wrapper)).toEqual(['Item 2', 'Item 3', 'Item 4', 'Item 5'])
    resize(543.4)
    await settle()
    expect(visibleLabels(wrapper)).toEqual(['Item 5'])
    resize(800)
    await settle()
    expect(visibleLabels(wrapper)).toEqual(['Item 2', 'Item 3', 'Item 4', 'Item 5'])
    await wrapper.setProps({ overflow: 'wrap' })
    expect(wrapper.find('details').exists()).toBe(false)
    expect(wrapper.findAll('ol > li')).toHaveLength(6)
    expect(disconnect).toHaveBeenCalledOnce()
  })

  it('uses the window resize fallback when ResizeObserver is unavailable', async () => {
    vi.stubGlobal('ResizeObserver', undefined)
    const rect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(() => ({ width: containerWidth, height: 30 }) as DOMRect)
    const wrapper = await render()
    containerWidth = 320
    window.dispatchEvent(new Event('resize'))
    await settle()
    expect(visibleLabels(wrapper)).toEqual(['Item 5'])
    expect(rect).toHaveBeenCalled()
  })

  it('updates menu children with the same count and forwards custom component props and events', async () => {
    const CustomLink = defineComponent({
      props: { to: { type: String, required: true } },
      setup:
        (props, { attrs, slots }) =>
        () =>
          h('a', { ...attrs, href: props.to }, slots.default?.()),
    })
    const label = shallowRef('Old')
    const click = vi.fn((event: MouseEvent) => event.preventDefault())
    const Fixture = defineComponent({
      setup: () => () =>
        h(
          Breadcrumbs,
          { overflow: 'menu' },
          {
            default: () => [
              h(
                BreadcrumbsItem as Component,
                { as: CustomLink, to: '/custom', onClick: click, 'data-test': 'custom' },
                () => label.value,
              ),
              ...items(5),
            ],
          },
        ),
    })
    const wrapper = mount(Fixture, { attachTo: document.body })
    wrappers.push(wrapper)
    await settle()
    expect(wrapper.get('[data-component="ActionList"] [data-test="custom"]').text()).toBe('Old')
    label.value = 'New'
    await settle()
    const link = wrapper.get('[data-component="ActionList"] [data-test="custom"]')
    expect(link.text()).toBe('New')
    expect(link.attributes('href')).toBe('/custom')
    await link.trigger('click')
    expect(click).toHaveBeenCalledOnce()
  })

  it('renders all items during SSR without accessing browser measurement APIs', async () => {
    const app = createSSRApp({
      render: () => h(Breadcrumbs, { overflow: 'menu' }, { default: () => items(6) }),
    })
    const html = await renderToString(app)
    expect(html).not.toContain('<details')
    expect(html.match(/data-component="Breadcrumbs.Item"/g)).toHaveLength(6)
  })
})

describe('Breadcrumbs.Item', () => {
  it('merges classes, forwards native attributes and allows rest attributes to override markers', async () => {
    const click = vi.fn()
    const wrapper = mount(BreadcrumbsItem, {
      props: { selected: true, className: 'source' },
      attrs: {
        class: 'vue',
        href: '/target',
        target: '_blank',
        style: { marginTop: 3 },
        onClick: click,
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['source', 'vue', 'selected']))
    expect(wrapper.attributes('aria-current')).toBe('page')
    expect(wrapper.attributes('href')).toBe('/target')
    expect((wrapper.element as HTMLElement).style.marginTop).toBe('3px')
    await wrapper.trigger('click')
    expect(click).toHaveBeenCalledOnce()
    await wrapper.setProps({ selected: false })
    expect(wrapper.classes()).not.toContain('selected')
    await wrapper.setProps({ 'aria-current': 'step', 'data-component': 'Custom' })
    expect(wrapper.attributes('aria-current')).toBe('step')
    expect(wrapper.attributes('data-component')).toBe('Custom')
  })

  it('exposes and clears the actual DOM ref, including custom component roots', async () => {
    const wrapper = mount(BreadcrumbsItem, { props: { href: '#' } })
    wrappers.push(wrapper)
    const instance = wrapper.vm as unknown as BreadcrumbsItemInstance
    expect(instance.element).toBe(wrapper.element)
    await wrapper.setProps({ as: 'span', selected: true })
    expect(instance.element?.tagName).toBe('SPAN')
    const CustomRoot = defineComponent({ setup: () => () => h('a', { href: '/custom' }, 'Custom') })
    await wrapper.setProps({ as: CustomRoot })
    expect(instance.element).toBe(wrapper.element)
    expect(instance.element?.tagName).toBe('A')
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(instance.element).toBeNull()
  })
})
