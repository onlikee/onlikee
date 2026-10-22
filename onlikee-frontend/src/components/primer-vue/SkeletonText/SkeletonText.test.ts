// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { SkeletonText, type SkeletonTextSize } from './index'

describe('SkeletonText', () => {
  it('defaults to one full-width medium body line and forwards attrs', () => {
    const wrapper = mount(SkeletonText, { attrs: { id: 'loading-text' } })
    expect(wrapper.attributes('data-component')).toBe('SkeletonText')
    expect(wrapper.attributes('data-text-skeleton-size')).toBe('bodyMedium')
    expect(wrapper.attributes('id')).toBe('loading-text')
    expect((wrapper.element as HTMLElement).style.width).toBe('100%')
    wrapper.unmount()
  })

  it.each<SkeletonTextSize>([
    'display',
    'titleLarge',
    'titleMedium',
    'titleSmall',
    'bodyLarge',
    'bodyMedium',
    'bodySmall',
    'subtitle',
  ])('supports the %s typography size', (size) => {
    const wrapper = mount(SkeletonText, { props: { size } })
    expect(wrapper.attributes('data-text-skeleton-size')).toBe(size)
    wrapper.unmount()
  })

  it('renders styled lines in a maximum-width container with attributes and events on each line', async () => {
    const onClick = vi.fn()
    const wrapper = mount(SkeletonText, {
      props: { lines: 3, size: 'titleLarge', maxWidth: 250, className: 'line' },
      attrs: {
        'aria-hidden': 'true',
        class: 'custom',
        style: { padding: 12, maxWidth: 500 },
        onClick,
      },
    })
    expect(wrapper.attributes('data-component')).toBe('multilineContainer')
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('line')
    expect(wrapper.classes()).not.toContain('custom')
    expect((wrapper.element as HTMLElement).style.maxWidth).toBe('250px')
    expect((wrapper.element as HTMLElement).style.padding).toBe('12px')
    const lines = wrapper.findAll('[data-component="SkeletonText"]')
    expect(lines).toHaveLength(3)
    for (const line of lines) {
      expect(line.attributes('data-in-multiline')).toBe('true')
      expect(line.attributes('data-text-skeleton-size')).toBe('titleLarge')
      expect(line.attributes('aria-hidden')).toBe('true')
      expect(line.classes()).toContain('line')
      expect(line.classes()).toContain('custom')
      expect((line.element as HTMLElement).style.padding).toBe('')
    }
    await lines[0]!.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('matches the source attribute precedence in single and multiline modes', async () => {
    const wrapper = mount(SkeletonText, {
      props: { maxWidth: 250 },
      attrs: {
        width: '60%',
        'data-component': 'CustomText',
        'data-text-skeleton-size': 'custom-size',
        'data-in-multiline': 'custom',
        style: { height: 32, maxWidth: 500 },
      },
    })
    expect(wrapper.attributes('data-component')).toBe('SkeletonText')
    expect(wrapper.attributes('data-text-skeleton-size')).toBe('custom-size')
    expect((wrapper.element as HTMLElement).style.width).toBe('60%')
    expect((wrapper.element as HTMLElement).style.height).toBe('32px')
    expect((wrapper.element as HTMLElement).style.maxWidth).toBe('250px')
    await wrapper.setProps({ lines: 3.5 })
    const lines = wrapper.findAll('[data-component="CustomText"]')
    expect(lines).toHaveLength(3)
    for (const line of lines) {
      expect(line.attributes('data-in-multiline')).toBe('custom')
      expect(line.attributes('data-text-skeleton-size')).toBe('custom-size')
      expect((line.element as HTMLElement).style.width).toBe('60%')
      expect((line.element as HTMLElement).style.height).toBe('')
    }
    wrapper.unmount()
  })
})
