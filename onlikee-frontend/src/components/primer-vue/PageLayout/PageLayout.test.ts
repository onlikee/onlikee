// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Fixtures exercise slot matching and controlled pane sizing. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import {
  createSSRApp,
  defineComponent,
  Fragment,
  h,
  nextTick,
  shallowRef,
  type Component,
} from 'vue'
import { renderToString } from '@vue/server-renderer'
import {
  PageLayout,
  PageLayoutHeader,
  PageLayoutContent,
  PageLayoutPane,
  PageLayoutSidebar,
  PageLayoutFooter,
} from './index'
import { asSlot } from '../composables/useSlots'
import DragHandle from './DragHandle.vue'
import classes from './PageLayout.module.css'
import {
  usePaneWidth,
  getDefaultPaneWidth,
  getMaxWidthDiffFromViewport,
  updateAriaValues,
} from './usePaneWidth'

// Vitest's default CSS proxy omits :export values; preserve those numeric exports here.
vi.mock('./PageLayout.module.css', () => ({
  default: new Proxy(
    {
      paneMaxWidthDiffDefault: '511',
      sidebarMaxWidthDiffDefault: '256',
      paneMaxWidthDiffWide: '959',
      paneMaxWidthDiffBreakpoint: '1280',
    },
    { get: (values, name) => (name in values ? values[name as keyof typeof values] : name) },
  ),
}))

