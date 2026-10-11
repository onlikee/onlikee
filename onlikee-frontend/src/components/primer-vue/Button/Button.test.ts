// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Independent component and visual fixtures. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import {
  Comment,
  Fragment,
  defineComponent,
  getCurrentInstance,
  h,
  markRaw,
  nextTick,
  type Component,
} from 'vue'
import { Button, ButtonBase, IconButton, LinkButton } from './index'
import { BellIcon } from '@onlikee/octicons-vue'
import Tooltip from '../TooltipV2/Tooltip.vue'
import { TOOLTIP_CONTEXT_KEY as V1_TOOLTIP_CONTEXT } from '../Tooltip/TooltipContext'
import { registerEscapeHandler } from '../internal/documentRegistries'
import classes from './ButtonBase.module.css'

const Icon = defineComponent({ render: () => h('svg', { 'data-testid': 'icon' }) })
const wrappers: VueWrapper[] = []
const cleanups: Array<() => void> = []
function render(component: Component, props: Record<string, unknown> = {}, label?: string) {
  const wrapper = mount(component, {
    props,
    slots: label === undefined ? {} : { default: () => label },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}
function renderRawChildren(
  component: Component,
  value: unknown,
  props: Record<string, unknown> = {},
) {
  const Fixture = defineComponent({
    render: () => h(component, props, { default: () => value }),
  })
  return render(Fixture)
}
async function settle() {
  await nextTick()
  await flushPromises()
  await nextTick()
}
beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((media: string) => ({
      matches: false,
      media,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  cleanups.splice(0).forEach((cleanup) => cleanup())
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('Button source contracts', () => {
  it('retains the source slot marker', () => {
    expect(Button.__SLOT__.description).toBe('Button')
  })

  it.each([
    ['Button', 'button', 'button', 'Button'],
    ['ButtonBase', 'button', undefined, 'Button'],
    ['LinkButton', 'a', undefined, 'LinkButton'],
    ['IconButton', 'button', 'button', 'IconButton'],
  ])('uses the default element, type and component marker for %s', (name, tag, type, marker) => {
    const component = { Button, ButtonBase, LinkButton, IconButton }[
      name as 'Button' | 'ButtonBase' | 'LinkButton' | 'IconButton'
    ]
    const wrapper = render(
      component,
      component === IconButton ? { icon: Icon, 'aria-label': 'Close' } : {},
      'Save',
    )
    const node = wrapper.get(tag)
    expect(node.attributes('type')).toBe(type)
    expect(node.attributes('data-component')).toBe(marker)
    expect(node.attributes('data-size')).toBe('medium')
    expect(node.attributes('data-variant')).toBe('default')
    expect(node.attributes('data-loading')).toBe('false')
    expect(wrapper.find('[data-loading-wrapper]').exists()).toBe(false)
  })

  it('forwards attributes, classes, styles and native events to the button', async () => {
    const click = vi.fn()
    const wrapper = render(
      Button,
      {
        id: 'save',
        type: 'submit',
        class: 'consumer',
        className: 'legacy-class',
        style: { marginTop: '3px' },
        title: 'Save changes',
        'data-owner': 'form',
        'aria-label': 'Save',
        onClick: click,
      },
      'Save',
    )
    const node = wrapper.get('button')
    expect(node.attributes('type')).toBe('submit')
    expect(node.attributes('id')).toBe('save')
    expect(node.attributes('data-owner')).toBe('form')
    expect(node.attributes('title')).toBe('Save changes')
    expect(node.attributes('style')).toContain('margin-top: 3px')
    expect(node.classes()).toEqual(
      expect.arrayContaining([classes.ButtonBase, 'consumer', 'legacy-class']),
    )
    await node.trigger('click')
    expect(click).toHaveBeenCalledOnce()
    expect(click.mock.calls[0]![0]).toBeInstanceOf(MouseEvent)
    expect(wrapper.find('[data-component="Tooltip"]').exists()).toBe(false)
  })

  it('preserves an explicitly undefined type instead of applying the wrapper default', async () => {
    for (const component of [Button, IconButton]) {
      const wrapper = render(
        component,
        {
          ...(component === IconButton ? { icon: Icon, 'aria-label': 'Action' } : {}),
          type: undefined,
        },
        'Save',
      )
      expect(wrapper.get('button').attributes('type')).toBeUndefined()
      await wrapper.setProps({ type: 'submit' })
      expect(wrapper.get('button').attributes('type')).toBe('submit')
      await wrapper.setProps({ type: undefined })
      expect(wrapper.get('button').attributes('type')).toBeUndefined()
    }
  })

  it('keeps native disabled separate from loading and allows inactive actions', async () => {
    const disabledClick = vi.fn(),
      inactiveClick = vi.fn()
    const disabled = render(Button, { disabled: true, onClick: disabledClick }, 'Disabled')
    ;(disabled.get('button').element as HTMLButtonElement).click()
    expect(disabledClick).not.toHaveBeenCalled()
    const inactive = render(Button, { inactive: true, onClick: inactiveClick }, 'Inactive')
    expect(inactive.get('button').attributes('disabled')).toBeUndefined()
    expect(inactive.get('button').attributes('aria-disabled')).toBeUndefined()
    expect(inactive.get('button').attributes('data-inactive')).toBe('true')
    await inactive.get('button').trigger('click')
    expect(inactiveClick).toHaveBeenCalledOnce()
  })

  it.each(['small', 'medium', 'large'])('forwards size %s', (size) => {
    expect(render(Button, { size }, 'Save').get('button').attributes('data-size')).toBe(size)
  })
  it.each(['default', 'primary', 'danger', 'invisible', 'link'])(
    'forwards variant %s',
    (variant) => {
      expect(render(Button, { variant }, 'Save').get('button').attributes('data-variant')).toBe(
        variant,
      )
    },
  )

  it('uses block, alignment, labelWrap and notification data contracts', () => {
    const wrapper = render(
      Button,
      {
        block: true,
        alignContent: 'start',
        labelWrap: true,
        leadingVisual: Icon,
        notificationIndicator: 'leadingVisual',
      },
      'Long label',
    )
    expect(wrapper.get('button').attributes('data-block')).toBe('block')
    expect(wrapper.get('button').attributes('data-label-wrap')).toBe('true')
    expect(wrapper.get('button').attributes('data-notification-indicator')).toBe('leadingVisual')
    expect(wrapper.get('[data-component="buttonContent"]').attributes('data-align')).toBe('start')
    const plain = render(Button, {}, 'Plain')
    expect(plain.get('button').attributes('data-label-wrap')).toBeUndefined()
    expect(plain.get('button').attributes('data-block')).toBeUndefined()
  })

  it('lets the consumer override data-component and warns for a missing leading visual', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const wrapper = render(
        Button,
        { 'data-component': 'CustomButton', notificationIndicator: 'leadingVisual' },
        'Save',
      )
      expect(wrapper.get('button').attributes('data-component')).toBe('CustomButton')
      expect(warn).toHaveBeenCalledWith(
        'Button: `notificationIndicator="leadingVisual"` requires a `leadingVisual` prop.',
      )
    } finally {
      warn.mockRestore()
    }
  })

  it('marks Octicon visuals while preserving custom component and VNode attributes', () => {
    const wrapper = render(
      Button,
      {
        leadingVisual: Icon,
        trailingVisual: h('svg', { 'data-testid': 'custom', width: 24 }),
        trailingAction: Icon,
      },
      'Save',
    )
    expect(
      wrapper.get('[data-component="leadingVisual"] svg').attributes('data-component'),
    ).toBeUndefined()
    expect(wrapper.get('[data-component="trailingVisual"] svg').attributes('width')).toBe('24')
    expect(wrapper.get('button').element.children[1]?.getAttribute('data-component')).toBe(
      'trailingAction',
    )
    expect(
      wrapper
        .get('[data-component="buttonContent"]')
        .element.children[1]?.getAttribute('data-component'),
    ).toBe('text')

    const octicon = render(Button, { leadingVisual: BellIcon }, 'Inbox')
    expect(octicon.get('[data-component="leadingVisual"] svg').attributes('data-component')).toBe(
      'Octicon',
    )
    const octiconVNode = render(Button, { leadingVisual: h(BellIcon) }, 'Inbox')
    expect(
      octiconVNode.get('[data-component="leadingVisual"] svg').attributes('data-component'),
    ).toBe('Octicon')
  })

  it('clones reusable VNode visuals before rendering them', async () => {
    const visual = h('svg', { 'data-testid': 'reused-visual' }, [h('path')])
    const wrapper = render(Button, { leadingVisual: visual, trailingVisual: visual }, 'Save')

    expect(wrapper.findAll('[data-testid="reused-visual"]')).toHaveLength(2)
    expect(wrapper.findAll('[data-testid="reused-visual"] path')).toHaveLength(2)
    await wrapper.setProps({ size: 'small' })
    expect(wrapper.findAll('[data-testid="reused-visual"]')).toHaveLength(2)
    expect(wrapper.findAll('[data-testid="reused-visual"] path')).toHaveLength(2)
  })

  it('does not infer IconButton styles from an empty label', () => {
    const wrapper = render(Button, { leadingVisual: Icon, 'aria-label': 'Search' })
    expect(wrapper.get('button').classes()).not.toContain(classes.IconButton)
    expect(wrapper.get('button').attributes('data-icon-button')).toBeUndefined()
    expect(wrapper.find('[data-component="text"]').exists()).toBe(false)
  })

  it('handles empty fragments, conditional slots and whitespace labels', async () => {
    const Conditional = defineComponent({
      props: { shown: Boolean },
      setup: (props) => () =>
        h(Button, null, {
          default: () => [h(Fragment, null, [props.shown ? h('b', 'Visible') : h(Comment)])],
        }),
    })
    const wrapper = render(Conditional)
    expect(wrapper.find('[data-component="text"]').exists()).toBe(true)
    expect(wrapper.get('[data-component="text"]').text()).toBe('')
    await wrapper.setProps({ shown: true })
    expect(wrapper.get('[data-component="text"]').text()).toBe('Visible')
    expect(render(Button, {}, ' ').find('[data-component="text"]').exists()).toBe(true)
  })

  it('omits the text wrapper for an empty slot array', () => {
    const wrapper = mount(Button, {
      slots: { default: () => [] },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    expect(wrapper.find('[data-component="text"]').exists()).toBe(false)
  })

  it('uses Vue slot content for labels and the icon-only counter state', async () => {
    const numericZero = renderRawChildren(Button, 0, { leadingVisual: Icon, count: 1 })
    expect(numericZero.get('[data-component="text"]').text()).toBe('0')
    expect(numericZero.get('button').attributes('data-icon-only-counter')).toBeUndefined()
    expect(numericZero.get('button').attributes('children')).toBeUndefined()

    const RawSwitchingSlot = defineComponent({
      props: { value: { type: null, default: 0 } },
      render() {
        return h(Button, { leadingVisual: Icon, count: 1 }, { default: () => this.value })
      },
    })
    const switchingSlot = render(RawSwitchingSlot)
    expect(switchingSlot.get('[data-component="text"]').text()).toBe('0')
    await switchingSlot.setProps({ value: '' })
    expect(switchingSlot.find('[data-component="text"]').exists()).toBe(false)
    expect(switchingSlot.get('button').attributes('data-icon-only-counter')).toBe('true')
    await switchingSlot.setProps({ value: 'Save' })
    expect(switchingSlot.get('[data-component="text"]').text()).toBe('Save')
    expect(switchingSlot.get('button').attributes('data-icon-only-counter')).toBeUndefined()

    for (const component of [ButtonBase, LinkButton]) {
      expect(renderRawChildren(component, 0).get('[data-component="text"]').text()).toBe('0')
    }
    for (const child of [false, null, '', []]) {
      expect(renderRawChildren(Button, child).find('[data-component="text"]').exists()).toBe(false)
    }

    const ConditionalSlot = defineComponent({
      props: { show: Boolean },
      render() {
        return h(Button, null, { default: () => (this.show ? h('b', 'Visible') : null) })
      },
    })
    const conditionalSlot = render(ConditionalSlot, { show: false })
    expect(conditionalSlot.find('[data-component="text"]').exists()).toBe(false)
    await conditionalSlot.setProps({ show: true })
    expect(conditionalSlot.get('[data-component="text"] b').text()).toBe('Visible')
  })

  it('keeps children out of the public prop and DOM attribute surface', () => {
    const wrapper = render(Button, { children: 'Use the default slot' })
    expect(wrapper.get('button').attributes('children')).toBeUndefined()
    expect(wrapper.get('button').text()).toBe('')
  })

  it.each([0, 5, ''])('renders count %s including zero and an empty string', (count) => {
    const wrapper = render(Button, { count, leadingVisual: Icon })
    expect(wrapper.get('button').attributes('data-has-count')).toBe('true')
    expect(wrapper.get('button').attributes('data-icon-only-counter')).toBe('true')
    expect(wrapper.get('[data-component="ButtonCounter"]').text()).toBe(String(count))
    expect(wrapper.get('[data-component="trailingVisual"]').text()).toContain(`(${count})`)
  })

  it('gives trailingVisual precedence over count and retains the source icon content branch', () => {
    const visual = render(Button, { count: 2, trailingVisual: Icon }, 'Inbox')
    expect(visual.find('[data-component="ButtonCounter"]').exists()).toBe(false)
    const icon = render(
      Button,
      { icon: h('svg', { id: 'only-icon' }), leadingVisual: Icon, count: 2 },
      'Ignored',
    )
    expect(icon.find('#only-icon').exists()).toBe(true)
    expect(icon.find('[data-component="buttonContent"]').exists()).toBe(false)
    expect(icon.get('button').classes()).not.toContain(classes.IconButton)
  })

  it('uses LinkButton anchors and forwards native link attributes', () => {
    const wrapper = render(
      LinkButton,
      {
        href: '#target',
        target: '_blank',
        rel: 'noreferrer',
        download: 'report.txt',
        disabled: false,
      },
      'Download',
    )
    const anchor = wrapper.get('a')
    expect(anchor.attributes('href')).toBe('#target')
    expect(anchor.attributes('target')).toBe('_blank')
    expect(anchor.attributes('download')).toBe('report.txt')
    expect(anchor.attributes('disabled')).toBeUndefined()
    expect(render(Button, { as: 'a', href: '#' }, 'Link').get('a').attributes('type')).toBe(
      'button',
    )
  })

  it('supports custom components and exposes their native element', async () => {
    const Custom = defineComponent({
      render() {
        return h('button', this.$slots.default?.())
      },
    })
    const wrapper = render(Button, { as: Custom, loading: false }, 'Custom')
    await settle()
    expect(wrapper.vm.element).toBe(wrapper.get('button').element)
    wrapper.vm.focus({ preventScroll: true })
    expect(document.activeElement).toBe(wrapper.get('button').element)
    wrapper.vm.blur()
    expect(document.activeElement).not.toBe(wrapper.get('button').element)
  })

  it('checks custom root semantics on rerender after the forwarded element ref resolves', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const Custom = defineComponent({ render: () => h('div') })
    const wrapper = render(ButtonBase, { as: markRaw(Custom) }, 'Custom')
    await settle()

    expect(warn).not.toHaveBeenCalled()
    await wrapper.setProps({ title: 'Update' })
    expect(warn).toHaveBeenCalledWith(
      'This component should be an instanceof a semantic button or anchor',
    )
  })

  it('keeps LinkButton attributes reactive', async () => {
    const wrapper = render(LinkButton, { href: '#target', title: 'Before' }, 'Target')
    expect(wrapper.get('a').attributes('title')).toBe('Before')
    await wrapper.setProps({ title: 'After' })
    expect(wrapper.get('a').attributes('title')).toBe('After')
  })

  it('preserves native false and null props when rendering a custom component', () => {
    const Custom = defineComponent({
      // eslint-disable-next-line vue/require-default-prop, vue/prop-name-casing -- Forward the native custom-component props verbatim.
      props: { disabled: null, 'data-block': null },
      setup(props) {
        const instance = getCurrentInstance()!
        const receivedProps = props as typeof props & { dataBlock: unknown }
        return () =>
          h('button', {
            'data-received-disabled': String(props.disabled),
            'data-received-block': String(receivedProps.dataBlock),
            'data-has-type-prop': String(
              Object.prototype.hasOwnProperty.call(instance.vnode.props ?? {}, 'type'),
            ),
          })
      },
    })
    const wrapper = render(Button, { as: markRaw(Custom), disabled: false, block: false })
    expect(wrapper.get('button').attributes('data-received-disabled')).toBe('false')
    expect(wrapper.get('button').attributes('data-received-block')).toBe('null')

    const withoutDisabled = render(Button, { as: markRaw(Custom) })
    expect(withoutDisabled.get('button').attributes('data-received-disabled')).toBe('undefined')

    const baseWithoutType = render(ButtonBase, { as: markRaw(Custom) })
    expect(baseWithoutType.get('button').attributes('data-has-type-prop')).toBe('false')
    const baseWithUndefinedType = render(ButtonBase, {
      as: markRaw(Custom),
      type: undefined,
    })
    expect(baseWithUndefinedType.get('button').attributes('data-has-type-prop')).toBe('true')
    const linkWithoutType = render(LinkButton, { as: markRaw(Custom) })
    expect(linkWithoutType.get('button').attributes('data-has-type-prop')).toBe('false')
    const linkWithUndefinedType = render(LinkButton, {
      as: markRaw(Custom),
      type: undefined,
    })
    expect(linkWithUndefinedType.get('button').attributes('data-has-type-prop')).toBe('true')
  })

  it('preserves the loading wrapper, native element and focus across transitions', async () => {
    const wrapper = render(Button, { id: 'publish', loading: false }, 'Publish')
    const node = wrapper.get('button').element as HTMLButtonElement
    node.focus()
    const container = wrapper.get('[data-loading-wrapper]').element
    await wrapper.setProps({ loading: true })
    expect(wrapper.get('button').element).toBe(node)
    expect(wrapper.get('[data-loading-wrapper]').element).toBe(container)
    expect(document.activeElement).toBe(node)
    expect(node.disabled).toBe(false)
    expect(node.getAttribute('aria-labelledby')).toBe('publish-label')
    expect(node.getAttribute('aria-describedby')).toBe('publish-loading-announcement')
    expect(wrapper.get('#publish-loading-announcement').text()).toBe('Loading')
    await wrapper.setProps({ loading: false })
    expect(document.activeElement).toBe(node)
    expect(node.hasAttribute('aria-labelledby')).toBe(false)
    expect(wrapper.find('#publish-loading-announcement').exists()).toBe(false)
  })

  it('keeps the loading spinner label in a VisuallyHidden node', () => {
    const wrapper = render(Button, { loading: true }, 'Save')
    const spinner = wrapper.get('[data-component="Spinner"] svg')
    const labelId = spinner.attributes('aria-labelledby')

    expect(labelId).toBeTruthy()
    expect(wrapper.get(`#${labelId}`).text()).toBe('Loading')
  })

  it('combines consumer ARIA ids and permits overriding aria-disabled', () => {
    const wrapper = render(
      Button,
      {
        id: 'save',
        loading: true,
        loadingAnnouncement: 'Saving',
        'aria-describedby': 'help',
        'aria-labelledby': 'name',
        'aria-disabled': 'false',
      },
      'Save',
    )
    expect(wrapper.get('button').attributes('aria-describedby')).toBe(
      'save-loading-announcement help',
    )
    expect(wrapper.get('button').attributes('aria-labelledby')).toBe('save-label name')
    expect(wrapper.get('button').attributes('aria-disabled')).toBe('false')
    expect(wrapper.get('#save-loading-announcement').text()).toBe('Saving')
  })

  it('removes only the loading click callback and preserves bubbling and native form submission', () => {
    const click = vi.fn(),
      capture = vi.fn(),
      outer = vi.fn(),
      submit = vi.fn((event: Event) => event.preventDefault())
    const Host = defineComponent({
      render: () =>
        h('form', { onSubmit: submit, onClick: outer }, [
          h(
            Button as unknown as Component,
            { type: 'submit' as const, loading: true, onClick: click, onClickCapture: capture },
            { default: () => 'Submit' },
          ),
        ]),
    })
    const wrapper = render(Host)
    ;(wrapper.get('button').element as HTMLButtonElement).click()
    expect(click).not.toHaveBeenCalled()
    expect(capture).toHaveBeenCalledOnce()
    expect(outer).toHaveBeenCalledOnce()
    expect(submit).toHaveBeenCalledOnce()
  })

  it.each([
    [{}, 'loadingSpinner'],
    [{ leadingVisual: Icon }, 'leadingVisual'],
    [{ trailingVisual: Icon }, 'trailingVisual'],
    [{ trailingAction: Icon }, 'trailingAction'],
    [{ count: 0 }, 'trailingVisual'],
    [{ leadingVisual: Icon, trailingVisual: Icon }, 'leadingVisual'],
    [{ leadingVisual: Icon, trailingAction: Icon }, 'leadingVisual'],
    [{ trailingVisual: Icon, trailingAction: Icon }, 'trailingVisual'],
  ])('places loading spinner using source precedence for %s', (props, expected) => {
    const wrapper = render(Button, { ...props, loading: true }, 'Save')
    expect(wrapper.findAll('[data-component="Spinner"]')).toHaveLength(1)
    expect(
      wrapper
        .get('[data-component="Spinner"]')
        .element.parentElement?.getAttribute('data-component'),
    ).toBe(expected)
  })

  it('updates explicit ids and uses the link wrapper class', async () => {
    const wrapper = render(Button, { variant: 'link', loading: true, id: 'old' }, 'Save')
    expect(wrapper.get('[data-loading-wrapper]').classes()).toContain(
      classes.ConditionalWrapperLink,
    )
    await wrapper.setProps({ id: 'new' })
    expect(wrapper.get('button').attributes('aria-labelledby')).toBe('new-label')
    expect(wrapper.get('#new-loading-announcement').text()).toBe('Loading')
    await wrapper.setProps({ block: true })
    expect(wrapper.get('[data-loading-wrapper]').classes()).toContain(classes.ConditionalWrapper)
  })

  it('replaces both count and trailingAction when neither leading nor trailing visual exists', () => {
    const wrapper = render(Button, { count: 0, trailingAction: Icon, loading: true }, 'Save')
    expect(wrapper.findAll('[data-component="Spinner"]')).toHaveLength(2)
    expect(
      wrapper
        .findAll('[data-component="Spinner"]')
        .map((spinner) => spinner.element.parentElement?.getAttribute('data-component')),
    ).toEqual(['trailingVisual', 'trailingAction'])
  })
})

describe('IconButton source contracts', () => {
  it('labels through the default tooltip and preserves original handlers and native refs', async () => {
    const click = vi.fn()
    const wrapper = render(IconButton, { icon: Icon, 'aria-label': 'Close', onClick: click })
    await settle()
    const tooltip = wrapper.get('[data-component="Tooltip"]')
    expect(wrapper.get('button').attributes('aria-label')).toBeUndefined()
    expect(wrapper.get('button').attributes('aria-labelledby')).toBe(tooltip.attributes('id'))
    expect(wrapper.get('button').classes()).toContain(classes.IconButton)
    expect(wrapper.vm.element).toBe(wrapper.get('button').element)
    await wrapper.get('button').trigger('click')
    expect(click).toHaveBeenCalledOnce()
  })

  it('updates forwarded attributes when reactive attrs change', async () => {
    const wrapper = render(ButtonBase, { 'data-state': 'closed' }, 'Save')
    expect(wrapper.get('button').attributes('data-state')).toBe('closed')
    await wrapper.setProps({ 'data-state': 'open' })
    expect(wrapper.get('button').attributes('data-state')).toBe('open')
  })

  it('composes the loading label id with the IconButton label tooltip id', async () => {
    const wrapper = render(IconButton, {
      id: 'save',
      icon: Icon,
      'aria-label': 'Save',
      loading: true,
    })
    await settle()
    const tooltip = wrapper.get('[data-component="Tooltip"]')
    const button = wrapper.get('button')
    expect(button.attributes('aria-labelledby')).toBe(`save-label ${tooltip.attributes('id')}`)
    expect(button.attributes('aria-describedby')).toBe('save-loading-announcement')
    expect(wrapper.get('#save-loading-announcement').text()).toBe('Loading')
  })

  it('uses description tooltips and source shortcut precedence', async () => {
    const wrapper = render(IconButton, {
      icon: Icon,
      'aria-label': 'Close',
      description: 'Close dialog',
      keyshortcuts: 'Escape',
      keybindingHint: 'Mod+K',
    })
    await settle()
    expect(wrapper.get('button').attributes('aria-label')).toBe('Close')
    expect(wrapper.get('button').attributes('aria-keyshortcuts')).toBe('Escape')
    expect(wrapper.get('[data-component="Tooltip"]').attributes('role')).toBe('tooltip')
    expect(wrapper.get('[data-component="Tooltip"]').text()).toContain('Close dialog')
    expect(wrapper.get('[data-component="Tooltip"]').text()).toContain('control k')
    expect(wrapper.get('button').attributes('aria-describedby')).toBe(
      wrapper.get('[data-component="Tooltip"] span[id]').attributes('id'),
    )
  })

  it.each([
    { 'aria-labelledby': 'external' },
    { 'aria-label': '' },
    { 'aria-label': 'Close', disabled: true },
    { 'aria-label': 'Close', unsafeDisableTooltip: true },
  ])('skips the tooltip for source bypass conditions %s', (props) => {
    const wrapper = render(IconButton, { icon: Icon, ...props, keyshortcuts: 'Escape' })
    expect(wrapper.find('[data-component="Tooltip"]').exists()).toBe(false)
    expect(wrapper.get('button').attributes('aria-keyshortcuts')).toBeUndefined()
    if ('aria-label' in props)
      expect(wrapper.get('button').attributes('aria-label')).toBe(props['aria-label'])
    else expect(wrapper.get('button').attributes('aria-labelledby')).toBe('external')
  })

  it('suppresses internal tooltips inside either tooltip context', async () => {
    const Outer = defineComponent({
      render: () =>
        h(
          Tooltip,
          { text: 'Outer' },
          { default: () => h(IconButton, { icon: Icon, 'aria-label': 'Close' }) },
        ),
    })
    expect(render(Outer).findAll('[data-component="Tooltip"]')).toHaveLength(1)
    const wrapper = mount(IconButton, {
      props: { icon: Icon, 'aria-label': 'Close' },
      global: { provide: { [V1_TOOLTIP_CONTEXT]: { tooltipId: 'v1-tip' } } },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    expect(wrapper.find('[data-component="Tooltip"]').exists()).toBe(false)
    expect(wrapper.get('button').attributes('aria-label')).toBe('Close')
  })

  it.each(['true'])(
    'suppresses active popup tooltips when aria-haspopup is %s and closes an open tooltip before outer Escape handlers',
    async (hasPopup) => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const outer = vi.fn()
      cleanups.push(registerEscapeHandler(outer))
      const wrapper = render(IconButton, {
        icon: Icon,
        'aria-label': 'Menu',
        'aria-haspopup': hasPopup,
        'aria-expanded': true,
      })
      await settle()
      wrapper.get('button').element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      await vi.advanceTimersByTimeAsync(50)
      expect(
        wrapper.get('[data-component="Tooltip"]').element.classList.contains(':popover-open'),
      ).toBe(false)
      await wrapper.setProps({ 'aria-expanded': false })
      wrapper.get('button').element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      await vi.advanceTimersByTimeAsync(50)
      await settle()
      expect(
        wrapper.get('[data-component="Tooltip"]').element.classList.contains(':popover-open'),
      ).toBe(true)
      document.body.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      )
      await settle()
      expect(
        wrapper.get('[data-component="Tooltip"]').element.classList.contains(':popover-open'),
      ).toBe(false)
      expect(outer).not.toHaveBeenCalled()
    },
  )

  it('matches the source prop check when aria-haspopup is boolean true', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const wrapper = render(IconButton, {
      icon: Icon,
      'aria-label': 'Menu',
      'aria-haspopup': true,
      'aria-expanded': true,
    })
    await settle()
    wrapper.get('button').element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(50)
    expect(
      wrapper.get('[data-component="Tooltip"]').element.classList.contains(':popover-open'),
    ).toBe(true)
  })
})
