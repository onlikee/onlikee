// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { Text } from '../../Text'
import DefaultText from '../../Text'
import { Link } from '../../Link'
import DefaultLink from '../../Link'
import DefaultSpinner, { Spinner } from '../../Spinner'
import { VisuallyHidden } from '../../VisuallyHidden'
import InternalVisuallyHidden from './VisuallyHidden.vue'

describe('table presentation dependency contracts', () => {
  it('preserves source default exports alongside the Vue named exports', () => {
    expect(DefaultText).toBe(Text)
    expect(DefaultLink).toBe(Link)
    expect(DefaultSpinner).toBe(Spinner)
  })
  it('Text forwards native attributes, events and element refs through polymorphic rendering', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Text, {
      props: { as: 'button', size: 'small', weight: 'semibold', whiteSpace: 'nowrap' },
      attrs: { id: 'table-action', class: 'extra', onClick, 'aria-label': 'Table action' },
      slots: { default: () => 'Open' },
    })
    const button = wrapper.get('button')
    expect(button.attributes('id')).toBe('table-action')
    expect(button.classes()).toContain('extra')
    expect(button.attributes('data-size')).toBe('small')
    expect(button.attributes('data-weight')).toBe('semibold')
    expect(button.attributes('data-white-space')).toBe('nowrap')
    expect((wrapper.vm as unknown as { element: Element }).element).toBe(button.element)
    await button.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('Link keeps table-cell actions semantic and consumes deprecated styling props', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Link, {
      props: { as: 'button', muted: true, inline: true, hoverColor: 'red' },
      attrs: { type: 'button', onClick, 'aria-describedby': 'cell-help' },
      slots: { default: () => 'Repository action' },
    })
    const action = wrapper.get('button')
    expect(action.attributes('aria-describedby')).toBe('cell-help')
    expect(action.attributes('data-muted')).toBe('true')
    expect(action.attributes('data-inline')).toBe('true')
    expect(action.attributes('hovercolor')).toBeUndefined()
    expect(action.attributes('hover-color')).toBeUndefined()
    await action.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    expect((wrapper.vm as unknown as { element: Element }).element).toBe(action.element)
    wrapper.unmount()
  })

  it('supports hidden accessible labels with native attributes and internal visibility overrides', async () => {
    const label = mount(VisuallyHidden, {
      props: { className: 'column-name' },
      attrs: { id: 'actions-label', lang: 'en' },
      slots: { default: () => 'Actions' },
    })
    expect(label.get('span').classes()).toContain('column-name')
    expect(label.get('#actions-label').attributes('lang')).toBe('en')
    label.unmount()
    const placeholder = mount(InternalVisuallyHidden, {
      props: { as: 'div', className: 'loading-announcement' },
      slots: { default: () => h('span', 'Loading') },
    })
    expect(placeholder.get('div').classes()).toContain('internal-visually-hidden')
    expect(placeholder.get('div').classes()).toContain('loading-announcement')
    await placeholder.setProps({ isVisible: true })
    expect(placeholder.get('div').classes()).not.toContain('internal-visually-hidden')
    expect(placeholder.text()).toBe('Loading')
    placeholder.unmount()
  })
})
