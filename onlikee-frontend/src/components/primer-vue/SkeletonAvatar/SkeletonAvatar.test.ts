// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { SkeletonAvatar } from './index'

describe('SkeletonAvatar', () => {
  it('renders the default circular 20px avatar as a SkeletonBox', () => {
    const wrapper = mount(SkeletonAvatar)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('data-component')).toBe('SkeletonAvatar')
    expect(wrapper.attributes('data-square')).toBeUndefined()
    expect(wrapper.attributes('data-responsive')).toBeUndefined()
    expect((wrapper.element as HTMLElement).style.getPropertyValue('--avatarSize-regular')).toBe(
      '20px',
    )
    wrapper.unmount()
  })

  it('updates numeric and responsive sizes and square shape', async () => {
    const wrapper = mount(SkeletonAvatar, { props: { size: 48, square: true } })
    expect(wrapper.attributes('data-square')).toBe('')
    expect((wrapper.element as HTMLElement).style.getPropertyValue('--avatarSize-regular')).toBe(
      '48px',
    )
    await wrapper.setProps({ size: { narrow: 24, regular: 40, wide: 64 }, square: false })
    expect(wrapper.attributes('data-responsive')).toBe('')
    expect(wrapper.attributes('data-square')).toBeUndefined()
    const style = (wrapper.element as HTMLElement).style
    expect(style.getPropertyValue('--avatarSize-narrow')).toBe('24px')
    expect(style.getPropertyValue('--avatarSize-regular')).toBe('40px')
    expect(style.getPropertyValue('--avatarSize-wide')).toBe('64px')
    await wrapper.setProps({ size: 32 })
    expect(wrapper.attributes('data-responsive')).toBeUndefined()
    expect(style.getPropertyValue('--avatarSize-regular')).toBe('32px')
    expect(style.getPropertyValue('--avatarSize-narrow')).toBe('')
    expect(style.getPropertyValue('--avatarSize-wide')).toBe('')
    wrapper.unmount()
  })

  it('forwards native attributes and events while keeping component, shape and size precedence', async () => {
    const onClick = vi.fn()
    const wrapper = mount(SkeletonAvatar, {
      props: { size: 48, className: 'avatar' },
      attrs: {
        id: 'loading-avatar',
        class: 'custom',
        'aria-hidden': 'true',
        'data-component': 'CustomAvatar',
        'data-square': '',
        'data-responsive': '',
        style: { '--avatarSize-regular': '80px', margin: 8 },
        onClick,
      },
    })
    expect(wrapper.attributes('id')).toBe('loading-avatar')
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('data-component')).toBe('SkeletonAvatar')
    expect(wrapper.attributes('data-square')).toBeUndefined()
    expect(wrapper.attributes('data-responsive')).toBeUndefined()
    expect(wrapper.classes()).toContain('avatar')
    expect(wrapper.classes()).toContain('custom')
    expect((wrapper.element as HTMLElement).style.getPropertyValue('--avatarSize-regular')).toBe(
      '48px',
    )
    expect((wrapper.element as HTMLElement).style.margin).toBe('8px')
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    wrapper.unmount()
  })
})
