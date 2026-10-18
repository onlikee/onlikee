// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, type Component } from 'vue'
import { Details, Summary, type DetailsInstance } from './index'
import { Button } from '../Button'

const wrappers: VueWrapper[] = []
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))
describe('Details', () => {
  it('supports native and component summaries with source markers and classes', () => {
    const wrapper = mount(Details, {
      slots: {
        default: () =>
          h(
            Summary as Component,
            { as: Button, className: 'summary-class', 'data-component': 'Override' },
            () => 'Summary',
          ),
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.get('summary').classes()).toContain('summary-class')
    expect(wrapper.get('summary').attributes('data-component')).toBe('Details.Summary')
    expect(wrapper.get('summary').text()).toBe('Summary')
  })
  it('renders the native disclosure, forwards attributes and exposes its DOM ref', async () => {
    const wrapper = mount(Details, {
      props: { className: 'custom' },
      attrs: { open: true, id: 'details', 'data-component': 'Custom' },
      slots: { default: () => [h(Summary as Component, null, () => 'Summary'), h('p', 'Content')] },
    })
    wrappers.push(wrapper)
    expect(wrapper.element.tagName).toBe('DETAILS')
    expect(wrapper.attributes('data-component')).toBe('Custom')
    expect(wrapper.attributes('id')).toBe('details')
    expect(wrapper.classes()).toContain('custom')
    expect((wrapper.element as HTMLDetailsElement).open).toBe(true)
    expect(wrapper.get('summary').attributes('data-component')).toBe('Details.Summary')
    const instance = wrapper.vm as unknown as DetailsInstance
    expect(instance.element).toBe(wrapper.element)
    await wrapper.setProps({ open: false })
    expect((wrapper.element as HTMLDetailsElement).open).toBe(false)
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(instance.element).toBeNull()
  })
  it('warns when no user summary is supplied in development', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(Details, {
      slots: { default: () => h('summary', { 'data-default-summary': '' }, 'Default') },
    })
    wrappers.push(wrapper)
    expect(warning).toHaveBeenCalledWith(
      'Warning:',
      expect.stringContaining('must have a <summary>'),
    )
  })

  it('merges classes and styles and forwards native toggle and click events', async () => {
    const toggle = vi.fn()
    const click = vi.fn()
    const wrapper = mount(Details, {
      props: { className: 'source' },
      attrs: { class: 'vue', style: { marginTop: 4 }, name: 'accordion', onToggle: toggle },
      slots: {
        default: () =>
          h(Summary as Component, { onClick: click, title: 'Summary title' }, () => 'Summary'),
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['source', 'vue']))
    expect((wrapper.element as HTMLElement).style.marginTop).toBe('4px')
    expect(wrapper.attributes('name')).toBe('accordion')
    expect(wrapper.get('summary').attributes('title')).toBe('Summary title')
    await wrapper.trigger('toggle')
    expect(toggle).toHaveBeenCalledOnce()
    await wrapper.get('summary').trigger('click')
    expect(click).toHaveBeenCalledOnce()
  })

  it('forwards summary attributes, classes and styles and forces the source marker', () => {
    const wrapper = mount(Summary as Component, {
      props: { className: 'source' },
      attrs: {
        class: 'vue',
        style: { paddingTop: 3 },
        id: 'summary',
        'data-component': 'Override',
      },
      slots: { default: () => 'Summary' },
    })
    wrappers.push(wrapper)
    expect(wrapper.element.tagName).toBe('SUMMARY')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['source', 'vue']))
    expect((wrapper.element as HTMLElement).style.paddingTop).toBe('3px')
    expect(wrapper.attributes('id')).toBe('summary')
    expect(wrapper.attributes('data-component')).toBe('Details.Summary')
    expect(wrapper.attributes('as')).toBeUndefined()
  })

  it('passes as=summary and custom props to a consumer component', () => {
    const CustomSummary = defineComponent({
      props: { as: { type: String, default: 'button' }, label: { type: String, required: true } },
      setup:
        (props, { attrs }) =>
        () =>
          h(props.as ?? 'button', attrs, props.label),
    })
    const wrapper = mount(Details, {
      slots: {
        default: () =>
          h(Summary as Component, { as: CustomSummary, label: 'Custom', id: 'custom' }),
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.get('summary').text()).toBe('Custom')
    expect(wrapper.get('summary').attributes('id')).toBe('custom')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it.each(['native', 'button'] as const)('accepts a %s summary without warning', (summary) => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(Details, {
      slots: {
        default: () =>
          summary === 'native'
            ? h('summary', 'Native')
            : h(Summary as Component, { as: Button }, () => 'Button'),
      },
    })
    wrappers.push(wrapper)
    expect(warning).not.toHaveBeenCalled()
  })

  it('warns only on mount and skips the warning in production', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(Details)
    wrappers.push(wrapper)
    expect(warning).toHaveBeenCalledOnce()
    await wrapper.setProps({ className: 'changed' })
    expect(warning).toHaveBeenCalledOnce()
    vi.stubEnv('DEV', false)
    wrappers.push(mount(Details))
    expect(warning).toHaveBeenCalledOnce()
  })

  it.each(['native', 'component'] as const)(
    'bubbles a %s child toggle after its handler with the ancestor currentTarget',
    async (root) => {
      const calls: Array<{
        id: string
        currentTarget: EventTarget | null
        target: EventTarget | null
      }> = []
      const onToggle = (event: Event) => {
        calls.push({
          id: (event.currentTarget as HTMLElement).id,
          currentTarget: event.currentTarget,
          target: event.target,
        })
      }
      const wrapper = mount(Details, {
        attrs: { id: 'outer', onToggle },
        slots: {
          default: () => [
            h('summary', 'Outer'),
            root === 'native'
              ? h('details', { id: 'inner', onToggle }, [h('summary', 'Inner')])
              : h(Details, { id: 'inner', onToggle }, { default: () => h('summary', 'Inner') }),
          ],
        },
      })
      wrappers.push(wrapper)
      const inner = wrapper.get('#inner').element
      await wrapper.get('#inner').trigger('toggle', { bubbles: false })
      expect(calls.map((call) => call.id)).toEqual(['inner', 'outer'])
      expect(calls.map((call) => call.target)).toEqual([inner, inner])
      expect(calls[1]!.currentTarget).toBe(wrapper.element)
    },
  )

  it.each(['native', 'component'] as const)(
    'preserves cancellation and stopPropagation from a %s child toggle',
    async (root) => {
      const outerToggle = vi.fn()
      let stop = false
      const childProps = {
        id: 'inner',
        onToggle: (event: Event) => {
          event.preventDefault()
          if (stop) event.stopPropagation()
        },
      }
      const wrapper = mount(Details, {
        attrs: { onToggle: outerToggle },
        slots: {
          default: () => [
            h('summary', 'Outer'),
            root === 'native'
              ? h('details', childProps, [h('summary', 'Inner')])
              : h(Details, childProps, { default: () => h('summary', 'Inner') }),
          ],
        },
      })
      wrappers.push(wrapper)
      await wrapper.get('#inner').trigger('toggle', { bubbles: false, cancelable: true })
      expect(outerToggle).toHaveBeenCalledOnce()
      const event = outerToggle.mock.calls[0]![0] as Event
      expect(event.defaultPrevented).toBe(true)
      expect(event.currentTarget).toBeNull()
      stop = true
      await wrapper.get('#inner').trigger('toggle', { bubbles: false, cancelable: true })
      expect(outerToggle).toHaveBeenCalledOnce()
    },
  )

  it('handles the same Event when a consumer dispatches it again', async () => {
    const onToggle = vi.fn()
    const wrapper = mount(Details, {
      attrs: { onToggle },
      slots: { default: () => h('summary', 'Summary') },
    })
    wrappers.push(wrapper)
    await wrapper.trigger('toggle')
    const event = onToggle.mock.calls[0]![0] as Event
    wrapper.element.dispatchEvent(event)
    expect(onToggle).toHaveBeenCalledTimes(2)
  })
})
