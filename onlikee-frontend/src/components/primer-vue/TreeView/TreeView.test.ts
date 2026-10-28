// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, shallowRef, type VNodeChild } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { FileIcon, PencilIcon, TrashIcon } from '@onlikee/octicons-vue'
import { createMemoryHistory, createRouter, RouterLink } from 'vue-router'
import TreeView, { TreeView as NamedTreeView, type TreeViewItemInstance } from './index'
import { PLATFORM_OVERRIDE_KEY } from '../KeybindingHint'
import { Link } from '../Link'
import { IconButton } from '../Button'
import { asSlot } from '../composables/useSlots'

const wrappers: VueWrapper[] = []
const item = (
  id: string,
  props: Record<string, unknown> = {},
  children: () => VNodeChild = () => id,
) => h(TreeView.Item, { id, ...props }, { default: children })
const sub = (children?: () => VNodeChild, props: Record<string, unknown> = {}) =>
  h(TreeView.SubTree, props, children ? { default: children } : {})
function render(children: () => VNodeChild, props: Record<string, unknown> = {}): VueWrapper {
  const wrapper = mount(TreeView, {
    props: { 'aria-label': 'Files', ...props },
    slots: { default: children },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}
function node(id: string) {
  return document.getElementById(id)!
}
async function key(id: string, value: string, options: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', {
    key: value,
    bubbles: true,
    cancelable: true,
    ...options,
  })
  node(id).dispatchEvent(event)
  await nextTick()
  await flushPromises()
  return event
}
async function click(id: string) {
  node(id).click()
  await nextTick()
  await flushPromises()
}
async function settle() {
  await nextTick()
  await flushPromises()
  await nextTick()
}

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  )
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(0), 0),
  )
  vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id))
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 100, 32),
  )
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([
    new DOMRect(0, 0, 100, 32),
  ] as unknown as DOMRectList)
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(32)
  vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(document.body)
})
afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  await settle()
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('TreeView markup and composition', () => {
  it('exports the component family and keeps root semantics and defaults', () => {
    expect(TreeView).toBe(NamedTreeView)
    const wrapper = render(() => item('readme'), {
      className: 'source',
      class: 'vue',
      style: { width: '300px' },
      flat: true,
    })
    const tree = wrapper.get('[role="tree"]')
    expect(tree.element.tagName).toBe('UL')
    expect(tree.classes()).toEqual(expect.arrayContaining(['source', 'vue']))
    expect(tree.attributes()).toMatchObject({
      'aria-label': 'Files',
      'data-omit-spacer': 'true',
      'data-truncate-text': 'true',
    })
    expect((tree.element as HTMLElement).style.width).toBe('300px')
    expect(node('readme').tagName).toBe('LI')
    expect(node('readme').getAttribute('aria-level')).toBe('1')
    expect(node('readme').hasAttribute('aria-expanded')).toBe(false)
  })

  it('does not forward unspecified root attributes', () => {
    const wrapper = render(() => item('readme'), {
      id: 'ignored-root',
      'aria-labelledby': 'external',
      truncate: false,
    })
    expect(wrapper.get('[role="tree"]').attributes('id')).toBeUndefined()
    expect(wrapper.get('[role="tree"]').attributes('aria-labelledby')).toBe('external')
    expect(wrapper.get('[role="tree"]').attributes('data-truncate-text')).toBe('false')
  })

  it('unmounts closed descendants, exposes subtree labels and levels, and preserves nested expansion', async () => {
    render(() =>
      item('src', {}, () => [
        'Source',
        sub(() => item('components', {}, () => ['Components', sub(() => item('button'))])),
      ]),
    )
    expect(node('src').getAttribute('aria-expanded')).toBe('false')
    expect(node('components')).toBeNull()
    await click('src')
    expect(node('components').getAttribute('aria-level')).toBe('2')
    expect(node('src').querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Source')
    await click('components')
    expect(node('button').getAttribute('aria-level')).toBe('3')
    await click('src')
    expect(node('components')).toBeNull()
    await click('src')
    expect(node('components').getAttribute('aria-expanded')).toBe('true')
    expect(node('button')).not.toBeNull()
  })

  it('defaults current branches to expanded and exposes selected focus separately from current', async () => {
    render(() => [
      item('other'),
      item('current', { current: true }, () => ['Current', sub(() => item('child'))]),
    ])
    expect(node('current').getAttribute('aria-current')).toBe('true')
    expect(node('current').getAttribute('aria-expanded')).toBe('true')
    const outside = document.createElement('button')
    document.body.prepend(outside)
    outside.focus()
    node('other').focus()
    await settle()
    expect(document.activeElement).toBe(node('current'))
    expect(node('current').getAttribute('aria-selected')).toBe('true')
    await key('current', 'ArrowDown')
    expect(document.activeElement).toBe(node('child'))
    expect(node('current').getAttribute('aria-selected')).toBe('false')
  })

  it('associates leading and trailing descriptions and updates scoped visual content', async () => {
    render(() =>
      item('src', { containIntrinsicSize: 'auto 32px', 'aria-label': 'Source folder' }, () => [
        h(
          TreeView.LeadingVisual,
          { label: 'Directory' },
          {
            default: ({ isExpanded }: { isExpanded: boolean }) => [
              h(TreeView.DirectoryIcon),
              isExpanded ? 'open' : 'closed',
            ],
          },
        ),
        'Source',
        h(TreeView.TrailingVisual, { label: 'Modified' }, () => h(FileIcon)),
        sub(() => item('child')),
      ]),
    )
    const descriptions = node('src')
      .getAttribute('aria-describedby')!
      .split(' ')
      .map((id) => node(id).textContent)
    expect(descriptions).toEqual(['Directory', 'Modified'])
    expect(node('src').hasAttribute('aria-labelledby')).toBe(false)
    expect(
      node('src').querySelector('.PRIVATE_TreeView-item-container')?.getAttribute('style'),
    ).toContain('content-visibility: auto')
    expect(node('src').querySelector('.PRIVATE_TreeView-item-visual')?.textContent).toBe('closed')
    await click('src')
    expect(node('src').querySelector('.PRIVATE_TreeView-item-visual')?.textContent).toBe('open')
  })

  it('recognizes marked SubTree wrappers and retains leading actions', async () => {
    const Wrapped = asSlot(
      defineComponent({
        setup:
          (_, { slots }) =>
          () =>
            h(TreeView.SubTree, {}, slots),
      }),
      TreeView.SubTree,
    )
    render(() =>
      item('src', {}, () => [
        h(TreeView.LeadingAction, {}, () =>
          h(IconButton, { icon: FileIcon, 'aria-label': 'Grab', variant: 'invisible' }),
        ),
        'src',
        h(Wrapped, {}, () => item('child')),
      ]),
    )
    expect(node('src').getAttribute('data-has-leading-action')).toBe('true')
    expect(
      node('src')
        .querySelector('.PRIVATE_TreeView-item-leading-action')
        ?.getAttribute('aria-hidden'),
    ).toBe('true')
    await click('src')
    expect(node('child')).not.toBeNull()
  })

  it.each(['li', 'a', 'div'] as const)(
    'supports %s with correct wrapper, attributes and forwarded ref',
    (as) => {
      const wrapper = render(() =>
        item('poly', { as, href: '#topic', className: 'custom', 'data-testid': 'poly' }),
      )
      expect(node('poly').tagName).toBe(as.toUpperCase())
      expect(node('poly').getAttribute('role')).toBe('treeitem')
      expect(node('poly').getAttribute('data-testid')).toBe('poly')
      expect(node('poly').parentElement?.getAttribute('role')).toBe(as === 'li' ? 'tree' : 'none')
      expect(
        (wrapper.findComponent(TreeView.Item).vm as unknown as TreeViewItemInstance).element,
      ).toBe(node('poly'))
    },
  )

  it('supports Link and RouterLink as item roots and preserves route navigation', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: ['/start', '/files'].map((path) => ({ path, component: { render: () => null } })),
    })
    await router.push('/start')
    const wrapper = mount(TreeView, {
      props: { 'aria-label': 'Files' },
      slots: {
        default: () => [
          item('link', { as: Link, href: '#link' }),
          item('route', { as: RouterLink, to: '/files' }),
        ],
      },
      global: { plugins: [router] },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    expect(node('link').tagName).toBe('A')
    expect(
      (wrapper.findAllComponents(TreeView.Item)[0]!.vm as unknown as TreeViewItemInstance).element,
    ).toBe(node('link'))
    expect(node('route').getAttribute('href')).toBe('/files')
    await click('route')
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/files'))
  })

  it('updates the forwarded ref when changing root elements and clears it on unmount', async () => {
    const as = shallowRef<'li' | 'a'>('li')
    const wrapper = render(() => item('ref-item', { as: as.value, href: '#file' }))
    const instance = wrapper.findComponent(TreeView.Item).vm as unknown as TreeViewItemInstance
    expect(instance.element).toBe(node('ref-item'))
    as.value = 'a'
    await settle()
    expect(instance.element).toBe(node('ref-item'))
    expect((instance.element as Element).tagName).toBe('A')
    as.value = 'li'
    await settle()
    expect(instance.element).toBe(node('ref-item'))
    expect((instance.element as Element).tagName).toBe('LI')
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(instance.element).toBeNull()
  })
})

