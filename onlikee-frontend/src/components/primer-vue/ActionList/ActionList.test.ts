// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { h, nextTick, type VNode } from 'vue'
import { ActionList } from './index'

const wrappers: VueWrapper[] = []

function render(listProps: Partial<InstanceType<typeof ActionList>['$props']> = {}, items: VNode[] = []) {
  const wrapper = mount(ActionList, { props: listProps, slots: { default: () => items }, attachTo: document.body })
  wrappers.push(wrapper)
  return wrapper
}

function item(props: Record<string, unknown> = {}, children: unknown[] = ['Label']) {
  return h(ActionList.Item, props, { default: () => children })
}

function keyboard(el: Element, key: string, type = 'keydown') {
  el.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, cancelable: true }))
}

function click(el: Element) {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}

beforeEach(() => {
  // Spinner.vue onMounted 读取 window.matchMedia（prefers-reduced-motion）
  vi.stubGlobal('matchMedia', vi.fn((media: string) => ({ matches: false, media, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
})

afterEach(() => {
  wrappers.forEach(wrapper => wrapper.unmount())
  wrappers.length = 0
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('ActionList behavior', () => {
  it('stamps explicit li attribute layer', () => {
    const wrapper = render({}, [
      item({ class: 'consumer-class' }, ['Plain']),
      item({ disabled: true }, ['Disabled']),
      item({ variant: 'danger', active: true, size: 'large' }, ['Danger']),
      item({}, ['Described', h(ActionList.Description, { variant: 'block' }, { default: () => 'meta' })])
    ])
    const lis = wrapper.findAll('li[class*="action-list-item_"]')
    expect(lis).toHaveLength(4)
    for (const li of lis) expect(li.attributes('data-component')).toBe('ActionList.Item')
    expect(lis[0].attributes('data-is-disabled')).toBeUndefined()
    expect(lis[1].attributes('data-is-disabled')).toBe('true')
    expect(lis[1].attributes('data-disabled')).toBeUndefined()
    expect(lis[0].attributes('data-has-description')).toBe('false')
    expect(lis[3].attributes('data-has-description')).toBe('true')
    expect(lis[2].attributes('data-variant')).toBe('danger')
    expect(lis[0].attributes('data-variant')).toBeUndefined()
    expect(lis[2].attributes('data-active')).toBe('true')
    expect(lis[2].attributes('data-size')).toBeUndefined()
    expect(lis[2].get('[class*="action-list-content_"]').attributes('data-size')).toBe('large')
    expect(lis[0].get('[class*="action-list-content_"]').attributes('data-size')).toBe('medium')
    expect(lis[0].classes()).toEqual(expect.arrayContaining(['consumer-class']))
    expect(lis[0].classes().some(name => name.includes('action-list-item_'))).toBe(true)
  })

  it('default item uses buttonSemantics: li > button[type=button][tabindex=0], spacer first', () => {
    const wrapper = render({}, [item({ id: 'my-id' }, ['Alpha'])])
    const li = wrapper.get('li')
    expect(li.attributes('role')).toBeUndefined()
    expect(li.attributes('tabindex')).toBeUndefined()   // menuItemProps 不落 li
    const button = li.get('button[class*="action-list-content_"]')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('id')).toBe('my-id')
    expect(button.attributes('tabindex')).toBe('0')
    expect(button.attributes('disabled')).toBeUndefined()
    expect(Array.from(button.element.firstElementChild?.classList ?? []).some(name => name.includes('action-list-spacer_'))).toBe(true)
    const label = button.get('[data-component="ActionList.Item.Label"]')
    expect(label.attributes('id')).toBe('my-id--label')
    expect(button.attributes('aria-labelledby')).toBe('my-id--label')
    expect(label.text()).toBe('Alpha')
    expect(button.attributes('aria-describedby')).toBeUndefined()
    expect(button.attributes('data-action-list-control')).toBeUndefined()
  })

  it('listbox + selectionVariant infers role=option on li with inner div', () => {
    const wrapper = render({ role: 'listbox', selectionVariant: 'single' }, [
      item({ selected: true }, ['Sel']),
      item({}, ['Other'])
    ])
    const ul = wrapper.get('ul')
    expect(ul.attributes('role')).toBe('listbox')
    const [sel, other] = wrapper.findAll('li')
    expect(sel.attributes('role')).toBe('option')
    expect(sel.attributes('aria-selected')).toBe('true')
    expect(other.attributes('aria-selected')).toBeUndefined() // Source default selected is undefined.
    expect(sel.attributes('tabindex')).toBe('0')
    const content = sel.get('div[class*="action-list-content_"]')   // DefaultItemWrapper = DivItemContainer :219,63-71
    expect(content.attributes('role')).toBeUndefined()
    expect(content.attributes('tabindex')).toBeUndefined()
    expect(sel.attributes('data-action-list-control')).toBeUndefined()
  })

  it('menuitemcheckbox role maps selection to aria-checked', () => {
    const wrapper = render({}, [item({ role: 'menuitemcheckbox', selected: true }, ['Check'])])
    const li = wrapper.get('li')
    expect(li.attributes('role')).toBe('menuitemcheckbox') // listItemSemantics → listSemantics :175-183
    expect(li.attributes('aria-checked')).toBe('true')
    expect(li.attributes('aria-selected')).toBeUndefined()
    expect(li.find('div[class*="action-list-content_"]').exists()).toBe(true) // :219 DivItemContainer
  })

  it('renders the selection markers', () => {
    const single = render({ selectionVariant: 'single' }, [item({ selected: true }, ['S'])])
    const singleSel = single.get('[data-component="ActionList.Selection"]')
    expect(singleSel.element.tagName).toBe('SPAN')
    expect(singleSel.find('svg[class*="action-list-checkmark_"]').exists()).toBe(true)

    const multi = render({ selectionVariant: 'multiple' }, [item({ selected: true }, ['M'])])
    const box = multi.get('[data-component="ActionList.Selection"] div[class*="action-list-checkbox_"]')
    expect(box.element.children).toHaveLength(0)

    const radio = render({ selectionVariant: 'radio' }, [item({ selected: true }, ['R'])])
    const input = radio.get('[data-component="ActionList.Selection"] input')
    expect(input.attributes('type')).toBe('radio')
    expect(input.attributes('value')).toBe('unused')
    expect(input.attributes('tabindex')).toBe('-1')

    const menu = render({ role: 'menu', selectionVariant: 'multiple' }, [item({ selected: true }, ['Menu'])])
    expect(menu.find('[data-component="ActionList.Selection"] svg[class*="action-list-checkmark_"]').exists()).toBe(true)
    expect(menu.find('div[class*="action-list-checkbox_"]').exists()).toBe(false)
  })

  it('stamps visual data-components and composes aria-labelledby', () => {
    const icon = () => h('svg', { 'data-test-icon': true })
    const withTrailing = render({}, [item({ id: 't' }, [
      'Alpha',
      h(ActionList.LeadingVisual, null, { default: () => [icon()] }),
      h(ActionList.TrailingVisual, null, { default: () => ['hint'] })
    ])])
    const content = withTrailing.get('[class*="action-list-content_"]')
    expect(content.get('[data-component="ActionList.LeadingVisual"]').find('[data-test-icon]').exists()).toBe(true)
    const trailing = content.get('[data-component="ActionList.TrailingVisual"]')
    expect(trailing.attributes('id')).toBe('t--trailing-visual')
    expect(trailing.text()).toBe('hint')
    expect(content.find('[data-component="ActionList.Item--DividerContainer"]').exists()).toBe(true)
    expect(content.attributes('aria-labelledby')).toBe('t--label t--trailing-visual')

    const withoutTrailing = render({}, [item({ id: 'n' }, ['Beta'])])
    expect(withoutTrailing.get('[class*="action-list-content_"]').attributes('aria-labelledby')).toBe('n--label')
    expect(withoutTrailing.find('[data-component="ActionList.TrailingVisual"]').exists()).toBe(false)
    expect(withoutTrailing.find('[data-component="ActionList.LeadingVisual"]').exists()).toBe(false)
  })

  it('wraps label+description in a div only when description exists', () => {
    const inline = render({}, [item({ id: 'i' }, ['Alpha', h(ActionList.Description, null, { default: () => 'meta' })])])
    const wrap = inline.get('div[class*="action-list-description-wrap_"]')
    expect(wrap.attributes('data-description-variant')).toBe('inline')
    const desc = wrap.get('[data-component="ActionList.Description"]')
    expect(desc.attributes('id')).toBe('i--inline-description')
    expect(desc.text()).toBe('meta')
    expect(inline.get('[class*="action-list-content_"]').attributes('aria-describedby')).toBe('i--inline-description')
    expect(wrap.find('[data-component="ActionList.Item.Label"]').exists()).toBe(true)

    const block = render({}, [item({ id: 'b' }, ['Beta', h(ActionList.Description, { variant: 'block' }, { default: () => 'meta' })])])
    expect(block.get('div[class*="action-list-description-wrap_"]').attributes('data-description-variant')).toBe('block')
    expect(block.get('[data-component="ActionList.Description"]').attributes('id')).toBe('b--block-description')
    expect(block.get('[class*="action-list-content_"]').attributes('aria-describedby')).toBe('b--block-description')

    const none = render({}, [item({ id: 'x' }, ['Gamma'])])
    expect(none.find('[class*="action-list-description-wrap_"]').exists()).toBe(false)
    expect(none.get('[class*="action-list-content_"]').attributes('aria-describedby')).toBeUndefined()
    expect(none.find('[data-component="ActionList.Item--DividerContainer"] > [data-component="ActionList.Item.Label"]').exists()).toBe(true)
  })

  it('loading: spinner replaces leading visual, or lands trailing without leading; data-loading + hidden Loading', () => {
    const icon = () => h('svg', { 'data-test-icon': true })
    const withLeading = render({}, [item({ loading: true }, [
      'Alpha',
      h(ActionList.LeadingVisual, null, { default: () => [icon()] }),
      h(ActionList.TrailingVisual, null, { default: () => ['hint'] })
    ])])
    const content = withLeading.get('[class*="action-list-content_"]')
    expect(content.attributes('data-loading')).toBe('true')
    const leading = content.get('[data-component="ActionList.LeadingVisual"]')
    expect(leading.find('[data-component="Spinner"]').exists()).toBe(true)
    expect(leading.find('[data-test-icon]').exists()).toBe(false)
    const trailing = content.get('[data-component="ActionList.TrailingVisual"]')
    expect(trailing.text()).toBe('hint')
    expect(trailing.find('[data-component="Spinner"]').exists()).toBe(false)
    const hidden = content.get('[data-component="ActionList.Item.Label"] span.internal-visually-hidden')
    expect(hidden.text()).toBe('Loading')

    const withoutLeading = render({}, [item({ loading: true }, ['Beta', h(ActionList.TrailingVisual, null, { default: () => ['hint'] })])])
    const content2 = withoutLeading.get('[class*="action-list-content_"]')
    expect(content2.find('[data-component="ActionList.LeadingVisual"]').exists()).toBe(false)
    const trailing2 = content2.get('[data-component="ActionList.TrailingVisual"]')
    expect(trailing2.find('[data-component="Spinner"]').exists()).toBe(true)
    expect(trailing2.text()).not.toBe('hint')
  })

  it('disabled items stay in the focus zone but block activation', async () => {
    const onSelect = vi.fn()
    const wrapper = render({ role: 'menu' }, [
      item({ onSelect, role: 'menuitem' }, ['Alpha']),
      item({ onSelect, disabled: true, role: 'menuitem' }, ['Disabled']),
      item({ onSelect, role: 'menuitem' }, ['Charlie'])
    ])
    const buttons = wrapper.findAll('[role=menuitem]').map(b => b.element as HTMLElement)
    expect(buttons.map(b => b.getAttribute('disabled'))).toEqual([null, null, null])
    expect(buttons[1].getAttribute('aria-disabled')).toBe('true')
    expect(wrapper.findAll('li')[1].attributes('data-is-disabled')).toBe('true')
    await nextTick()
    buttons[0].focus()
    keyboard(buttons[0], 'ArrowDown')
    await nextTick()
    expect(document.activeElement).toBe(buttons[1]) // 禁用条目仍在 zone 中可高亮
    click(buttons[1])
    expect(onSelect).not.toHaveBeenCalled()
    keyboard(buttons[1], 'ArrowDown')
    await nextTick()
    expect(document.activeElement).toBe(buttons[2])
    click(buttons[2])
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('keypress Enter/Space emits select only for non-buttonSemantics; Space preventDefaults', () => {
    const onSelect = vi.fn()
    const wrapper = render({ role: 'listbox', selectionVariant: 'single' }, [item({ onSelect }, ['Alpha'])])
    const li = wrapper.get('li')
    keyboard(li.element, 'Enter', 'keypress')
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0][0]).toBeInstanceOf(KeyboardEvent) // shared.ts:20 mouse|keyboard
    const space = new KeyboardEvent('keypress', { key: ' ', bubbles: true, cancelable: true })
    li.element.dispatchEvent(space)
    expect(onSelect).toHaveBeenCalledTimes(2)
    expect(space.defaultPrevented).toBe(true)
    keyboard(li.element, 'a', 'keypress')
    expect(onSelect).toHaveBeenCalledTimes(2)

    const buttonSpy = vi.fn()
    render({}, [item({ onSelect: buttonSpy }, ['Beta'])])
    const wrappersList = wrappers[wrappers.length - 1]
    keyboard(wrappersList.get('button[class*="action-list-content_"]').element, 'Enter', 'keypress')
    expect(buttonSpy).not.toHaveBeenCalled()
  })

  it('LinkItem forwards native link props; inactive links render spans', () => {
    const onClick = vi.fn()
    const wrapper = render({}, [h(ActionList.LinkItem, { href: '#a', target: '_blank', rel: 'noopener noreferrer', onClick }, { default: () => ['Link'] })])
    const li = wrapper.get('li')
    const link = li.get('a[class*="action-list-content_"]')
    expect(li.attributes('role')).toBeUndefined()
    expect(link.attributes('href')).toBe('#a')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    expect(link.attributes('tabindex')).toBe('0')
    click(link.element)
    expect(onClick).toHaveBeenCalledTimes(1)
    const withRole = render({}, [h(ActionList.LinkItem, { href: '#b', role: 'option' }, { default: () => ['Opt'] })])
    expect(withRole.get('li').attributes('role')).toBeUndefined()
    expect(withRole.get('a').attributes('role')).toBe('option')
    expect(withRole.get('a').attributes('aria-selected')).toBeUndefined()
    const inactive = render({}, [h(ActionList.LinkItem, { href: '#c', inactiveText: 'Unavailable', onClick }, { default: () => ['No'] })])
    expect(inactive.find('a').exists()).toBe(false)
    expect(inactive.get('li').attributes('data-inactive')).toBe('true')
    expect(inactive.find('span[class*="action-list-content_"]').exists()).toBe(true)
  })

  it('ul renders list attributes (data-component, literal data-dividers, no data-selection-variant)', () => {
    const plain = render()
    const ul = plain.get('ul')
    expect(ul.attributes('data-component')).toBe('ActionList')
    expect(ul.attributes('data-dividers')).toBe('false')
    expect(ul.attributes('data-variant')).toBe('inset')
    expect(ul.attributes('role')).toBeUndefined()

    const withProps = render({ showDividers: true, selectionVariant: 'single', variant: 'full', role: 'listbox' })
    const ul2 = withProps.get('ul')
    expect(ul2.attributes('data-dividers')).toBe('true')
    expect(ul2.attributes('data-variant')).toBe('full')
    expect(ul2.attributes('role')).toBe('listbox')
    expect(ul2.attributes('data-selection-variant')).toBeUndefined()
  })

  it('writes data-mixed-descriptions when descriptions are mixed', async () => {
    const wrapper = render({}, [
      item({}, ['A', h(ActionList.Description, null, { default: () => 'meta' })]),
      item({}, ['B'])
    ])
    await nextTick()
    expect(wrapper.get('ul').attributes('data-mixed-descriptions')).toBe('true')

    const uniform = render({}, [item({}, ['A']), item({}, ['B'])])
    await nextTick()
    expect(uniform.get('ul').attributes('data-mixed-descriptions')).toBeUndefined()
  })

  it('dev-warns when selected without selectionVariant', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render({}, [item({ selected: true }, ['Sel'])])
    expect(warn).toHaveBeenCalledWith('Warning:', 'For Item to be selected, ActionList or ActionList.Group should have a selectionVariant defined.')
    warn.mockClear()
    render({ selectionVariant: 'single' }, [item({ selected: true }, ['Sel'])])
    expect(warn).not.toHaveBeenCalled()
  })

  it('focus zone: Home/End/PageUp/PageDown jump to first/last; arrows wrap', async () => {
    const wrapper = render({ role: 'menu' }, [item({ role: 'menuitem' }, ['A']), item({ role: 'menuitem' }, ['B']), item({ role: 'menuitem' }, ['C'])])
    const buttons = wrapper.findAll('[role=menuitem]').map(b => b.element as HTMLElement)
    await nextTick()
    buttons[1].focus()
    keyboard(buttons[1], 'Home')
    await nextTick()
    expect(document.activeElement).toBe(buttons[0])
    keyboard(buttons[0], 'End')
    await nextTick()
    expect(document.activeElement).toBe(buttons[2])
    keyboard(buttons[2], 'PageUp') // focus-zone.js:64 PageUp → 'start'
    await nextTick()
    expect(document.activeElement).toBe(buttons[0])
    keyboard(buttons[0], 'PageDown') // focus-zone.js:65 PageDown → 'end'
    await nextTick()
    expect(document.activeElement).toBe(buttons[2])
    keyboard(buttons[2], 'ArrowDown') // Source menu focus zone wraps.
    await nextTick()
    expect(document.activeElement).toBe(buttons[0])
  })
})
