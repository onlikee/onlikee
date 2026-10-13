// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import {
  Comment,
  Fragment,
  createSSRApp,
  createVNode,
  defineComponent,
  h,
  nextTick,
  shallowRef,
  type Component,
  type VNode,
} from 'vue'
import { renderToString } from '@vue/server-renderer'
import {
  Card,
  CardIcon,
  CardImage,
  CardHeading,
  CardDescription,
  CardAction,
  CardMetadata,
  type CardInstance,
} from './index'
import classes from './Card.module.css'

const TestIcon = defineComponent({ setup: () => () => h('svg', { 'data-testid': 'icon' }) })
const wrappers: VueWrapper[] = []
function render(children: () => (VNode | string)[] = () => [], props = {}) {
  const wrapper = mount(Card, { props, slots: { default: children } })
  wrappers.push(wrapper)
  return wrapper
}
function heading(text = 'Heading', props = {}) {
  return h(CardHeading, props, () => text)
}
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))

describe('Card source contracts', () => {
  it('exports all compound components with the same identity as standalone components', () => {
    expect([
      Card.Icon,
      Card.Image,
      Card.Heading,
      Card.Description,
      Card.Action,
      Card.Metadata,
    ]).toEqual([CardIcon, CardImage, CardHeading, CardDescription, CardAction, CardMetadata])
  })

  it('renders defaults and sorts subcomponents into the source DOM structure', () => {
    const wrapper = render(() => [
      h(CardAction, null, () => h('button', { type: 'button' }, 'Options')),
      h(CardMetadata, null, () => 'Updated today'),
      h(CardDescription, null, () => 'Description'),
      heading(),
      h(CardIcon, { icon: TestIcon }),
    ])
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes()).toMatchObject({
      'data-component': 'Card',
      'data-padding': 'normal',
      'data-border-radius': 'large',
      'data-layout': 'default',
    })
    expect(
      wrapper.findAll('[data-component]').map((node) => node.attributes('data-component')),
    ).toEqual([
      'Card',
      'Card.Icon',
      'Card.Heading',
      'Card.Description',
      'Card.Metadata',
      'Card.Action',
    ])
    expect(wrapper.find('h3').text()).toBe('Heading')
    expect(wrapper.find('p').text()).toBe('Description')
    expect(wrapper.find(`.${classes.CardMetadataContainer}`).text()).toBe('Updated today')
    expect(
      wrapper.find(`.${classes.CardAction} > [data-component="Card.Action"] button`).text(),
    ).toBe('Options')
    expect(wrapper.find(`.${classes.CardHeaderEdgeToEdge}`).exists()).toBe(false)
  })

  it.each(['none', 'condensed', 'normal'] as const)(
    'forwards padding %s on custom content',
    (padding) => {
      const wrapper = render(() => [h('p', 'Custom')], {
        padding,
        borderRadius: 'medium',
        layout: 'compact',
      })
      expect(wrapper.attributes()).toMatchObject({
        'data-padding': padding,
        'data-border-radius': 'medium',
        'data-layout': 'compact',
      })
      expect(wrapper.find(`.${classes.CardBody}`).exists()).toBe(false)
    },
  )

  it('forwards root attrs and native events, merges classes and exposes the DOM ref', async () => {
    const onClick = vi.fn()
    const wrapper = render(() => [heading()], {
      className: 'source',
      class: 'vue',
      style: { paddingTop: 4 },
      id: 'card',
      'data-padding': 'override',
      onClick,
    })
    expect(wrapper.classes()).toEqual(expect.arrayContaining([classes.Card, 'source', 'vue']))
    expect(wrapper.attributes('id')).toBe('card')
    expect(wrapper.attributes('data-padding')).toBe('override')
    expect((wrapper.element as HTMLElement).style.paddingTop).toBe('4px')
    expect((wrapper.vm as unknown as CardInstance).element).toBe(wrapper.element)
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('prefers the image to the icon and applies edge-to-edge image styling', () => {
    const wrapper = render(() => [
      h(CardIcon, { icon: TestIcon }),
      h(CardImage, {
        src: '/image.png',
        alt: 'Example',
        loading: 'lazy',
        width: 100,
        className: 'source',
        class: 'vue',
      }),
      heading(),
    ])
    expect(wrapper.find('[data-testid="icon"]').exists()).toBe(false)
    expect(wrapper.find(`.${classes.CardHeaderEdgeToEdge} > img`).attributes()).toMatchObject({
      src: '/image.png',
      alt: 'Example',
      loading: 'lazy',
      width: '100',
      'data-component': 'Card.Image',
    })
    expect(wrapper.find('img').classes()).toEqual(
      expect.arrayContaining([classes.CardImage, 'source', 'vue']),
    )
    expect(
      render(() => [h(CardImage, { src: '/decorative.png' })])
        .find('img')
        .attributes('alt'),
    ).toBe('')
  })

  it.each([undefined, '', 'Repository'])('handles the icon label %s like the source', (label) => {
    const wrapper = render(() => [
      h(CardIcon, {
        icon: TestIcon,
        'aria-label': label,
        id: 'ignored',
        className: 'source',
        class: 'vue',
      }),
    ])
    const icon = wrapper.find('[data-component="Card.Icon"]')
    expect(icon.attributes('aria-hidden')).toBe(label ? 'false' : 'true')
    expect(icon.attributes('role')).toBe(label ? 'img' : undefined)
    expect(icon.attributes('aria-label')).toBe(label)
    expect(icon.attributes('id')).toBeUndefined()
    expect(icon.classes()).toEqual(expect.arrayContaining(['source', 'vue']))
  })

  it('ignores custom siblings and keeps only the last subcomponent of each kind', () => {
    const wrapper = render(() => [
      h('div', 'Ignored'),
      heading('First'),
      heading('Last'),
      h(CardMetadata, null, () => 'First metadata'),
      h(CardMetadata, null, () => 'Last metadata'),
    ])
    expect(wrapper.text()).toBe('LastLast metadata')
    expect(wrapper.findAll('h3')).toHaveLength(1)
    expect(wrapper.findAll('[data-component="Card.Metadata"]')).toHaveLength(1)
  })

  it('preserves custom text, elements and wrapped subcomponents without automatic layout', () => {
    const wrapper = render(() => ['Text', h('div', [heading('Nested')])])
    expect(wrapper.text()).toBe('TextNested')
    expect(wrapper.find(`.${classes.CardBody}`).exists()).toBe(false)
  })

  it('does not recognize subcomponents inside an explicit Fragment', () => {
    const wrapper = render(() => [h(Fragment, [heading()])])
    expect(wrapper.find('h3').exists()).toBe(true)
    expect(wrapper.find(`.${classes.CardBody}`).exists()).toBe(false)
  })

  it('does not render for absent or conditional children and updates live slot contents', async () => {
    expect(render().find('[data-component="Card"]').exists()).toBe(false)
    expect(
      render(() => [h(Comment)])
        .find('[data-component="Card"]')
        .exists(),
    ).toBe(false)
    const visible = shallowRef(false)
    const text = shallowRef('Initial')
    const wrapper = render(() => [visible.value ? heading(text.value) : h(Comment)])
    visible.value = true
    await nextTick()
    expect(wrapper.find('h3').text()).toBe('Initial')
    text.value = 'Changed'
    await nextTick()
    expect(wrapper.find('h3').text()).toBe('Changed')
    visible.value = false
    await nextTick()
    expect((wrapper.vm as unknown as CardInstance).element).toBeNull()
  })

  it('recognizes structural template Fragments and selects the last matching child', () => {
    const wrapper = render(() => [
      createVNode(Fragment, null, [heading('First'), heading('Last')], 128),
    ])
    expect(wrapper.find(`.${classes.CardContent} > h3`).text()).toBe('Last')
  })

  it('automatically labels sections, keeps IDs unique, and updates context when as changes', async () => {
    const wrapper = render(() => [heading()], { as: 'section' })
    const titleId = wrapper.find('h3').attributes('id')
    expect(titleId).toBeTruthy()
    expect(wrapper.attributes('aria-labelledby')).toBe(titleId)
    expect(wrapper.attributes('as')).toBeUndefined()
    const siblings = render(() => [
      h('div', [
        h(Card as Component, { as: 'section' }, () => [heading('First')]),
        h(Card as Component, { as: 'section' }, () => [heading('Second')]),
      ]),
    ])
    const titles = siblings.findAll('h3')
    expect(titles[0]!.attributes('id')).not.toBe(titles[1]!.attributes('id'))
    await wrapper.setProps({ as: 'div' })
    expect(wrapper.find('h3').attributes('id')).toBeUndefined()
    expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
  })

  it.each([
    { 'aria-label': 'Explicit' },
    { 'aria-labelledby': 'external' },
    { 'aria-label': '' },
    { 'aria-label': undefined },
  ])('respects the presence of explicit section naming attrs: %s', (attrs) => {
    const wrapper = render(() => [heading()], { as: 'section', ...attrs })
    expect(wrapper.attributes('aria-labelledby')).toBe(attrs['aria-labelledby'])
  })

  it('retains the source generated reference when a heading has a custom id', () => {
    const wrapper = render(() => [heading('Heading', { id: 'custom' })], { as: 'section' })
    expect(wrapper.find('h3').attributes('id')).toBe('custom')
    expect(wrapper.attributes('aria-labelledby')).not.toBe('custom')
    const explicit = render(() => [heading('Heading', { id: 'custom' })], {
      as: 'section',
      'aria-labelledby': 'custom',
    })
    expect(explicit.attributes('aria-labelledby')).toBe('custom')
  })

  it.each(['h2', 'h3', 'h4', 'h5', 'h6'] as const)(
    'supports heading level %s and its DOM ref',
    (as) => {
      const wrapper = render(() => [
        heading('Heading', { as, className: 'custom', title: 'Title', style: { marginTop: 3 } }),
      ])
      const node = wrapper.findComponent(CardHeading)
      expect(node.element.tagName).toBe(as.toUpperCase())
      expect(node.classes()).toContain('custom')
      expect(node.attributes('title')).toBe('Title')
      expect((node.element as HTMLElement).style.marginTop).toBe('3px')
      expect(node.vm.element).toBe(node.element)
    },
  )

  it('forwards description/metadata attrs and refs while Action accepts only children', () => {
    const wrapper = render(() => [
      h(CardDescription, { title: 'Description', className: 'custom' }, () => 'Text'),
      h(CardMetadata, { title: 'Metadata', className: 'custom' }, () => 'Info'),
      h(CardAction, { id: 'ignored', class: 'ignored' }, () => h('button', 'Options')),
    ])
    for (const component of [CardDescription, CardMetadata]) {
      const node = wrapper.findComponent(component)
      expect(node.classes()).toContain('custom')
      expect(node.attributes('title')).toBeTruthy()
      expect(node.vm.element).toBe(node.element)
    }
    const action = wrapper.find('[data-component="Card.Action"]')
    expect(action.attributes()).toEqual({ 'data-component': 'Card.Action' })
  })

  it('isolates nested card title context', () => {
    const wrapper = render(
      () => [
        h('div', [
          heading('Outer'),
          h(Card as Component, { as: 'section' }, () => [heading('Inner')]),
        ]),
      ],
      { as: 'section' },
    )
    const titles = wrapper.findAll('h3')
    expect(wrapper.attributes('aria-labelledby')).toBe(titles[0]!.attributes('id'))
    expect(wrapper.find('section section').attributes('aria-labelledby')).toBe(
      titles[1]!.attributes('id'),
    )
  })

  it('generates matching section and heading ids in SSR', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(Card as Component, { as: 'section' }, () => [heading('SSR')]),
      }),
    )
    const titleId = html.match(/aria-labelledby="([^"]+)"/)?.[1]
    expect(titleId).toBeTruthy()
    expect(html).toContain(`id="${titleId}"`)
    expect(html).toContain('SSR')
  })
})
