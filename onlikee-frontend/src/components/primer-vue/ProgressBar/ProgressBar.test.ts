// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Fixtures exercise conditional slots and SSR hydration. */
import { mount, type VueWrapper } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import {
  Comment,
  Fragment,
  createSSRApp,
  createVNode,
  defineComponent,
  h,
  nextTick,
  shallowRef,
  type HTMLAttributes,
} from 'vue'
import {
  ProgressBar,
  ProgressBarItem,
  type ProgressBarInstance,
  type ProgressBarItemInstance,
  type ProgressBarProps,
  type ProgressBarItemProps,
} from './index'

const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers.length = 0
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})
function track<T extends VueWrapper>(wrapper: T): T {
  wrappers.push(wrapper)
  return wrapper
}

describe('ProgressBar source contract', () => {
  it('exports the compound item and native public prop types', () => {
    expect(ProgressBar.Item).toBe(ProgressBarItem)
    expectTypeOf<ProgressBarProps['barSize']>().toEqualTypeOf<
      'small' | 'default' | 'large' | undefined
    >()
    expectTypeOf<ProgressBarItemProps['progress']>().toEqualTypeOf<string | number | undefined>()
    expectTypeOf<ProgressBarProps['onClick']>().toEqualTypeOf<HTMLAttributes['onClick']>()
    expectTypeOf<ProgressBarItemProps>().not.toHaveProperty('animated')
  })

  it('renders two spans with the default single segment and routes ARIA attributes to it', () => {
    const wrapper = track(
      mount(ProgressBar, {
        props: { progress: 50 },
        attrs: {
          id: 'upload',
          'aria-label': 'Upload file',
          'aria-valuenow': 0,
          'aria-valuetext': 'Half uploaded',
          'aria-labelledby': 'upload-label',
        },
      }),
    )
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.attributes()).toMatchObject({
      'data-component': 'ProgressBar',
      'data-progress-display': 'block',
      'data-progress-bar-size': 'default',
      'aria-labelledby': 'upload-label',
      id: 'upload',
    })
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
    expect(wrapper.attributes('aria-valuetext')).toBeUndefined()
    const item = wrapper.get('[role="progressbar"]')
    expect(item.element.tagName).toBe('SPAN')
    expect(item.attributes()).toMatchObject({
      'data-component': 'ProgressBar.Item',
      'aria-label': 'Upload file',
      'aria-valuenow': '0',
      'aria-valuetext': 'Half uploaded',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
    })
    expect(item.attributes('id')).toBeUndefined()
    expect(item.attributes('aria-labelledby')).toBeUndefined()
    expect(item.attributes('data-animated')).toBeUndefined()
  })

  it.each(['small', 'default', 'large'] as const)(
    'supports the %s size and inline layout',
    (barSize) => {
      const wrapper = track(mount(ProgressBar, { props: { barSize, inline: true } }))
      expect(wrapper.attributes('data-progress-bar-size')).toBe(barSize)
      expect(wrapper.attributes('data-progress-display')).toBe('inline')
    },
  )

  it.each([
    [undefined, '0', '0%'],
    [0, '0', '0%'],
    [33.8, '34', '33.8%'],
    ['33.8', '34', '33.8%'],
    ['33.8extra', '34', '33.8extra%'],
    [-10, '0', '-10%'],
    ['invalid', '0', 'invalid%'],
    [120, '120', '120%'],
  ])('parses progress %s without clamping its visual width', (progress, value, width) => {
    const wrapper = track(mount(ProgressBar, { props: { progress } }))
    const item = wrapper.get('[role="progressbar"]')
    expect(item.attributes('aria-valuenow')).toBe(value)
    expect((item.element as HTMLElement).style.getPropertyValue('--progress-width')).toBe(width)
  })

  it.each([
    [undefined, 'success-emphasis'],
    ['', 'success-emphasis'],
    ['danger', 'danger-emphasis'],
    ['danger.', 'danger-emphasis'],
    ['accent.emphasis', 'accent-emphasis'],
    ['neutral.muted', 'neutral-muted'],
    ['severe.emphasis', 'severe-emphasis'],
    ['sponsor.emphasis', 'sponsor-emphasis'],
    ['done.emphasis', 'done-emphasis'],
    ['attention.emphasis', 'attention-emphasis'],
  ])('resolves bg %s using the same theme token', (bg, token) => {
    const wrapper = track(mount(ProgressBarItem, { props: { progress: 75, bg } }))
    expect(wrapper.element.style.getPropertyValue('--progress-bg')).toBe(`var(--bgColor-${token})`)
    expect(wrapper.element.style.getPropertyValue('--progress-width')).toBe('75%')
  })

  it('keeps segment labels, colors and animation independent from the container', () => {
    const wrapper = track(
      mount(ProgressBar, {
        props: { bg: 'danger.emphasis', animated: true },
        attrs: { 'aria-label': 'Parent', 'aria-valuenow': 80, 'aria-valuetext': 'Parent value' },
        slots: {
          default: () => [
            h(ProgressBar.Item, { progress: 30, bg: 'accent.emphasis', 'aria-label': 'Photos' }),
            h(ProgressBar.Item, { progress: 20, 'data-animated': true }),
          ],
        },
      }),
    )
    const items = wrapper.findAll('[role="progressbar"]')
    expect(items).toHaveLength(2)
    expect(items[0]!.attributes('aria-label')).toBe('Photos')
    expect(items[1]!.attributes('aria-label')).toBeUndefined()
    expect(items[0]!.attributes('aria-valuenow')).toBe('30')
    expect(items[1]!.attributes('aria-valuenow')).toBe('20')
    expect(items[0]!.attributes('aria-valuetext')).toBeUndefined()
    expect(items[0]!.attributes('data-animated')).toBeUndefined()
    expect(items[1]!.attributes('data-animated')).toBe('true')
    expect((items[0]!.element as HTMLElement).style.getPropertyValue('--progress-bg')).toBe(
      'var(--bgColor-accent-emphasis)',
    )
    expect((items[1]!.element as HTMLElement).style.getPropertyValue('--progress-bg')).toBe(
      'var(--bgColor-success-emphasis)',
    )
  })

  it.each([50, '0'])('rejects children combined with truthy progress %s', (progress) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() =>
      mount(ProgressBar, {
        props: { progress },
        slots: { default: () => h(ProgressBarItem, { progress: 20 }) },
      }),
    ).toThrow('You should pass `progress` or children, not both.')
  })

  it('allows children combined with numeric zero as in React', () => {
    const wrapper = track(
      mount(ProgressBar, {
        props: { progress: 0 },
        slots: { default: () => h(ProgressBarItem, { progress: 20 }) },
      }),
    )
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('20')
  })

  it('falls back for empty template slots and preserves explicit Fragments and text children', () => {
    for (const nodes of [[], [h(Comment)], [createVNode(Fragment, null, [], 128)]]) {
      const wrapper = track(mount(ProgressBar, { slots: { default: () => nodes } }))
      expect(wrapper.findAll('[role="progressbar"]')).toHaveLength(1)
    }
    const fragment = track(mount(ProgressBar, { slots: { default: () => h(Fragment, null, []) } }))
    expect(fragment.find('[role="progressbar"]').exists()).toBe(false)
    const text = track(mount(ProgressBar, { slots: { default: 'Loading' } }))
    expect(text.text()).toBe('Loading')
    expect(text.find('[role="progressbar"]').exists()).toBe(false)
  })

  it('updates conditional slots, native attrs, progress and animation reactively', async () => {
    const shown = shallowRef(false)
    const count = shallowRef(0)
    const Parent = defineComponent({
      components: { ProgressBar, ProgressBarItem },
      setup: () => ({ shown, count }),
      template: `<ProgressBar aria-label="Upload"><ProgressBarItem v-if="shown" :progress="count" aria-label="Files" /></ProgressBar>`,
    })
    const wrapper = track(mount(Parent))
    expect(wrapper.get('[role="progressbar"]').attributes('aria-label')).toBe('Upload')
    shown.value = true
    count.value = 33.8
    await nextTick()
    expect(wrapper.get('[role="progressbar"]').attributes('aria-label')).toBe('Files')
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('34')
    shown.value = false
    await nextTick()
    expect(wrapper.get('[role="progressbar"]').attributes('aria-label')).toBe('Upload')

    const single = track(mount(ProgressBar, { props: { progress: 1, animated: false } }))
    expect(single.get('[role="progressbar"]').attributes('data-animated')).toBe('false')
    await single.setProps({
      progress: '66.8',
      animated: true,
      'aria-label': 'Updated',
      inline: true,
    })
    expect(single.get('[role="progressbar"]').attributes()).toMatchObject({
      'aria-valuenow': '67',
      'aria-label': 'Updated',
      'data-animated': 'true',
    })
    expect(single.attributes('data-progress-display')).toBe('inline')
  })

  it('merges native classes and styles, honors overrides and forwards events on both spans', async () => {
    const click = vi.fn()
    const root = track(
      mount(ProgressBar, {
        props: { progress: 50, className: 'source-root' },
        attrs: {
          class: 'vue-root',
          style: { width: 120 },
          'data-component': 'CustomRoot',
          'data-progress-display': 'inline',
          'data-progress-bar-size': 'small',
          onClick: click,
        },
      }),
    )
    expect(root.classes()).toEqual([
      'source-root',
      'vue-root',
      expect.stringContaining('ProgressBarContainer'),
    ])
    expect(root.attributes('data-component')).toBe('CustomRoot')
    expect(root.attributes('data-progress-display')).toBe('inline')
    expect(root.attributes('data-progress-bar-size')).toBe('small')
    expect(root.element.style.width).toBe('120px')
    await root.trigger('click')
    expect(click).toHaveBeenCalledOnce()
    const item = track(
      mount(ProgressBarItem, {
        props: { progress: 50, className: 'source-item' },
        attrs: {
          class: 'vue-item',
          style: { '--progress-width': '70%', '--progress-bg': 'red', marginLeft: 2 },
          'data-component': 'CustomItem',
          'aria-valuemin': 10,
          'aria-valuemax': 90,
          'aria-valuenow': 0,
          role: 'meter',
          tabindex: 0,
          onClick: click,
        },
        slots: { default: '50%' },
      }),
    )
    expect(item.classes()).toEqual([
      'source-item',
      'vue-item',
      expect.stringContaining('ProgressBarItem'),
    ])
    expect(item.attributes()).toMatchObject({
      'data-component': 'CustomItem',
      role: 'progressbar',
      'aria-valuenow': '0',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
    })
    expect(item.element.style.getPropertyValue('--progress-width')).toBe('70%')
    expect(item.element.style.getPropertyValue('--progress-bg')).toBe('red')
    expect(item.element.style.marginLeft).toBe('2px')
    expect(item.text()).toBe('50%')
    await item.trigger('click')
    expect(click).toHaveBeenCalledTimes(2)
    await item.setProps({ style: undefined, progress: 25 })
    expect(item.element.style.getPropertyValue('--progress-width')).toBe('25%')
    expect(item.element.style.marginLeft).toBe('')
  })

  it('exposes and clears the DOM ref for the container and item', () => {
    const root = track(mount(ProgressBar))
    const item = track(mount(ProgressBarItem))
    const rootInstance = root.vm as unknown as ProgressBarInstance
    const itemInstance = item.vm as unknown as ProgressBarItemInstance
    expect(rootInstance.element).toBe(root.element)
    expect(itemInstance.element).toBe(item.element)
    root.unmount()
    item.unmount()
    wrappers.length = 0
    expect(rootInstance.element).toBeNull()
    expect(itemInstance.element).toBeNull()
  })

  it('renders and hydrates the same single and compound DOM without warnings', async () => {
    for (const compound of [false, true]) {
      const App = defineComponent({
        setup: () => () =>
          compound
            ? h(ProgressBar, null, () => [
                h(ProgressBarItem, { progress: '33.8', 'aria-label': 'Files' }),
              ])
            : h(ProgressBar, { progress: '33.8', animated: true, 'aria-label': 'Files' }),
      })
      const html = await renderToString(createSSRApp(App))
      const host = document.createElement('div')
      host.innerHTML = html
      document.body.append(host)
      const original = host.querySelector('[role="progressbar"]')
      const warn = vi.spyOn(console, 'warn')
      const error = vi.spyOn(console, 'error')
      const app = createSSRApp(App)
      app.mount(host)
      expect(host.querySelector('[role="progressbar"]')).toBe(original)
      expect(original?.getAttribute('aria-valuenow')).toBe('34')
      expect(original?.getAttribute('aria-label')).toBe('Files')
      expect(warn).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
      app.unmount()
    }
  })
})