let resizeCallback: ResizeObserverCallback
const disconnect = vi.fn()
const wrappers: VueWrapper[] = []
function render(props = {}, paneProps = {}, sidebar = false) {
  const wrapper = mount(PageLayout, {
    props,
    slots: {
      default: () => [
        h(PageLayoutFooter, null, () => 'Footer'),
        h(PageLayoutContent, { 'aria-label': 'Main' }, () => 'Content'),
        h(
          sidebar ? (PageLayoutSidebar as Component) : (PageLayoutPane as Component),
          paneProps,
          () => 'Pane',
        ),
        h(PageLayoutHeader, { 'aria-label': 'Banner' }, () => 'Header'),
      ],
    },
  })
  wrappers.push(wrapper)
  return wrapper
}
function pane(wrapper: VueWrapper, sidebar = false) {
  return wrapper.find<HTMLElement>(`[data-component="PageLayout.${sidebar ? 'Sidebar' : 'Pane'}"]`)
}
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback
      }
      observe = vi.fn()
      disconnect = disconnect
    },
  )
  vi.stubGlobal('innerWidth', 1200)
  localStorage.clear()
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  vi.unstubAllGlobals()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('PageLayout source contract', () => {
  it('keeps a custom Pane max fixed while constraining a custom Sidebar to the viewport', async () => {
    const width = { min: '200px', default: '320px', max: '900px' }
    const content = render({}, { width, resizable: true })
    const sidebar = render({}, { width, resizable: true }, true)
    expect(content.find('[role="slider"]').attributes('aria-valuemax')).toBe('900')
    expect(sidebar.find('[role="slider"]').attributes('aria-valuemax')).toBe('689')
    await content.find('[role="slider"]').trigger('keydown', { key: 'ArrowLeft' })
    await content.find('[role="slider"]').trigger('keyup', { key: 'ArrowLeft' })
    expect(pane(content).element.style.getPropertyValue('--pane-width')).toBe('317px')
  })
  it('exports the compound family with stable identities', () => {
    expect([
      PageLayout.Header,
      PageLayout.Content,
      PageLayout.Pane,
      PageLayout.Sidebar,
      PageLayout.Footer,
    ]).toEqual([
      PageLayoutHeader,
      PageLayoutContent,
      PageLayoutPane,
      PageLayoutSidebar,
      PageLayoutFooter,
    ])
  })
  it('extracts header/footer into the source wrapper and preserves content/pane order', () => {
    const wrapper = render()
    const outer = wrapper.find(`.${classes.PageLayoutWrapper}`)
    expect(outer.attributes('data-width')).toBe('xlarge')
    expect(Array.from(outer.element.children).map((element) => element.tagName)).toEqual([
      'HEADER',
      'DIV',
      'FOOTER',
    ])
    expect(wrapper.find(`.${classes.PageLayoutContent}`).text()).toBe('ContentPane')
    expect(wrapper.find('header').attributes('aria-label')).toBe('Banner')
    expect(wrapper.find('main').attributes('aria-label')).toBe('Main')
    expect(pane(wrapper).attributes('role')).toBeUndefined()
    expect(pane(wrapper).element.style.getPropertyValue('--pane-width')).toBe('296px')
    expect(wrapper.attributes('data-has-sidebar')).toBeUndefined()
  })
  it('moves Sidebar outside header/content/footer and positions its divider on the proper edge', async () => {
    const wrapper = render(
      {},
      { position: 'end', sticky: true, responsiveVariant: 'fullscreen' },
      true,
    )
    expect(wrapper.attributes('data-has-sidebar')).toBe('true')
    const sidebarWrapper = wrapper.find(`.${classes.SidebarWrapper}`)
    expect(sidebarWrapper.attributes()).toMatchObject({
      'data-position': 'end',
      'data-sticky': 'true',
      'data-responsive-variant': 'fullscreen',
    })
    expect(sidebarWrapper.element.children[0]?.getAttribute('data-component')).toBe(
      'PageLayout.VerticalDivider',
    )
    const start = render({}, { position: 'start' }, true)
    expect(
      start.find(`.${classes.SidebarWrapper}`).element.children[0]?.getAttribute('data-component'),
    ).toBe('PageLayout.Sidebar')
  })
  it('recognizes marker wrappers, keeps explicit Fragments intact, and updates live slots', async () => {
    const WrappedHeader = asSlot(
      defineComponent({ setup: () => () => h(PageLayoutHeader, null, () => 'Wrapped') }),
      PageLayoutHeader,
    )
    const show = shallowRef(true)
    const wrapper = mount(PageLayout, {
      slots: {
        default: () => [
          show.value ? h(WrappedHeader) : null,
          h(Fragment, [h(PageLayoutFooter, null, () => 'Fragment')]),
        ],
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.find(`.${classes.PageLayoutWrapper} > header`).text()).toBe('Wrapped')
    expect(wrapper.find(`.${classes.PageLayoutContent} footer`).text()).toBe('Fragment')
    show.value = false
    await nextTick()
    expect(wrapper.find('header').exists()).toBe(false)
  })
  it('renders custom Content elements and exposes the inner Pane DOM node', () => {
    const wrapper = render(
      { padding: 'condensed', columnGap: 'none', rowGap: 'condensed' },
      { className: 'pane-class', id: 'pane', offsetHeader: 48 },
    )
    const component = wrapper.findComponent(PageLayoutPane)
    expect(component.vm.element).toBe(pane(wrapper).element)
    expect(component.classes()).toContain('pane-class')
    expect(pane(wrapper).attributes('id')).toBe('pane')
    expect((component.element as HTMLElement).style.getPropertyValue('--offset-header')).toBe(
      '48px',
    )
    expect(wrapper.element.style.getPropertyValue('--spacing')).toBe('var(--spacing-condensed)')
    const content = mount(PageLayoutContent, {
      props: { as: 'section', width: 'large' },
      slots: { default: 'Text' },
    })
    wrappers.push(content)
    expect(content.element.tagName).toBe('SECTION')
    expect(content.find(`.${classes.Content}`).attributes('data-width')).toBe('large')
  })
  it('serializes responsive and legacy props without viewport JavaScript', () => {
    const wrapper = render(
      {},
      {
        position: 'start',
        positionWhenNarrow: 'end',
        divider: 'line',
        dividerWhenNarrow: 'filled',
        hidden: { narrow: true, regular: false },
      },
    )
    const outer = wrapper.find(`.${classes.PaneWrapper}`)
    expect(outer.attributes()).toMatchObject({
      'data-position-regular': 'start',
      'data-position-narrow': 'end',
      'data-is-hidden-narrow': 'true',
      'data-is-hidden-regular': 'false',
    })
    expect(wrapper.find(`.${classes.PaneHorizontalDivider}`).attributes()).toMatchObject({
      'data-variant-narrow': 'filled',
      'data-variant-regular': 'line',
    })
    expect(wrapper.find(`.${classes.PaneVerticalDivider}`).attributes()).toMatchObject({
      'data-variant-narrow': 'none',
      'data-variant-regular': 'line',
      'data-variant-wide': 'line',
    })
  })
  it.each([false, true])(
    'makes only overflowing regions focusable and labeled (sidebar=%s)',
    async (sidebar) => {
      const wrapper = render({}, { 'aria-label': 'Details', 'aria-labelledby': 'title' }, sidebar)
      const region = pane(wrapper, sidebar)
      expect(region.attributes('aria-label')).toBeUndefined()
      Object.defineProperties(region.element, {
        scrollHeight: { value: 101 },
        clientHeight: { value: 100 },
      })
      resizeCallback(
        [{ target: region.element } as unknown as ResizeObserverEntry],
        {} as ResizeObserver,
      )
      await nextTick()
      expect(region.attributes()).toMatchObject({
        role: 'region',
        tabindex: '0',
        'aria-labelledby': 'title',
      })
      expect(region.attributes('aria-label')).toBeUndefined()
    },
  )
  it.each([false, true])(
    'resizes by keyboard, persists after keyup, and cleans containment (sidebar=%s)',
    async (sidebar) => {
      const wrapper = render({}, { resizable: true, widthStorageKey: 'width' }, sidebar)
      const handle = wrapper.find('[role="slider"]')
      const region = pane(wrapper, sidebar)
      expect(handle.attributes()).toMatchObject({
        'aria-label': 'Draggable pane splitter',
        'aria-valuemin': '256',
        'aria-valuemax': '689',
        'aria-valuenow': '296',
      })
      await handle.trigger('keydown', { key: 'ArrowRight' })
      expect(region.element.style.getPropertyValue('--pane-width')).toBe('299px')
      expect(region.attributes('data-dragging')).toBe('true')
      expect(handle.attributes('aria-valuetext')).toBe('Pane width 299 pixels')
      expect(localStorage.getItem('width')).toBeNull()
      await handle.trigger('keyup', { key: 'ArrowRight' })
      expect(region.attributes('data-dragging')).toBeUndefined()
      expect(localStorage.getItem('width')).toBe('299')
      await handle.trigger('dblclick')
      expect(region.element.style.getPropertyValue('--pane-width')).toBe('296px')
      expect(localStorage.getItem('width')).toBe('296')
    },
  )
  it('reverses keyboard deltas for Sidebar end and uses controlled callbacks instead of storage', async () => {
    const onResizeEnd = vi.fn()
    const wrapper = mount(PageLayoutSidebar, {
      props: {
        position: 'end',
        resizable: true,
        currentWidth: 400,
        onResizeEnd,
        widthStorageKey: 'controlled',
      },
    })
    wrappers.push(wrapper)
    const handle = wrapper.find('[role="slider"]')
    await handle.trigger('keydown', { key: 'ArrowRight' })
    expect(pane(wrapper, true).element.style.getPropertyValue('--pane-width')).toBe('397px')
    await handle.trigger('keyup', { key: 'ArrowRight' })
    expect(onResizeEnd).toHaveBeenLastCalledWith(397)
    expect(localStorage.getItem('controlled')).toBeNull()
    await wrapper.setProps({ currentWidth: 420 })
    expect(pane(wrapper, true).element.style.getPropertyValue('--pane-width')).toBe('420px')
    await wrapper.setProps({ currentWidth: undefined })
    expect(pane(wrapper, true).element.style.getPropertyValue('--pane-width')).toBe('296px')
  })
  it.each(['start', 'end'] as const)(
    'coalesces pointer positions, uses relative drag width, and cancels stale frames (%s)',
    async (position) => {
      vi.useFakeTimers()
      const frames: FrameRequestCallback[] = []
      vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
        frames.push(callback)
        return frames.length
      })
      const cancel = vi.fn()
      vi.stubGlobal('cancelAnimationFrame', cancel)
      const wrapper = render({}, { resizable: true, position })
      const handle = wrapper.find('[role="slider"]')
      vi.spyOn(pane(wrapper).element, 'getBoundingClientRect').mockReturnValue({
        width: 300,
      } as DOMRect)
      handle.element.dispatchEvent(
        new MouseEvent('pointerdown', { button: 0, clientX: 500, bubbles: true }),
      )
      handle.element.dispatchEvent(new MouseEvent('pointermove', { clientX: 510, bubbles: true }))
      handle.element.dispatchEvent(new MouseEvent('pointermove', { clientX: 520, bubbles: true }))
      expect(frames).toHaveLength(1)
      frames[0]!(0)
      expect(pane(wrapper).element.style.getPropertyValue('--pane-width')).toBe(
        position === 'start' ? '320px' : '280px',
      )
      handle.element.dispatchEvent(new MouseEvent('pointermove', { clientX: 530, bubbles: true }))
      await handle.trigger('lostpointercapture')
      expect(cancel).toHaveBeenCalledWith(2)
      expect(pane(wrapper).attributes('data-dragging')).toBeUndefined()
    },
  )
  it('reads only valid persisted widths and does not persist Sidebar without a key', async () => {
    localStorage.setItem('paneWidth', '350.7')
    expect(
      pane(render({}, { resizable: true })).element.style.getPropertyValue('--pane-width'),
    ).toBe('351px')
    const wrapper = render({}, { resizable: true }, true)
    expect(pane(wrapper, true).element.style.getPropertyValue('--pane-width')).toBe('296px')
    await wrapper.find('[role="slider"]').trigger('keydown', { key: 'ArrowRight' })
    await wrapper.find('[role="slider"]').trigger('keyup', { key: 'ArrowRight' })
    expect(localStorage.length).toBe(1)
  })
  it('clamps to viewport on resize and removes optimization flags after 150ms', async () => {
    vi.useFakeTimers()
    const wrapper = render({}, { resizable: true, currentWidth: 650, onResizeEnd: vi.fn() })
    vi.stubGlobal('innerWidth', 900)
    window.dispatchEvent(new Event('resize'))
    expect(pane(wrapper).element.style.getPropertyValue('--pane-width')).toBe('389px')
    expect(wrapper.find('[role="slider"]').attributes('aria-valuemax')).toBe('389')
    expect(pane(wrapper).attributes('data-dragging')).toBe('true')
    vi.advanceTimersByTime(150)
    expect(pane(wrapper).attributes('data-dragging')).toBeUndefined()
  })
  it('retains standalone drag handle naming and formatter APIs', () => {
    const handleRef = shallowRef<HTMLDivElement | null>(null)
    const wrapper = mount(DragHandle, {
      props: {
        handleRef,
        onDragStart: vi.fn(),
        onDrag: vi.fn(),
        onDragEnd: vi.fn(),
        'aria-label': 'Width',
        'aria-labelledby': 'label',
        'aria-valuenow': 400,
        formatValueText: (value) => `${value} wide`,
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(wrapper.attributes('aria-valuetext')).toBe('400 wide')
    expect(handleRef.value).toBe(wrapper.element)
    updateAriaValues(handleRef.value, { current: 420 }, (value) => `${value} wide`)
    expect(wrapper.attributes('aria-valuetext')).toBe('420 wide')
  })
  it('uses source width constants and supports the standalone reactive hook', async () => {
    expect(getDefaultPaneWidth('small')).toBe(256)
    expect(getDefaultPaneWidth({ min: '100px', default: '200px', max: '500px' })).toBe(200)
    expect(getMaxWidthDiffFromViewport()).toBe(511)
    vi.stubGlobal('innerWidth', 1400)
    expect(getMaxWidthDiffFromViewport()).toBe(959)
    const width = shallowRef<'small' | 'large'>('small')
    const wrapper = mount(
      defineComponent({
        setup() {
          const sizing = usePaneWidth(() => ({
            width: width.value,
            minWidth: 100,
            resizable: false,
            paneRef: shallowRef(null),
            handleRef: shallowRef(null),
          }))
          return () => h('span', sizing.currentWidth.value)
        },
      }),
    )
    wrappers.push(wrapper)
    expect(wrapper.text()).toBe('256')
    width.value = 'large'
    await nextTick()
    expect(wrapper.text()).toBe('320')
  })
  it('renders accessible SSR sliders and hydrates the complete family', async () => {
    const renderTree = () =>
      h(PageLayout, null, () => [
        h(PageLayoutHeader, null, () => 'Header'),
        h(PageLayoutContent, null, () => 'Main'),
        h(PageLayoutPane as Component, { resizable: true }, () => 'Pane'),
        h(PageLayoutSidebar as Component, { resizable: true }, () => 'Sidebar'),
        h(PageLayoutFooter, null, () => 'Footer'),
      ])
    const html = await renderToString(createSSRApp({ render: renderTree }))
    expect(html).toContain('aria-valuetext="Pane width 296 pixels"')
    expect(html).toContain('aria-valuemax="600"')
    const container = document.createElement('div')
    container.innerHTML = html
    const warn = vi.spyOn(console, 'warn')
    const app = createSSRApp({ render: renderTree })
    app.mount(container)
    await nextTick()
    expect(container.querySelectorAll('[role="slider"]')).toHaveLength(2)
    expect(warn.mock.calls.flat().join(' ')).not.toMatch(/hydration/i)
    app.unmount()
  })
})
