// @vitest-environment jsdom
// ActionList React 迁移 pin —— 全部断言引用 react 源（packages/react/src/ActionList/** 与
// node_modules/@primer/behaviors），约定与 FilteredActionList.test.ts 一致（attachTo body + matchMedia stub）。
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

describe('ActionList React migration', () => {
  it('stamps the source explicit li attribute layer (Item.tsx:323-335)', () => {
    const wrapper = render({}, [
      item({ class: 'consumer-class' }, ['Plain']),
      item({ disabled: true }, ['Disabled']),
      item({ variant: 'danger', active: true, size: 'large' }, ['Danger']),
      item({}, ['Described', h(ActionList.Description, { variant: 'block' }, { default: () => 'meta' })])
    ])
    const lis = wrapper.findAll('li.action-list-item')
    expect(lis).toHaveLength(4)
    for (const li of lis) expect(li.attributes('data-component')).toBe('ActionList.Item') // Item.tsx:326
    // Item.tsx:330 —— data-is-disabled（不是 data-disabled）
    expect(lis[0].attributes('data-is-disabled')).toBeUndefined()
    expect(lis[1].attributes('data-is-disabled')).toBe('true')
    expect(lis[1].attributes('data-disabled')).toBeUndefined()
    // Item.tsx:332 —— data-has-description 恒渲染字面量 "true"/"false"
    expect(lis[0].attributes('data-has-description')).toBe('false')
    expect(lis[3].attributes('data-has-description')).toBe('true')
    // Item.tsx:327-328 —— data-variant 仅 danger；data-active
    expect(lis[2].attributes('data-variant')).toBe('danger')
    expect(lis[0].attributes('data-variant')).toBeUndefined()
    expect(lis[2].attributes('data-active')).toBe('true')
    // Item.tsx:341 —— data-size 只在 content 上，从不在 li 上
    expect(lis[2].attributes('data-size')).toBeUndefined()
    expect(lis[2].get('.action-list-content').attributes('data-size')).toBe('large')
    expect(lis[0].get('.action-list-content').attributes('data-size')).toBe('medium')
    // Item.tsx:335 —— clsx(ActionListItem, className)：消费者 class 合并到 li
    expect(lis[0].classes()).toEqual(expect.arrayContaining(['action-list-item', 'consumer-class']))
  })

  it('default item uses buttonSemantics: li > button[type=button][tabindex=0], spacer first (Item.tsx:219,53-61,281,348)', () => {
    const wrapper = render({}, [item({ id: 'my-id' }, ['Alpha'])])
    const li = wrapper.get('li')
    expect(li.attributes('role')).toBeUndefined()       // Item.tsx:281 containerProps = {}
    expect(li.attributes('tabindex')).toBeUndefined()   // menuItemProps 不落 li
    const button = li.get('button.action-list-content')
    expect(button.attributes('type')).toBe('button')    // ButtonItemContainer Item.tsx:56
    expect(button.attributes('id')).toBe('my-id')       // Item.tsx:259 id 被消费后由 menuItemProps 渲染
    expect(button.attributes('tabindex')).toBe('0')     // Item.tsx:254
    expect(button.attributes('disabled')).toBeUndefined() // 源从不设 DOM disabled（:251 仅 aria-disabled）
    // Item.tsx:348 —— Spacer 为 content 首子元素
    expect(button.element.firstElementChild?.className).toBe('action-list-spacer')
    // Item.tsx:255,366-372 —— aria-labelledby → label span
    const label = button.get('[data-component="ActionList.Item.Label"]')
    expect(label.attributes('id')).toBe('my-id--label') // Item.tsx:211
    expect(button.attributes('aria-labelledby')).toBe('my-id--label')
    expect(label.text()).toBe('Alpha')
    expect(button.attributes('aria-describedby')).toBeUndefined() // Item.tsx:239-245 无 description → undefined
    expect(button.attributes('data-action-list-control')).toBe('') // 端口 zone 标记（登记）
  })

  it('listbox + selectionVariant infers role=option on li with inner div (Item.tsx:154-157,279-282)', () => {
    const wrapper = render({ role: 'listbox', selectionVariant: 'single' }, [
      item({ selected: true }, ['Sel']),
      item({}, ['Other'])
    ])
    const ul = wrapper.get('ul')
    expect(ul.attributes('role')).toBe('listbox') // List.tsx:112
    const [sel, other] = wrapper.findAll('li')
    expect(sel.attributes('role')).toBe('option')        // Item.tsx:258 role 落 li（listSemantics :280-282）
    expect(sel.attributes('aria-selected')).toBe('true') // Item.tsx:172,223,257
    expect(other.attributes('aria-selected')).toBe('false')
    expect(sel.attributes('tabindex')).toBe('0')         // Item.tsx:254
    const content = sel.get('div.action-list-content')   // DefaultItemWrapper = DivItemContainer :219,63-71
    expect(content.attributes('role')).toBeUndefined()
    expect(content.attributes('tabindex')).toBeUndefined()
    expect(sel.attributes('data-action-list-control')).toBe('')
  })

  it('menuitemcheckbox role maps selection to aria-checked (Item.tsx:169-172,223,257)', () => {
    const wrapper = render({}, [item({ role: 'menuitemcheckbox', selected: true }, ['Check'])])
    const li = wrapper.get('li')
    expect(li.attributes('role')).toBe('menuitemcheckbox') // listItemSemantics → listSemantics :175-183
    expect(li.attributes('aria-checked')).toBe('true')
    expect(li.attributes('aria-selected')).toBeUndefined()
    expect(li.find('div.action-list-content').exists()).toBe(true) // :219 DivItemContainer
  })

  it('renders the source selection markers (Selection.tsx:12-53)', () => {
    const single = render({ selectionVariant: 'single' }, [item({ selected: true }, ['S'])])
    const singleSel = single.get('[data-component="ActionList.Selection"]')
    expect(singleSel.element.tagName).toBe('SPAN') // VisualContainer = span.VisualWrap（Visuals.tsx:12-14）
    expect(singleSel.find('svg.action-list-checkmark').exists()).toBe(true) // Selection.tsx:40-46

    const multi = render({ selectionVariant: 'multiple' }, [item({ selected: true }, ['M'])])
    // Selection.tsx:48-52 —— MultiSelectCheckbox = 空 div（勾选由 CSS ::before mask 绘制）
    const box = multi.get('[data-component="ActionList.Selection"] div.action-list-checkbox')
    expect(box.element.children).toHaveLength(0)

    const radio = render({ selectionVariant: 'radio' }, [item({ selected: true }, ['R'])])
    const input = radio.get('[data-component="ActionList.Selection"] input')
    expect(input.attributes('type')).toBe('radio')
    expect(input.attributes('value')).toBe('unused') // Selection.tsx:35
    expect(input.attributes('tabindex')).toBe('-1')

    // Selection.tsx:40 怪癖 —— listRole==='menu' 时 multiple 也渲染 checkmark
    const menu = render({ role: 'menu', selectionVariant: 'multiple' }, [item({ selected: true }, ['Menu'])])
    expect(menu.find('[data-component="ActionList.Selection"] svg.action-list-checkmark').exists()).toBe(true)
    expect(menu.find('div.action-list-checkbox').exists()).toBe(false)
  })

  it('stamps visual data-components and composes aria-labelledby (Visuals.tsx:17-42, Item.tsx:230-237)', () => {
    const icon = () => h('svg', { 'data-test-icon': true })
    const withTrailing = render({}, [item({ id: 't' }, [
      'Alpha',
      h(ActionList.LeadingVisual, null, { default: () => [icon()] }),
      h(ActionList.TrailingVisual, null, { default: () => ['hint'] })
    ])])
    const content = withTrailing.get('.action-list-content')
    expect(content.get('[data-component="ActionList.LeadingVisual"]').find('[data-test-icon]').exists()).toBe(true) // Visuals.tsx:21
    const trailing = content.get('[data-component="ActionList.TrailingVisual"]') // Visuals.tsx:35
    expect(trailing.attributes('id')).toBe('t--trailing-visual') // Visuals.tsx:36
    expect(trailing.text()).toBe('hint')
    expect(content.find('[data-component="ActionList.Item--DividerContainer"]').exists()).toBe(true) // Item.tsx:360
    expect(content.attributes('aria-labelledby')).toBe('t--label t--trailing-visual') // Item.tsx:233-237

    const withoutTrailing = render({}, [item({ id: 'n' }, ['Beta'])])
    expect(withoutTrailing.get('.action-list-content').attributes('aria-labelledby')).toBe('n--label')
    expect(withoutTrailing.find('[data-component="ActionList.TrailingVisual"]').exists()).toBe(false)
    expect(withoutTrailing.find('[data-component="ActionList.LeadingVisual"]').exists()).toBe(false) // Visuals.tsx:62-63 slot 缺席不渲染
  })

  it('wraps label+description in a div only when description exists (Item.tsx:361-365, ConditionalWrapper.tsx:8, Description.tsx:58-68)', () => {
    const inline = render({}, [item({ id: 'i' }, ['Alpha', h(ActionList.Description, null, { default: () => 'meta' })])])
    const wrap = inline.get('div.action-list-description-wrap')
    expect(wrap.attributes('data-description-variant')).toBe('inline')
    const desc = wrap.get('[data-component="ActionList.Description"]')
    expect(desc.attributes('id')).toBe('i--inline-description') // Description.tsx:61
    expect(desc.text()).toBe('meta')
    expect(inline.get('.action-list-content').attributes('aria-describedby')).toBe('i--inline-description') // Item.tsx:242
    expect(wrap.find('[data-component="ActionList.Item.Label"]').exists()).toBe(true)

    const block = render({}, [item({ id: 'b' }, ['Beta', h(ActionList.Description, { variant: 'block' }, { default: () => 'meta' })])])
    expect(block.get('div.action-list-description-wrap').attributes('data-description-variant')).toBe('block')
    expect(block.get('[data-component="ActionList.Description"]').attributes('id')).toBe('b--block-description') // Description.tsx:61
    expect(block.get('.action-list-content').attributes('aria-describedby')).toBe('b--block-description') // Item.tsx:241

    const none = render({}, [item({ id: 'x' }, ['Gamma'])])
    expect(none.find('.action-list-description-wrap').exists()).toBe(false) // ConditionalWrapper.tsx:9 条件为假渲染裸 children
    expect(none.get('.action-list-content').attributes('aria-describedby')).toBeUndefined()
    expect(none.find('[data-component="ActionList.Item--DividerContainer"] > [data-component="ActionList.Item.Label"]').exists()).toBe(true)
  })

  it('loading: spinner replaces leading visual, or lands trailing without leading; data-loading + hidden Loading (Visuals.tsx:59-86, Item.tsx:253,370)', () => {
    const icon = () => h('svg', { 'data-test-icon': true })
    const withLeading = render({}, [item({ loading: true }, [
      'Alpha',
      h(ActionList.LeadingVisual, null, { default: () => [icon()] }),
      h(ActionList.TrailingVisual, null, { default: () => ['hint'] })
    ])])
    const content = withLeading.get('.action-list-content')
    expect(content.attributes('data-loading')).toBe('true') // Item.tsx:253 落在承载 menuItemProps 的元素上
    const leading = content.get('[data-component="ActionList.LeadingVisual"]')
    expect(leading.find('[data-component="Spinner"]').exists()).toBe(true) // Visuals.tsx:83-85 Spinner 替换 leading
    expect(leading.find('[data-test-icon]').exists()).toBe(false)
    const trailing = content.get('[data-component="ActionList.TrailingVisual"]')
    expect(trailing.text()).toBe('hint') // Visuals.tsx:64-70 有 leading 时 trailing 渲染 slot children
    expect(trailing.find('[data-component="Spinner"]').exists()).toBe(false)
    // Item.tsx:370 —— loading === true（严格）时 VisuallyHidden "Loading"
    const hidden = content.get('[data-component="ActionList.Item.Label"] span.internal-visually-hidden')
    expect(hidden.text()).toBe('Loading')

    const withoutLeading = render({}, [item({ loading: true }, ['Beta', h(ActionList.TrailingVisual, null, { default: () => ['hint'] })])])
    const content2 = withoutLeading.get('.action-list-content')
    expect(content2.find('[data-component="ActionList.LeadingVisual"]').exists()).toBe(false) // Visuals.tsx:73-80 leading 位无 slot → 渲染 children(undefined)
    const trailing2 = content2.get('[data-component="ActionList.TrailingVisual"]')
    expect(trailing2.find('[data-component="Spinner"]').exists()).toBe(true) // Visuals.tsx:64-70 spinner 落 trailing
    expect(trailing2.text()).not.toBe('hint') // slot children 被 spinner 取代（源怪癖）
  })

  it('disabled items stay in the focus zone but block activation (iterate-focusable-elements.js:36-45, Item.tsx:186-192)', async () => {
    const onSelect = vi.fn()
    const wrapper = render({}, [
      item({ onSelect }, ['Alpha']),
      item({ onSelect, disabled: true }, ['Disabled']),
      item({ onSelect }, ['Charlie'])
    ])
    const buttons = wrapper.findAll('button.action-list-content').map(b => b.element as HTMLElement)
    // 源从不设 DOM disabled（Item.tsx:251 仅 aria-disabled）
    expect(buttons.map(b => b.getAttribute('disabled'))).toEqual([null, null, null])
    expect(buttons[1].getAttribute('aria-disabled')).toBe('true')
    expect(wrapper.findAll('li')[1].attributes('data-is-disabled')).toBe('true') // Item.tsx:330
    buttons[0].focus()
    keyboard(buttons[0], 'ArrowDown')
    await nextTick()
    expect(document.activeElement).toBe(buttons[1]) // 禁用条目仍在 zone 中可高亮
    click(buttons[1])
    expect(onSelect).not.toHaveBeenCalled() // Item.tsx:188 guard
    keyboard(buttons[1], 'ArrowDown')
    await nextTick()
    expect(document.activeElement).toBe(buttons[2])
    click(buttons[2])
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('keypress Enter/Space emits select only for non-buttonSemantics; Space preventDefaults (Item.tsx:194-208,250)', () => {
    const onSelect = vi.fn()
    const wrapper = render({ role: 'listbox', selectionVariant: 'single' }, [item({ onSelect }, ['Alpha'])])
    const li = wrapper.get('li')
    keyboard(li.element, 'Enter', 'keypress')
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0][0]).toBeInstanceOf(KeyboardEvent) // shared.ts:20 mouse|keyboard
    const space = new KeyboardEvent('keypress', { key: ' ', bubbles: true, cancelable: true })
    li.element.dispatchEvent(space)
    expect(onSelect).toHaveBeenCalledTimes(2)
    // Item.tsx:198-203 —— 源 preventDefault 后立即重置 defaultPrevented 再调 onSelect；
    // 端口等价：先 emit 后 preventDefault（FAL 同款，FilteredActionList.vue:226-228）
    expect(space.defaultPrevented).toBe(true)
    keyboard(li.element, 'a', 'keypress')
    expect(onSelect).toHaveBeenCalledTimes(2)

    // Item.tsx:250 —— buttonSemantics 时 onKeyPress 为 undefined → keypress 不触发 select
    const buttonSpy = vi.fn()
    render({}, [item({ onSelect: buttonSpy }, ['Beta'])])
    const wrappersList = wrappers[wrappers.length - 1]
    keyboard(wrappersList.get('button.action-list-content').element, 'Enter', 'keypress')
    expect(buttonSpy).not.toHaveBeenCalled()
  })

  it('LinkItem: anchor carries menuItemProps; li role=none only with itemRole (Item.tsx:280,285, LinkItem.tsx:48-72)', () => {
    const onSelect = vi.fn()
    const onClick = vi.fn()
    const wrapper = render({}, [
      h(ActionList.LinkItem, { href: '/a', newTab: true, onSelect, onClick }, { default: () => ['Link'] })
    ])
    const li = wrapper.get('li')
    expect(li.attributes('role')).toBeUndefined() // Item.tsx:280 itemRole undefined → role: undefined
    expect(li.attributes('data-component')).toBe('ActionList.Item')
    const a = li.get('a.action-list-content')
    expect(a.attributes('href')).toBe('/a')
    expect(a.attributes('target')).toBe('_blank') // 端口 newTab prop（登记）
    expect(a.attributes('rel')).toBe('noopener noreferrer')
    expect(a.attributes('tabindex')).toBe('0')    // Item.tsx:254
    expect(a.attributes('aria-labelledby')).toBe(`${a.attributes('id')}--label`) // Item.tsx:255,211
    expect(a.attributes('data-size')).toBe('medium') // Item.tsx:341
    click(a.element)
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledTimes(1) // LinkItem.tsx:49-52 组合触发

    const withRole = render({}, [h(ActionList.LinkItem, { href: '/b', role: 'option' }, { default: () => ['Opt'] })])
    expect(withRole.get('li').attributes('role')).toBe('none') // Item.tsx:280
    const a2 = withRole.get('a.action-list-content')
    expect(a2.attributes('role')).toBe('option') // Item.tsx:285 wrapperProps = menuItemProps
    expect(a2.attributes('aria-selected')).toBe('false') // Item.tsx:257

    // 源怪癖：disabled LinkItem 只拦 select；消费者 onClick 仍触发、导航不被 preventDefault
    // （Item.tsx:186-192 guard 无 preventDefault + LinkItem.tsx:49-52 无条件组合）
    const disabledSelect = vi.fn()
    const disabledClick = vi.fn()
    const disabledWrap = render({}, [
      h(ActionList.LinkItem, { href: '/c', disabled: true, onSelect: disabledSelect, onClick: disabledClick }, { default: () => ['No'] })
    ])
    const a3 = disabledWrap.get('a.action-list-content')
    expect(a3.attributes('aria-disabled')).toBe('true') // Item.tsx:251
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
    a3.element.dispatchEvent(clickEvent)
    expect(disabledSelect).not.toHaveBeenCalled()
    expect(disabledClick).toHaveBeenCalledTimes(1)
    expect(clickEvent.defaultPrevented).toBe(false)
  })

  it('ul mirrors List.tsx:109-127 (data-component, literal data-dividers, no data-selection-variant)', () => {
    const plain = render()
    const ul = plain.get('ul')
    expect(ul.attributes('data-component')).toBe('ActionList') // List.tsx:118
    expect(ul.attributes('data-dividers')).toBe('false') // List.tsx:119 data-* boolean → 字面量
    expect(ul.attributes('data-variant')).toBe('inset')
    expect(ul.attributes('role')).toBeUndefined()

    const withProps = render({ showDividers: true, selectionVariant: 'single', variant: 'full', role: 'listbox' })
    const ul2 = withProps.get('ul')
    expect(ul2.attributes('data-dividers')).toBe('true')
    expect(ul2.attributes('data-variant')).toBe('full')
    expect(ul2.attributes('role')).toBe('listbox')
    expect(ul2.attributes('data-selection-variant')).toBeUndefined() // List.tsx:109-127 源不渲染该属性
  })

  it('writes data-mixed-descriptions when descriptions are mixed (List.tsx:95-107)', async () => {
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

  it('dev-warns when selected without selectionVariant (Selection.tsx:22-28, utils/warning.ts:6)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render({}, [item({ selected: true }, ['Sel'])])
    expect(warn).toHaveBeenCalledWith('Warning:', 'For Item to be selected, ActionList or ActionList.Group should have a selectionVariant defined.')
    warn.mockClear()
    render({ selectionVariant: 'single' }, [item({ selected: true }, ['Sel'])])
    expect(warn).not.toHaveBeenCalled()
  })

  it('focus zone: Home/End/PageUp/PageDown jump to first/last; arrows wrap (List.tsx:65, focus-zone.js:62-65)', async () => {
    const wrapper = render({}, [item({}, ['A']), item({}, ['B']), item({}, ['C'])])
    const buttons = wrapper.findAll('button.action-list-content').map(b => b.element as HTMLElement)
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
    keyboard(buttons[2], 'ArrowDown') // 端口 zone 恒开 + wrap（List.tsx:66-68 登记项）
    await nextTick()
    expect(document.activeElement).toBe(buttons[0])
  })
})