describe('TreeView keyboard and state', () => {
  function nested() {
    return render(() => [
      item('src', { defaultExpanded: true }, () => [
        'src',
        sub(() => [item('alpha'), item('nested', {}, () => ['nested', sub(() => item('beta'))])]),
      ]),
      item('zebra'),
    ])
  }
  it('implements visible traversal, Home, End and Backspace without wrapping', async () => {
    nested()
    node('src').focus()
    for (const id of ['alpha', 'nested', 'zebra', 'zebra']) {
      await key((document.activeElement as HTMLElement).id, 'ArrowDown')
      expect(document.activeElement).toBe(node(id))
    }
    await key('zebra', 'ArrowUp')
    expect(document.activeElement).toBe(node('nested'))
    await key('nested', 'Backspace')
    expect(document.activeElement).toBe(node('src'))
    expect(node('src').getAttribute('aria-expanded')).toBe('true')
    await key('src', 'End')
    expect(document.activeElement).toBe(node('zebra'))
    await key('zebra', 'Home')
    expect(document.activeElement).toBe(node('src'))
  })
  it('expands before entering children and collapses before moving to parents', async () => {
    nested()
    node('nested').focus()
    await key('nested', 'ArrowRight')
    expect(node('nested').getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(node('nested'))
    await key('nested', 'ArrowRight')
    expect(document.activeElement).toBe(node('beta'))
    await key('beta', 'ArrowLeft')
    expect(document.activeElement).toBe(node('nested'))
    await key('nested', 'ArrowLeft')
    expect(node('beta')).toBeNull()
    expect(document.activeElement).toBe(node('nested'))
    await key('nested', 'ArrowLeft')
    expect(document.activeElement).toBe(node('src'))
  })
  it.each(['Enter', ' '])(
    'uses %s for select instead of toggling, and supports middle click only',
    async (value) => {
      const select = vi.fn()
      render(() => item('src', { onSelect: select }, () => ['src', sub(() => item('child'))]))
      node('src').focus()
      await key('src', value)
      expect(select).toHaveBeenCalledOnce()
      expect(select.mock.calls[0]![0]).toBeInstanceOf(KeyboardEvent)
      expect(node('src').getAttribute('aria-expanded')).toBe('false')
      await click('src')
      expect(select).toHaveBeenCalledTimes(2)
      node('src').dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 1 }))
      node('src').dispatchEvent(new MouseEvent('auxclick', { bubbles: true, button: 2 }))
      expect(select).toHaveBeenCalledTimes(3)
      ;(node('src').querySelector('.PRIVATE_TreeView-item-toggle') as HTMLElement).click()
      await settle()
      expect(node('src').getAttribute('aria-expanded')).toBe('true')
      expect(select).toHaveBeenCalledTimes(3)
    },
  )
  it.each(['Enter', ' '])('toggles with %s when there is no select callback', async (value) => {
    render(() => item('src', {}, () => ['src', sub(() => item('child'))]))
    await key('src', value)
    expect(node('child')).not.toBeNull()
    await key('src', value)
    expect(node('child')).toBeNull()
  })
  it('does not toggle horizontal expansion with Alt or Meta', async () => {
    render(() => item('src', {}, () => ['src', sub(() => item('child'))]))
    node('src').focus()
    await key('src', 'ArrowRight', { altKey: true })
    await key('src', 'ArrowRight', { metaKey: true })
    expect(node('src').getAttribute('aria-expanded')).toBe('false')
  })
  it('requests controlled changes without changing the value and treats null as a leaf', async () => {
    const expanded = shallowRef(false)
    const change = vi.fn()
    render(() => [
      item('src', { expanded: expanded.value, onExpandedChange: change }, () => [
        'src',
        sub(() => item('child')),
      ]),
      item('leaf', { expanded: null }),
    ])
    await click('src')
    expect(change).toHaveBeenLastCalledWith(true)
    expect(node('child')).toBeNull()
    expanded.value = true
    await settle()
    expect(node('child')).not.toBeNull()
    expect(node('leaf').hasAttribute('aria-expanded')).toBe(false)
  })
  it('searches a multi-character prefix, wraps, resets after 300ms and ignores modifiers', async () => {
    vi.useFakeTimers()
    render(() => [
      item('alpha'),
      item('beta'),
      item('bravo'),
      item('zebra', { 'aria-label': 'Alphabet' }),
    ])
    node('alpha').focus()
    await key('alpha', 'b')
    expect(document.activeElement).toBe(node('beta'))
    await key('beta', 'r')
    expect(document.activeElement).toBe(node('bravo'))
    await vi.advanceTimersByTimeAsync(301)
    await key('bravo', 'a')
    expect(document.activeElement).toBe(node('zebra'))
    await vi.advanceTimersByTimeAsync(301)
    await key('zebra', 'a')
    expect(document.activeElement).toBe(node('alpha'))
    await key('alpha', 'b', { ctrlKey: true })
    expect(document.activeElement).toBe(node('alpha'))
  })
  it('invalidates the typeahead cache when items are inserted and removed', async () => {
    vi.useFakeTimers()
    const added = shallowRef(false)
    render(() => [item('alpha'), added.value ? item('beta') : item('zebra')])
    node('alpha').focus()
    await key('alpha', 'z')
    expect(document.activeElement).toBe(node('zebra'))
    added.value = true
    await settle()
    node('alpha').focus()
    await vi.advanceTimersByTimeAsync(301)
    await key('alpha', 'b')
    expect(document.activeElement).toBe(node('beta'))
  })
})

