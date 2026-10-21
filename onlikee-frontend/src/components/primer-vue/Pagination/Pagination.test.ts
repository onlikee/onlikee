// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createMemoryHistory, createRouter, RouterLink } from 'vue-router'
import Pagination, { Pagination as NamedPagination, type PageProps } from './index'
import { buildComponentData } from './model'

const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers.length = 0
  document.body.innerHTML = ''
})
function track<T extends VueWrapper>(wrapper: T): T {
  wrappers.push(wrapper)
  return wrapper
}

describe('Pagination', () => {
  it('exports the same component through both entries', () => {
    expect(Pagination).toBe(NamedPagination)
  })

  it('renders the source landmark, link, current page, icon and break contracts', () => {
    const wrapper = track(mount(Pagination, { props: { pageCount: 15, currentPage: 8 } }))
    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('aria-label')).toBe('Pagination')
    expect(wrapper.attributes('data-component')).toBe('Pagination')
    const previous = wrapper.get('[data-component="Pagination.PreviousPage"]')
    expect(previous.attributes()).toMatchObject({
      href: '#7',
      rel: 'prev',
      'aria-label': 'Previous Page',
    })
    expect(previous.element.firstElementChild?.getAttribute('data-component')).toBe(
      'Pagination.PreviousPageIcon',
    )
    const next = wrapper.get('[data-component="Pagination.NextPage"]')
    expect(next.attributes()).toMatchObject({ href: '#9', rel: 'next', 'aria-label': 'Next Page' })
    expect(next.element.lastElementChild?.getAttribute('data-component')).toBe(
      'Pagination.NextPageIcon',
    )
    expect(wrapper.get('[aria-current="page"]').text()).toBe('8')
    expect(wrapper.get('[aria-current="page"]').attributes('aria-label')).toBe('Page 8')
    expect(wrapper.get('a[href="#1"]').attributes('aria-label')).toBe('Page 1...')
    expect(wrapper.get('a[href="#10"]').attributes('aria-label')).toBe('Page 10...')
    expect(wrapper.findAll('span[role="presentation"]')).toHaveLength(2)
    for (const ellipsis of wrapper.findAll('span[role="presentation"]')) {
      expect(ellipsis.text()).toBe('…')
      expect(ellipsis.attributes('data-component')).toBe('Pagination.Page')
      expect(ellipsis.attributes('href')).toBeUndefined()
    }
  })

  it.each([
    [1, 'prev'],
    [5, 'next'],
  ])(
    'renders page %s boundary as an unfocusable anchor without href or click handler',
    async (currentPage, rel) => {
      const change = vi.fn()
      const wrapper = track(
        mount(Pagination, { props: { pageCount: 5, currentPage, onPageChange: change } }),
      )
      const disabled = wrapper.get(`a[rel="${rel}"]`)
      expect(disabled.attributes()).toMatchObject({
        'aria-hidden': 'true',
        'aria-disabled': 'true',
      })
      expect(disabled.attributes('href')).toBeUndefined()
      expect(disabled.attributes('aria-label')).toBeUndefined()
      expect(disabled.attributes('tabindex')).toBeUndefined()
      await disabled.trigger('click')
      expect(change).not.toHaveBeenCalled()
    },
  )

  it('emits the original event and target page once, stays controlled and leaves navigation to the caller', async () => {
    const change = vi.fn()
    const wrapper = track(
      mount(Pagination, { props: { pageCount: 5, currentPage: 2, onPageChange: change } }),
    )
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    wrapper.get('a[aria-label="Page 3"]').element.dispatchEvent(event)
    expect(change).toHaveBeenCalledExactlyOnceWith(event, 3)
    expect(wrapper.emitted('pageChange')).toEqual([[event, 3]])
    expect(event.defaultPrevented).toBe(false)
    expect(wrapper.get('[aria-current="page"]').text()).toBe('2')
    await wrapper.setProps({ currentPage: 3 })
    expect(wrapper.get('[aria-current="page"]').text()).toBe('3')
    await wrapper.get('a[aria-label="Page 3"]').trigger('click')
    expect(change).toHaveBeenCalledTimes(2)
  })

  it('allows preventDefault and preserves the focused keyed anchor during a controlled window update', async () => {
    const wrapper = track(
      mount(Pagination, {
        props: {
          pageCount: 30,
          currentPage: 8,
          onPageChange: (event) => event.preventDefault(),
        },
        attachTo: document.body,
      }),
    )
    const anchor = wrapper.get('a[aria-label="Page 9"]').element as HTMLAnchorElement
    anchor.focus()
    expect(document.activeElement).toBe(anchor)
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    anchor.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    await wrapper.setProps({ currentPage: 9 })
    expect(wrapper.get('[aria-current="page"]').element).toBe(anchor)
    expect(document.activeElement).toBe(anchor)
    const keydown = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    })
    anchor.dispatchEvent(keydown)
    expect(keydown.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(anchor)
    expect(wrapper.emitted('pageChange')).toHaveLength(1)
  })

  it('uses custom hrefs for every enabled page and updates the builder and page window reactively', async () => {
    const builder = vi.fn((page: number) => `/issues?page=${page}`)
    const wrapper = track(
      mount(Pagination, { props: { pageCount: 15, currentPage: 8, hrefBuilder: builder } }),
    )
    expect(wrapper.get('[aria-current="page"]').attributes('href')).toBe('/issues?page=8')
    expect(builder).toHaveBeenCalledWith(7)
    expect(builder).toHaveBeenCalledWith(9)
    await wrapper.setProps({
      hrefBuilder: (page) => `/pulls?page=${page}`,
      marginPageCount: 0,
      surroundingPageCount: 0,
    })
    expect(wrapper.findAll('a')).toHaveLength(3)
    expect(wrapper.get('[aria-current="page"]').attributes('href')).toBe('/pulls?page=8')
  })

  it.each([
    [true, '', 7],
    [false, 'narrow regular wide', 2],
    [{ narrow: false }, 'narrow', 7],
    [{ regular: false, wide: true }, 'regular', 7],
    [{ wide: false }, 'wide', 7],
    [{ narrow: true, regular: true, wide: true }, '', 7],
    [{}, '', 7],
  ] as const)('maps showPages=%j to source responsive attributes', (showPages, ranges, count) => {
    const wrapper = track(mount(Pagination, { props: { pageCount: 5, currentPage: 2, showPages } }))
    expect(wrapper.get('nav > div').attributes('data-hidden-viewport-ranges')).toBe(ranges)
    expect(wrapper.findAll('a')).toHaveLength(count)
  })

  it('updates showPages between boolean and responsive objects without browser APIs', async () => {
    const wrapper = track(mount(Pagination, { props: { pageCount: 5, currentPage: 2 } }))
    await wrapper.setProps({ showPages: false })
    expect(wrapper.findAll('a')).toHaveLength(2)
    await wrapper.setProps({ showPages: { narrow: false, wide: false } })
    expect(wrapper.findAll('a')).toHaveLength(7)
    expect(wrapper.get('nav > div').attributes('data-hidden-viewport-ranges')).toBe('narrow wide')
  })

  it('forwards and updates root classes, style, native events and ARIA overrides', async () => {
    const click = vi.fn()
    const wrapper = track(
      mount(Pagination, {
        props: { pageCount: 5, currentPage: 2, className: 'source-class' },
        attrs: {
          class: 'vue-class',
          id: 'pages',
          'aria-label': 'Issue pages',
          'data-component': 'CustomPagination',
          style: { marginTop: 12 },
          onClick: click,
        },
      }),
    )
    expect(wrapper.classes()).toContain('source-class')
    expect(wrapper.classes()).toContain('vue-class')
    expect(wrapper.attributes()).toMatchObject({
      id: 'pages',
      'aria-label': 'Issue pages',
      'data-component': 'CustomPagination',
    })
    expect((wrapper.element as HTMLElement).style.marginTop).toBe('12px')
    await wrapper.get('[aria-current="page"]').trigger('click')
    expect(click).toHaveBeenCalledOnce()
    await wrapper.setProps({ className: 'updated', 'aria-label': 'Updated pages' })
    expect(wrapper.classes()).not.toContain('source-class')
    expect(wrapper.classes()).toContain('updated')
    expect(wrapper.attributes('aria-label')).toBe('Updated pages')
  })

  it('passes every non-break item, including disabled boundaries, through renderPage', async () => {
    const renderPage = vi.fn(({ key, number, className, children, ...pageProps }: PageProps) =>
      h('a', { key, class: className, 'data-page-number': number, ...pageProps }, [children]),
    )
    const change = vi.fn()
    const wrapper = track(
      mount(Pagination, {
        props: { pageCount: 10, currentPage: 1, renderPage, onPageChange: change },
      }),
    )
    expect(renderPage).toHaveBeenCalledTimes(10)
    expect(wrapper.findAll('a')).toHaveLength(10)
    expect(wrapper.findAll('[data-component="Pagination.Page"]')).toHaveLength(11)
    expect(wrapper.get('span[role="presentation"]').text()).toBe('…')
    expect(renderPage.mock.calls[0]![0]).toMatchObject({
      key: 'page-prev',
      number: 0,
      'data-component': 'Pagination.Page',
      rel: 'prev',
      'aria-disabled': 'true',
    })
    expect(wrapper.find('[data-component="Pagination.PreviousPage"]').exists()).toBe(false)
    expect(wrapper.find('[data-component="Pagination.PreviousPageIcon"]').exists()).toBe(true)
    await wrapper.get('a[data-page-number="2"][aria-label="Page 2"]').trigger('click')
    expect(change).toHaveBeenCalledOnce()
    expect(change.mock.calls[0]![1]).toBe(2)
  })

  it('composes renderPage with RouterLink without losing labels, styles, disabled states or events', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/issues', component: { render: () => h('main') } }],
    })
    await router.push('/issues?page=2')
    await router.isReady()
    const change = vi.fn()
    const wrapper = track(
      mount(Pagination, {
        props: {
          pageCount: 5,
          currentPage: 2,
          onPageChange: change,
          renderPage: ({ key, number, className, children, ...pageProps }) =>
            h(
              RouterLink,
              { key, to: `/issues?page=${number}`, class: className, ...pageProps },
              { default: () => children },
            ),
        },
        global: { plugins: [router] },
      }),
    )
    const nextPage = wrapper.get('[aria-label="Page 3"]')
    expect(nextPage.attributes('data-component')).toBe('Pagination.Page')
    expect(nextPage.classes().some((className) => className.includes('Page'))).toBe(true)
    await nextPage.trigger('click')
    await flushPromises()
    expect(change).toHaveBeenCalledOnce()
    expect(change.mock.calls[0]![1]).toBe(3)
    expect(router.currentRoute.value.query.page).toBe('3')
  })

  it('renders deterministic SSR output and hydrates the same responsive tree', async () => {
    const change = vi.fn()
    const appProps = {
      pageCount: 15,
      currentPage: 8,
      showPages: { narrow: false },
      onPageChange: change,
    }
    const html = await renderToString(createSSRApp({ render: () => h(Pagination, appProps) }))
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.append(container)
    const before = container.querySelector('[aria-current="page"]')
    const warn = vi.spyOn(console, 'warn')
    const error = vi.spyOn(console, 'error')
    const app = createSSRApp({ render: () => h(Pagination, appProps) })
    app.mount(container)
    expect(container.querySelector('[aria-current="page"]')).toBe(before)
    expect(container.querySelector('nav > div')?.getAttribute('data-hidden-viewport-ranges')).toBe(
      'narrow',
    )
    expect(container.querySelectorAll('a')).toHaveLength(9)
    container.querySelector<HTMLAnchorElement>('[aria-label="Page 9"]')!.click()
    expect(change).toHaveBeenCalledOnce()
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    app.unmount()
    warn.mockRestore()
    error.mockRestore()
  })
})

describe('Pagination component data', () => {
  it('adds ellipsis pronunciation only to the page immediately preceding a break', () => {
    const handler = vi.fn()
    const builder = (page: number) => `/page/${page}`
    expect(
      buildComponentData({ type: 'NUM', num: 4, precedesBreak: true }, builder, handler),
    ).toEqual({
      key: 'page-4',
      content: '4',
      props: {
        href: '/page/4',
        'aria-label': 'Page 4...',
        onClick: handler,
        'aria-current': undefined,
      },
    })
    expect(buildComponentData({ type: 'BREAK', num: 5 }, builder, handler)).toEqual({
      key: 'page-5-break',
      content: '…',
      props: { as: 'span', role: 'presentation' },
    })
  })
})
