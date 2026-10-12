// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { Blankslate } from './index'
import { Button } from '../Button'
import { Link } from '../Link'

const wrappers: VueWrapper[] = []
function render(props: Record<string, unknown> = {}, content?: () => unknown): VueWrapper {
  const wrapper = mount(Blankslate, {
    props,
    slots: content ? { default: content } : {},
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}
function parts() {
  return [
    h(Blankslate.Visual, {}, () => h('svg', { 'aria-hidden': 'true', width: 24, height: 24 })),
    h(Blankslate.Heading, {}, () => 'Heading'),
    h(Blankslate.Description, {}, () => 'Description'),
    h(Blankslate.PrimaryAction, {}, () => 'Primary'),
    h(Blankslate.SecondaryAction, { href: '/secondary' }, () => 'Secondary'),
  ]
}
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('Blankslate', () => {
  it('renders the source hierarchy, stable classes and component markers', () => {
    const wrapper = render({}, parts)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.element.children).toHaveLength(1)
    const root = wrapper.get('[data-component="Blankslate"]')
    expect(root.element.tagName).toBe('DIV')
    expect(root.attributes('data-size')).toBe('medium')
    expect(root.element.children).toHaveLength(5)
    const visual = root.get('[data-component="Blankslate.Visual"]')
    expect(visual.element.tagName).toBe('SPAN')
    expect(visual.classes()).toContain('Blankslate-Visual')
    expect(visual.attributes('aria-hidden')).toBeUndefined()
    expect(visual.get('svg').attributes('aria-hidden')).toBe('true')
    expect(root.get('h2').classes()).toContain('Blankslate-Heading')
    expect(root.get('p').classes()).toContain('Blankslate-Description')
    for (const name of ['PrimaryAction', 'SecondaryAction']) {
      const action = root.get(`[data-component="Blankslate.${name}"]`)
      expect(action.element.tagName).toBe('DIV')
      expect(action.classes()).toContain('Blankslate-Action')
      expect(action.element.children).toHaveLength(1)
    }
    expect(wrapper.findComponent(Button).exists()).toBe(true)
    expect(wrapper.findComponent(Link).exists()).toBe(true)
  })

  it('places ordinary attributes, styles and events outside and custom classes inside', async () => {
    const click = vi.fn()
    const wrapper = render({
      id: 'outer',
      'aria-label': 'Empty state',
      'data-component': 'Outer',
      style: { width: '600px' },
      className: 'source-class',
      class: 'vue-class',
      onClick: click,
    })
    expect(wrapper.attributes('id')).toBe('outer')
    expect(wrapper.attributes('aria-label')).toBe('Empty state')
    expect(wrapper.attributes('data-component')).toBe('Outer')
    expect((wrapper.element as HTMLElement).style.width).toBe('600px')
    expect(wrapper.classes()).not.toContain('source-class')
    expect(wrapper.classes()).not.toContain('vue-class')
    const root = wrapper.get('[data-component="Blankslate"]')
    expect(root.classes()).toEqual(expect.arrayContaining(['source-class', 'vue-class']))
    expect(root.attributes('id')).toBeUndefined()
    await root.trigger('click')
    expect(click).toHaveBeenCalledOnce()
  })

  it.each(['border', 'narrow', 'spacious'])(
    'uses presence attributes for %s and removes false values',
    async (name) => {
      const wrapper = render()
      const root = wrapper.get('[data-component="Blankslate"]')
      expect(root.attributes(`data-${name}`)).toBeUndefined()
      await wrapper.setProps({ [name]: true })
      expect(root.attributes(`data-${name}`)).toBe('')
      await wrapper.setProps({ [name]: false })
      expect(root.attributes(`data-${name}`)).toBeUndefined()
    },
  )

  it.each(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const)('supports heading level %s', (as) => {
    const wrapper = render({}, () => h(Blankslate.Heading, { as }, () => 'Heading'))
    expect(wrapper.get(as).text()).toBe('Heading')
  })

  it('forwards child attributes, classes and events while retaining source markers', async () => {
    const click = vi.fn()
    const wrapper = render({}, () =>
      h(
        Blankslate.Visual,
        {
          id: 'visual',
          'aria-hidden': 'true',
          'data-component': 'Override',
          className: 'source-class',
          class: 'vue-class',
          onClick: click,
        },
        () => 'Visual',
      ),
    )
    const visual = wrapper.get('span')
    expect(visual.attributes()).toMatchObject({
      id: 'visual',
      'aria-hidden': 'true',
      'data-component': 'Blankslate.Visual',
    })
    expect(visual.classes()).toEqual(
      expect.arrayContaining(['Blankslate-Visual', 'source-class', 'vue-class']),
    )
    await visual.trigger('click')
    expect(click).toHaveBeenCalledOnce()
  })

  it.each(['small', 'medium', 'large'] as const)(
    'inherits %s size and uses the Button primary variant',
    (size) => {
      const wrapper = render({ size }, () => h(Blankslate.PrimaryAction, {}, () => 'Action'))
      const button = wrapper.get('button')
      expect(button.attributes('data-variant')).toBe('primary')
      expect(button.attributes('data-size')).toBe(size === 'small' ? 'small' : 'medium')
      expect(button.attributes('type')).toBe('button')
    },
  )

  it('updates the action size reactively and uses the nearest nested container', async () => {
    const wrapper = render({ size: 'small' }, () => [
      h(Blankslate.PrimaryAction, { id: 'outer-action' }, () => 'Outer'),
      h(Blankslate, { size: 'large' }, () =>
        h(Blankslate.PrimaryAction, { id: 'inner-action' }, () => 'Inner'),
      ),
    ])
    expect(wrapper.get('#outer-action').attributes('data-size')).toBe('small')
    expect(wrapper.get('#inner-action').attributes('data-size')).toBe('medium')
    await wrapper.setProps({ size: 'medium' })
    expect(wrapper.get('#outer-action').attributes('data-size')).toBe('medium')
    expect(wrapper.get('#inner-action').attributes('data-size')).toBe('medium')
  })

  it('requires a Provider for PrimaryAction, while the other parts work independently', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => mount(Blankslate.PrimaryAction)).toThrow(
      'useBlankslate must be used within a BlankslateProvider',
    )
    warn.mockRestore()
    for (const component of [Blankslate.Visual, Blankslate.Heading, Blankslate.Description]) {
      const wrapper = mount(component)
      wrappers.push(wrapper)
      expect(wrapper.exists()).toBe(true)
    }
    const secondary = mount(Blankslate.SecondaryAction, { props: { href: '/secondary' } })
    wrappers.push(secondary)
    expect(secondary.get('a').attributes('href')).toBe('/secondary')
  })

  it('supports a primary anchor and follows source truthiness for empty href', () => {
    const wrapper = render({}, () => [
      h(Blankslate.PrimaryAction, { href: '/primary' }, () => 'Link'),
      h(Blankslate.PrimaryAction, { href: '' }, () => 'Button'),
    ])
    expect(wrapper.get('a').attributes('href')).toBe('/primary')
    expect(wrapper.get('button').attributes('href')).toBe('')
  })

  it('forwards the native button event and type and lets disabled suppress activation', async () => {
    const click = vi.fn()
    const disabled = vi.fn()
    const wrapper = render({}, () => [
      h(
        Blankslate.PrimaryAction,
        { type: 'submit', onClick: click, 'aria-label': 'Create' },
        () => 'Action',
      ),
      h(Blankslate.PrimaryAction, { disabled: true, onClick: disabled }, () => 'Disabled'),
    ])
    const buttons = wrapper.findAll('button')
    expect(buttons[0]!.attributes('type')).toBe('submit')
    expect(buttons[0]!.attributes('aria-label')).toBe('Create')
    await buttons[0]!.trigger('click')
    expect(click).toHaveBeenCalledOnce()
    expect(click.mock.calls[0]![0]).toBeInstanceOf(MouseEvent)
    ;(buttons[1]!.element as HTMLButtonElement).click()
    expect(disabled).not.toHaveBeenCalled()
  })

  it('ignores SecondaryAction extra attributes and listeners rather than forwarding them', async () => {
    const click = vi.fn()
    const Fixture = defineComponent({
      render: () =>
        h(
          Blankslate.SecondaryAction,
          {
            href: '/secondary',
            id: 'ignored',
            target: '_blank',
            disabled: true,
            onClick: click,
          },
          () => 'Secondary',
        ),
    })
    const wrapper = mount(Fixture)
    wrappers.push(wrapper)
    const link = wrapper.get('a')
    expect(link.attributes('href')).toBe('/secondary')
    for (const name of ['id', 'target', 'disabled', 'aria-disabled'])
      expect(link.attributes(name)).toBeUndefined()
    expect(wrapper.attributes('id')).toBeUndefined()
    link.element.addEventListener('click', (event) => event.preventDefault(), { once: true })
    await link.trigger('click')
    expect(click).not.toHaveBeenCalled()
  })
})