describe('TreeView asynchronous subtrees and actions', () => {
  it('updates synchronous empty state when only the slot content changes', async () => {
    const populated = shallowRef(true)
    render(() =>
      item('src', { defaultExpanded: true }, () => [
        'src',
        sub(() => (populated.value ? item('child') : null)),
      ]),
    )
    populated.value = false
    await settle()
    expect(node('src').textContent).toContain('No items found')
    await click('src')
    expect(node('src').hasAttribute('aria-expanded')).toBe(false)
    populated.value = true
    await settle()
    expect(node('src').getAttribute('aria-expanded')).toBe('false')
    await click('src')
    expect(node('child')).not.toBeNull()
  })
  it.each([undefined, 3])(
    'renders loading %s, announces completion and transfers focused placeholder to a child',
    async (count) => {
      const state = shallowRef<'loading' | 'done'>('loading')
      render(() =>
        item('src', { defaultExpanded: true }, () => [
          'Source',
          sub(state.value === 'done' ? () => item('child') : undefined, {
            state: state.value,
            count,
          }),
        ]),
      )
      await settle()
      const loading = node('src').querySelector<HTMLElement>('[data-loading]')!
      expect(loading).not.toBeNull()
      expect(loading.textContent).toContain(count ? 'Loading 3 items' : 'Loading...')
      expect(loading.querySelectorAll('.PRIVATE_TreeView-item-skeleton')).toHaveLength(count ?? 0)
      expect(document.body.textContent).toContain('Source content loading')
      loading.focus()
      await settle()
      state.value = 'done'
      await settle()
      await vi.waitFor(() => expect(document.activeElement).toBe(node('child')))
      expect(document.body.textContent).toContain('Source content loaded')
      expect(node('src').querySelector('[data-loading]')).toBeNull()
    },
  )
  it('renders an empty item, retains an open branch and returns focus to its parent after loading', async () => {
    const state = shallowRef<'loading' | 'done'>('loading')
    render(() =>
      item('src', { defaultExpanded: true }, () => [
        'Source',
        sub(undefined, { state: state.value }),
      ]),
    )
    await settle()
    const loading = node('src').querySelector<HTMLElement>('[data-loading]')!
    loading.focus()
    await settle()
    state.value = 'done'
    await settle()
    expect(node('src').getAttribute('aria-expanded')).toBe('true')
    const empty = node('src').querySelector<HTMLElement>('[role="treeitem"]')!
    expect(empty.textContent).toBe('No items found')
    expect(empty.hasAttribute('aria-expanded')).toBe(false)
    await vi.waitFor(() => expect(document.activeElement).toBe(node('src')))
  })
  it('removes aria-expanded from a closed empty synchronous subtree but restores it when opened', async () => {
    render(() => item('src', {}, () => ['src', sub()]))
    await settle()
    expect(node('src').hasAttribute('aria-expanded')).toBe(false)
    await click('src')
    expect(node('src').getAttribute('aria-expanded')).toBe('true')
    expect(node('src').textContent).toContain('No items found')
  })
  it.each(['apple', 'windows', 'other'] as const)(
    'provides %s shortcut hints and runs a single secondary action without selecting the row',
    async (platform) => {
      const action = vi.fn()
      const select = vi.fn()
      const wrapper = mount(TreeView, {
        props: { 'aria-label': 'Actions' },
        slots: {
          default: () =>
            item('src', {
              'aria-label': 'Source',
              onSelect: select,
              secondaryActions: [{ label: 'Edit', icon: PencilIcon, onClick: action, count: 2 }],
            }),
        },
        global: { provide: { [PLATFORM_OVERRIDE_KEY as symbol]: platform } },
        attachTo: document.body,
      })
      wrappers.push(wrapper)
      expect(node('src').getAttribute('aria-label')).toContain(
        platform === 'apple' ? 'command' : 'control',
      )
      const button = node('src').querySelector('button')!
      expect(button.tabIndex).toBe(-1)
      expect(button.getAttribute('aria-hidden')).toBe('true')
      button.click()
      await settle()
      expect(action).toHaveBeenCalledOnce()
      expect(select).not.toHaveBeenCalled()
      node('src').focus()
      await key('src', 'U', { ctrlKey: true, shiftKey: true })
      expect(action).toHaveBeenCalledTimes(2)
      expect(document.querySelector('[role="dialog"]')).toBeNull()
    },
  )
  it('opens the supplemental ActionList dialog, isolates navigation, and restores item focus on Escape', async () => {
    const edit = vi.fn()
    render(() =>
      item(
        'src',
        {
          secondaryActions: [
            { label: 'Edit', icon: PencilIcon, onClick: edit },
            { label: 'Delete', icon: TrashIcon, onClick: vi.fn(), count: 2 },
          ],
        },
        () => ['src', sub(() => item('child'))],
      ),
    )
    node('src').focus()
    await key('src', 'u', { metaKey: true, shiftKey: true })
    await settle()
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!
    expect(dialog.textContent).toContain('Supplemental actions')
    const actions = dialog.querySelectorAll<HTMLElement>('[data-component="ActionList.Item"]')
    actions[0]!.querySelector<HTMLElement>('[data-component="ActionList.Item.Label"]')!.click()
    expect(edit).toHaveBeenCalledOnce()
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await settle()
    expect(node('src').getAttribute('aria-expanded')).toBe('false')
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await settle()
    await vi.waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull())
    await vi.waitFor(() => expect(document.activeElement).toBe(node('src')))
  })
  it.each(['retry', 'dismiss'] as const)(
    'handles error %s through ConfirmationDialog and returns focus to the item',
    async (gesture) => {
      const failed = shallowRef(true)
      const retry = vi.fn(() => {
        failed.value = false
      })
      const dismiss = vi.fn(() => {
        failed.value = false
      })
      render(() =>
        item('src', { defaultExpanded: true }, () => [
          'src',
          sub(
            () =>
              failed.value
                ? h(
                    TreeView.ErrorDialog,
                    { title: 'Load failed', onRetry: retry, onDismiss: dismiss },
                    () => 'Try again',
                  )
                : item('child'),
            { state: failed.value ? 'error' : 'done' },
          ),
        ]),
      )
      await settle()
      const dialog = document.querySelector<HTMLElement>('[role="alertdialog"]')!
      expect(dialog.textContent).toContain('Load failed')
      const button = Array.from(dialog.querySelectorAll('button')).find(
        (el) => el.textContent === (gesture === 'retry' ? 'Retry' : 'Dismiss'),
      )!
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
      await settle()
      expect(node('src').getAttribute('aria-expanded')).toBe('true')
      button.click()
      await settle()
      expect(gesture === 'retry' ? retry : dismiss).toHaveBeenCalledOnce()
      expect(node('src').getAttribute('aria-expanded')).toBe(gesture === 'retry' ? 'true' : 'false')
      await vi.waitFor(() => expect(document.activeElement).toBe(node('src')))
    },
  )
  it('hydrates stable ids, visual descriptions and nested content without warnings', async () => {
    const App = {
      render: () =>
        h(TreeView, { 'aria-label': 'Files' }, () =>
          item('src', { defaultExpanded: true }, () => [
            h(TreeView.LeadingVisual, { label: 'Directory' }, () => h(TreeView.DirectoryIcon)),
            'src',
            sub(() => item('child')),
          ]),
        ),
    }
    const container = document.createElement('div')
    document.body.append(container)
    container.innerHTML = await renderToString(createSSRApp(App))
    const original = container.querySelector('[role="treeitem"]')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const app = createSSRApp(App)
    try {
      app.mount(container)
      await settle()
      expect(container.querySelector('[role="treeitem"]')).toBe(original)
      expect(warn).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
    } finally {
      app.unmount()
    }
  })
})
