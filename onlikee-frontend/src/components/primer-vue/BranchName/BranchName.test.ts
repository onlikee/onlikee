// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import BranchName, { BranchName as NamedBranchName, type BranchNameInstance } from './index'

const wrappers: VueWrapper[] = []
function render(props: Record<string, unknown> = {}, content?: () => unknown): VueWrapper {
  const wrapper = mount(BranchName, {
    props,
    slots: content ? { default: content } : {},
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('BranchName', () => {
  it('exports the same component through the default and named Vue entries', () => {
    expect(BranchName).toBe(NamedBranchName)
  })

  it('renders an empty anchor without required props or an extra wrapper', () => {
    const wrapper = render()
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('data-component')).toBe('BranchName')
    expect(wrapper.classes()).toEqual([expect.stringContaining('prc-BranchName-BranchName')])
    for (const name of ['href', 'target', 'rel', 'type'])
      expect(wrapper.attributes(name)).toBeUndefined()
    expect(wrapper.text()).toBe('')
  })

  it('merges classes, forwards native attributes and retains the source component marker', async () => {
    const click = vi.fn((event: MouseEvent) => event.preventDefault())
    const wrapper = render(
      {
        href: '/main',
        target: 'named-window',
        rel: 'nofollow',
        id: 'branch',
        'aria-label': 'Main branch',
        'data-component': 'Override',
        className: 'source-class',
        class: 'vue-class',
        style: { padding: '4px' },
        onClick: click,
      },
      () => 'main',
    )
    expect(wrapper.attributes()).toMatchObject({
      href: '/main',
      target: 'named-window',
      rel: 'nofollow',
      id: 'branch',
      'aria-label': 'Main branch',
      'data-component': 'BranchName',
    })
    expect(wrapper.classes()).toEqual([
      'source-class',
      'vue-class',
      expect.stringContaining('BranchName'),
    ])
    expect((wrapper.element as HTMLElement).style.padding).toBe('4px')
    await wrapper.trigger('click')
    expect(click).toHaveBeenCalledOnce()
    expect(click.mock.calls[0]![0]).toBeInstanceOf(MouseEvent)
    expect(click.mock.calls[0]![0].target).toBe(wrapper.element)
    expect(wrapper.attributes('as')).toBeUndefined()
    expect(wrapper.attributes('className')).toBeUndefined()
  })

  it.each(['a', 'span', 'button', 'code'] as const)(
    'supports %s without adding native defaults',
    (as) => {
      const wrapper = render({ as }, () => 'main')
      expect(wrapper.element.tagName).toBe(as.toUpperCase())
      expect(wrapper.text()).toBe('main')
      expect(wrapper.attributes('type')).toBeUndefined()
      expect(wrapper.attributes('tabindex')).toBeUndefined()
    },
  )

  it('supports rich content without injecting icons or actions', () => {
    const wrapper = render({}, () => [h('svg', { 'aria-hidden': 'true' }), h('strong', 'main')])
    expect(wrapper.element.children).toHaveLength(2)
    expect(wrapper.get('strong').text()).toBe('main')
  })

  it('updates native attributes and classes reactively', async () => {
    const wrapper = render({ href: '/main', className: 'main' })
    await wrapper.setProps({ href: '/feature', className: 'feature', 'aria-label': 'Feature' })
    expect(wrapper.attributes('href')).toBe('/feature')
    expect(wrapper.classes()).toContain('feature')
    expect(wrapper.classes()).not.toContain('main')
    expect(wrapper.attributes('aria-label')).toBe('Feature')
  })

  it('exposes, updates and clears the native element ref', async () => {
    const wrapper = render({ href: '#' })
    const instance = wrapper.vm as unknown as BranchNameInstance<'a' | 'button'>
    expect(instance.element).toBe(wrapper.element)
    instance.element?.focus()
    expect(document.activeElement).toBe(wrapper.element)
    await wrapper.setProps({ as: 'button', type: 'button' })
    expect(instance.element).toBeInstanceOf(HTMLButtonElement)
    expect(instance.element).toBe(wrapper.element)
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(instance.element).toBeNull()
  })

  it('forwards custom component props and keeps its public ref', () => {
    const CustomBranch = defineComponent({
      props: { to: { type: String, required: true } },
      setup: (props, { slots, expose }) => {
        expose({ label: 'custom-ref' })
        return () => h('a', { href: props.to }, slots.default?.())
      },
    })
    const wrapper = render(
      { as: CustomBranch, to: '/custom', 'aria-label': 'Custom' },
      () => 'custom',
    )
    expect(wrapper.attributes('href')).toBe('/custom')
    expect(wrapper.attributes('aria-label')).toBe('Custom')
    expect(wrapper.attributes('data-component')).toBe('BranchName')
    expect((wrapper.vm as unknown as { element: { label: string } }).element.label).toBe(
      'custom-ref',
    )
  })

  it('uses native disabled button behavior', () => {
    const click = vi.fn()
    const wrapper = render({ as: 'button', disabled: true, onClick: click })
    expect((wrapper.element as HTMLButtonElement).disabled).toBe(true)
    ;(wrapper.element as HTMLButtonElement).click()
    expect(click).not.toHaveBeenCalled()
  })
})
