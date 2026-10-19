// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, onMounted, onUnmounted } from 'vue'
import { renderToString } from '@vue/server-renderer'
import Hidden, { Hidden as NamedHidden, type HiddenProps } from './index'

const wrappers: VueWrapper[] = []
function render(
  props: HiddenProps,
  attrs: Record<string, unknown> = {},
  content = () => h('span', 'Child'),
) {
  const wrapper = mount(Hidden, { props, attrs, slots: { default: content } })
  wrappers.push(wrapper)
  return wrapper
}

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
})

describe('Hidden', () => {
  it('exports the same component through named and default entries', () => {
    expect(Hidden).toBe(NamedHidden)
  })

  it('renders a div, component marker and default slot without extra attributes', () => {
    const wrapper = render({ when: 'regular' })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('data-component')).toBe('Hidden')
    expect(wrapper.get('span').text()).toBe('Child')
    expect(wrapper.attributes('when')).toBeUndefined()
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.attributes('hidden')).toBeUndefined()
  })

  it.each(['narrow', 'regular', 'wide'] as const)('supports the single %s viewport', (when) => {
    const wrapper = render({ when })
    expect(wrapper.attributes('style')).toBe(`--hiddenDisplay-${when}: none;`)
  })

  it('supports multiple viewports and removes obsolete values after updates', async () => {
    const wrapper = render({ when: ['narrow', 'wide'] })
    expect(wrapper.attributes('style')).toBe(
      '--hiddenDisplay-narrow: none; --hiddenDisplay-wide: none;',
    )
    await wrapper.setProps({ when: 'regular' })
    expect(wrapper.attributes('style')).toBe('--hiddenDisplay-regular: none;')
    await wrapper.setProps({ when: [] })
    expect((wrapper.element as HTMLElement).style.length).toBe(0)
    await wrapper.setProps({ when: ['narrow', 'regular', 'wide'] })
    expect((wrapper.element as HTMLElement).style.length).toBe(3)
  })

  it('merges React and Vue class names and lets user styles override generated values', async () => {
    const wrapper = render(
      {
        when: 'narrow',
        className: 'source-class',
        style: { '--hiddenDisplay-narrow': 'flex', color: 'red' },
      },
      { class: 'vue-class' },
    )
    expect(wrapper.classes()).toEqual([
      'source-class',
      'vue-class',
      expect.stringContaining('Hidden'),
    ])
    const element = wrapper.element as HTMLElement
    expect(element.style.getPropertyValue('--hiddenDisplay-narrow')).toBe('flex')
    expect(element.style.color).toBe('red')
    await wrapper.setProps({ className: 'updated', style: { display: 'grid' } })
    expect(wrapper.classes()).toContain('updated')
    expect(wrapper.classes()).not.toContain('source-class')
    expect(element.style.getPropertyValue('--hiddenDisplay-narrow')).toBe('none')
    expect(element.style.color).toBe('')
    expect(element.style.display).toBe('grid')
  })

  it('matches the source component by ignoring undeclared attributes and listeners', async () => {
    const click = vi.fn()
    const wrapper = render(
      { when: 'wide' },
      { id: 'ignored', 'aria-hidden': true, 'data-component': 'Override', onClick: click },
    )
    expect(wrapper.attributes('id')).toBeUndefined()
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.attributes('data-component')).toBe('Hidden')
    await wrapper.trigger('click')
    expect(click).not.toHaveBeenCalled()
  })

  it('keeps children mounted and preserves their state when when changes', async () => {
    const mounted = vi.fn()
    const unmounted = vi.fn()
    const Child = defineComponent({
      setup() {
        onMounted(mounted)
        onUnmounted(unmounted)
        return () => h('input')
      },
    })
    const wrapper = render({ when: 'narrow' }, {}, () => h(Child))
    const input = wrapper.get('input')
    await input.setValue('retained')
    await wrapper.setProps({ when: ['regular', 'wide'] })
    expect(wrapper.get('input').element).toBe(input.element)
    expect(input.element.value).toBe('retained')
    expect(mounted).toHaveBeenCalledOnce()
    expect(unmounted).not.toHaveBeenCalled()
  })

  it('renders content and responsive styles during SSR', async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(Hidden, { when: ['narrow', 'wide'] }, () => 'Content') }),
    )
    expect(html).toContain('data-component="Hidden"')
    expect(html).toContain('--hiddenDisplay-narrow:none;--hiddenDisplay-wide:none;')
    expect(html).toContain('Content')
  })
})
