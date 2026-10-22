// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Independent lifecycle and hydration fixtures. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import {
  createSSRApp,
  defineComponent,
  h,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  shallowRef,
  useId,
} from 'vue'
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
  it('mounts connected children and refs before the parent mounted hook in one render', () => {
    const child = shallowRef<HTMLButtonElement | null>(null)
    const onMount = vi.fn(() => expect(child.value?.isConnected).toBe(true))
    const parentMounted = vi.fn(() => {
      expect(child.value).toBeInstanceOf(HTMLButtonElement)
      expect(child.value?.isConnected).toBe(true)
      child.value?.focus()
    })
    const render = vi.fn(() =>
      h(Portal, { onMount }, { default: () => h('button', { ref: child }, 'Content') }),
    )
    track(
      mount(
        defineComponent({
          setup() {
            onMounted(parentMounted)
            return render
          },
        }),
      ),
    )
    expect(render).toHaveBeenCalledOnce()
    expect(parentMounted).toHaveBeenCalledOnce()
    expect(onMount).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(child.value)
  })

  it('uses the default registered container and keeps each portal stacking context at 1', async () => {
    const onMount = vi.fn()
    track(mount(Portal, { props: { onMount }, slots: { default: () => h('button', 'Content') } }))
    await flushPromises()
    const portal = document.querySelector<HTMLElement>(
      '#__primerPortalRoot__ > [data-component="Portal"]',
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
    const host = input.parentElement
    input.value = 'Edited'
    await wrapper.setProps({ value: { portalContainerName: 'second' } })
    await flushPromises()
    expect(first.querySelector('input')).toBeNull()
    expect(second.querySelector('input')).toBe(input)
    expect(input.parentElement).toBe(host)
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

  it('preserves focused content and child lifecycles when an inline callback changes', async () => {
    const onMount = vi.fn()
    const childMounted = vi.fn()
    const childUnmounted = vi.fn()
    const Child = defineComponent({
      setup() {
        onMounted(childMounted)
        onUnmounted(childUnmounted)
        return () => h('input')
      },
    })
    const wrapper = track(
      mount(Portal, {
        props: { onMount: () => onMount() },
        slots: { default: () => h(Child) },
      }),
    )
    const input = document.querySelector('input')!
    input.focus()
    input.value = 'Edited'
    await wrapper.setProps({ onMount: () => onMount() })
    expect(document.activeElement).toBe(input)
    expect(input.value).toBe('Edited')
    expect(childMounted).toHaveBeenCalledOnce()
    expect(childUnmounted).not.toHaveBeenCalled()
    expect(onMount).toHaveBeenCalledOnce()
  })

  it('reuses declarative roots, honors data-portal-root and recreates removed defaults', () => {
    const custom = document.createElement('main')
    custom.setAttribute('data-portal-root', '')
    document.body.append(custom)
    const first = track(mount(Portal, { slots: { default: () => 'First' } }))
    const generated = custom.querySelector<HTMLElement>('#__primerPortalRoot__')!
    expect(generated.style.cssText).toBe('position: absolute; top: 0px; left: 0px; width: 100%;')
    expect(generated.style.zIndex).toBe('')
    first.unmount()
    wrappers.splice(wrappers.indexOf(first), 1)
    generated.remove()
    const declared = document.createElement('div')
    declared.id = '__primerPortalRoot__'
    custom.append(declared)
    track(mount(Portal, { slots: { default: () => 'Second' } }))
    expect(document.querySelectorAll('#__primerPortalRoot__')).toHaveLength(1)
    expect(declared.textContent).toBe('Second')
  })

  it('uses an imperatively registered default root without creating a generated root', () => {
    const root = document.createElement('div')
    document.body.append(root)
    registerPortalRoot(root)
    track(mount(Portal, { slots: { default: () => 'Registered' } }))
    expect(root.textContent).toBe('Registered')
    expect(document.getElementById('__primerPortalRoot__')).toBeNull()
  })

  it('keeps logical injection and slots through nested portals and provider overrides', () => {
    const outer = container('nested-outer')
    const inner = container('nested-inner')
    const message = Symbol('message')
    const Child = defineComponent({
      setup() {
        const value = inject(message)
        return () => h('button', String(value))
      },
    })
    const App = defineComponent({
      setup() {
        provide(message, 'Provided')
        return () =>
          h(
            PortalContext.Provider,
            { value: { portalContainerName: 'nested-outer' } },
            {
              default: () =>
                h(Portal, null, {
                  default: () => [
                    h('span', 'Outer'),
                    h(
                      PortalContext.Provider,
                      { value: { portalContainerName: 'nested-inner' } },
                      {
                        default: () => h(Portal, null, { default: () => h(Child) }),
                      },
                    ),
                  ],
                }),
            },
          )
      },
    })
    track(mount(App))
    expect(outer.textContent).toBe('Outer')
    expect(inner.textContent).toBe('Provided')
    expect(outer.querySelectorAll('[data-component="Portal"]')).toHaveLength(1)
    expect(inner.querySelectorAll('[data-component="Portal"]')).toHaveLength(1)
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

  it('reattaches the same host when context changes even with an explicit container', async () => {
    const explicit = container('explicit-context-change')
    const onMount = vi.fn()
    const wrapper = track(
      mount(PortalContext.Provider, {
        props: { value: { portalContainerName: 'unused-first' } },
        slots: {
          default: () =>
            h(
              Portal,
              { containerName: 'explicit-context-change', onMount },
              {
                default: () => h('input'),
              },
            ),
        },
      }),
    )
    const host = explicit.firstElementChild
    const input = explicit.querySelector('input')!
    input.value = 'Edited'
    await wrapper.setProps({ value: { portalContainerName: 'unused-second' } })
    expect(explicit.firstElementChild).toBe(host)
    expect(explicit.querySelector('input')).toBe(input)
    expect(input.value).toBe('Edited')
    expect(onMount).toHaveBeenCalledTimes(2)
  })

  it('keeps arbitrary attributes and listeners off its implementation host', () => {
    const onClick = vi.fn()
    track(
      mount(Portal, {
        attrs: { id: 'ignored', class: 'ignored', role: 'dialog', onClick },
        slots: { default: () => h('button', 'Content') },
      }),
    )
    const host = document.querySelector('[data-component="Portal"]')!
    expect(host.hasAttribute('id')).toBe(false)
    expect(host.hasAttribute('class')).toBe(false)
    expect(host.hasAttribute('role')).toBe(false)
    host.querySelector('button')!.click()
    expect(onClick).not.toHaveBeenCalled()
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

  it('hydrates empty markup without warnings and preserves sibling IDs and child lifecycle', async () => {
    const childMounted = vi.fn()
    const childUnmounted = vi.fn()
    const Id = defineComponent({
      props: { name: { type: String, required: true } },
      setup(props) {
        const id = useId()
        if (props.name === 'portal') {
          onMounted(childMounted)
          onUnmounted(childUnmounted)
        }
        return () => h('button', { id, 'data-name': props.name }, props.name)
      },
    })
    const App = defineComponent({
      setup: () => () => [
        h(Id, { name: 'before' }),
        h(Portal, null, { default: () => h(Id, { name: 'portal' }) }),
        h(Id, { name: 'after' }),
      ],
    })
    const root = document.createElement('div')
    root.innerHTML = await renderToString(createSSRApp(App))
    document.body.append(root)
    const ids = [...root.querySelectorAll('button')].map((element) => element.id)
    expect(root.querySelector('[data-name="portal"]')).toBeNull()
    const warn = vi.spyOn(console, 'warn')
    const error = vi.spyOn(console, 'error')
    const app = createSSRApp(App)
    app.mount(root)
    await nextTick()
    await flushPromises()
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    expect([...root.querySelectorAll('button')].map((element) => element.id)).toEqual(ids)
    expect(
      new Set([...document.querySelectorAll('button')].map((element) => element.id)).size,
    ).toBe(3)
    expect(childMounted).toHaveBeenCalledOnce()
    app.unmount()
    expect(childUnmounted).toHaveBeenCalledOnce()
    expect(document.querySelector('[data-component="Portal"]')).toBeNull()
  })
})
