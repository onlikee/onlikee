// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, h, shallowRef } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Portal, PortalContext, registerPortalRoot } from './index'

const wrappers: VueWrapper[] = []
const track = (wrapper: VueWrapper) => {
  wrappers.push(wrapper)
  return wrapper
}
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})
function container(name: string) {
  const element = document.createElement('div')
  element.id = name
  document.body.append(element)
  registerPortalRoot(element, name)
  return element
}

describe('Portal', () => {
  it('uses the default registered container and keeps each portal stacking context at 1', async () => {
    const onMount = vi.fn()
    track(mount(Portal, { props: { onMount }, slots: { default: () => h('button', 'Content') } }))
    await flushPromises()
    const portal = document.querySelector<HTMLElement>(
      '#__primerVuePortalRoot__ > [data-component="Portal"]',
    )!
    expect(portal.style.position).toBe('relative')
    expect(portal.style.zIndex).toBe('1')
    expect(portal.textContent).toBe('Content')
    expect(onMount).toHaveBeenCalledOnce()
  })

  it('reads the nearest Provider and moves the existing content when its value changes', async () => {
    const first = container('first')
    const second = container('second')
    const onMount = vi.fn()
    const callback = shallowRef(onMount)
    const wrapper = track(
      mount(PortalContext.Provider, {
        props: { value: { portalContainerName: 'first' } },
        slots: {
          default: () => h(Portal, { onMount: callback.value }, { default: () => h('input') }),
        },
      }),
    )
    await flushPromises()
    const input = first.querySelector('input')!
    input.value = 'Edited'
    await wrapper.setProps({ value: { portalContainerName: 'second' } })
    await flushPromises()
    expect(first.querySelector('input')).toBeNull()
    expect(second.querySelector('input')).toBe(input)
    expect(input.value).toBe('Edited')
    expect(onMount).toHaveBeenCalledTimes(2)
    const changedCallback = vi.fn()
    callback.value = changedCallback
    await flushPromises()
    expect(second.querySelector('input')).toBe(input)
    expect(changedCallback).not.toHaveBeenCalled()
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(second.children).toHaveLength(0)
  })

  it('lets an explicit containerName override the context, including an empty name', async () => {
    const inherited = container('inherited')
    const explicit = container('')
    track(
      mount(PortalContext.Provider, {
        props: { value: { portalContainerName: 'inherited' } },
        slots: { default: () => h(Portal, { containerName: '' }, { default: () => 'Explicit' }) },
      }),
    )
    await flushPromises()
    expect(explicit.textContent).toBe('Explicit')
    expect(inherited.textContent).toBe('')
  })

  it('reports an unregistered named container instead of using the default root', async () => {
    const errorHandler = vi.fn()
    track(
      mount(Portal, {
        props: { containerName: 'unregistered-portal' },
        global: { config: { errorHandler } },
      }),
    )
    await flushPromises()
    expect(errorHandler).toHaveBeenCalledOnce()
    expect(errorHandler.mock.calls[0]![0].message).toContain(
      "Portal container 'unregistered-portal' is not yet registered.",
    )
    expect(document.querySelector('[data-component="Portal"]')).toBeNull()
  })

  it('does not create portal DOM or invoke onMount during server rendering', async () => {
    const onMount = vi.fn()
    const before = document.body.innerHTML
    const html = await renderToString(createSSRApp(Portal, { onMount }))
    expect(html).not.toContain('data-component="Portal"')
    expect(document.body.innerHTML).toBe(before)
    expect(onMount).not.toHaveBeenCalled()
  })
})
