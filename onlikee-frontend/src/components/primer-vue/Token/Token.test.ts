// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import Token from './Token.vue'

const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.forEach(wrapper => wrapper.unmount())
  wrappers.length = 0
  document.body.innerHTML = ''
})
function track<T extends VueWrapper>(wrapper: T): T {
  wrappers.push(wrapper)
  return wrapper
}

describe('Token disabled 路径', () => {
  test('span 根渲染 disabled=""，不渲染 aria-disabled，光标标记为非交互', () => {
    const wrapper = track(mount(Token, { props: { text: 'Alpha', disabled: true } }))
    const root = wrapper.get('[class*="token_"]')
    expect(root.element.tagName).toBe('SPAN')
    expect(root.attributes('disabled')).toBe('')
    expect(root.attributes('aria-disabled')).toBeUndefined()
    expect(root.attributes('data-cursor-is-interactive')).toBe('false')
  })

  test('disabled 时 Backspace/Delete 仍触发 remove', async () => {
    const wrapper = track(mount(Token, { props: { text: 'Alpha', disabled: true }, attrs: { onRemove: () => {} } }))
    await wrapper.get('[class*="token_"]').trigger('keydown', { key: 'Backspace' })
    await wrapper.get('[class*="token_"]').trigger('keydown', { key: 'Delete' })
    expect(wrapper.emitted('remove')).toHaveLength(2)
  })

  test('disabled 时移除按钮仍为可用 button 且点击触发 remove', async () => {
    const wrapper = track(mount(Token, { props: { text: 'Alpha', disabled: true }, attrs: { onRemove: () => {} } }))
    const remove = wrapper.get('[class*="token__remove_"]')
    expect(remove.element.tagName).toBe('BUTTON')
    expect(remove.attributes('disabled')).toBeUndefined()
    expect(remove.attributes('type')).toBe('button')
    expect(remove.attributes('aria-label')).toBe('Remove token')
    expect(remove.attributes('aria-hidden')).toBe('false')
    await remove.trigger('click')
    expect(wrapper.emitted('remove')).toHaveLength(1)
  })
})

describe('Token 交互形态与文本容器', () => {
  test('可交互且可移除时根为 span，移除按钮为 aria-hidden 的 span（tabindex -1）', () => {
    const wrapper = track(mount(Token, { props: { text: 'Alpha', as: 'button' }, attrs: { onRemove: () => {} } }))
    const root = wrapper.get('[class*="token_"]')
    expect(root.element.tagName).toBe('SPAN')
    expect(root.attributes('data-is-remove-btn')).toBe('true')
    const remove = wrapper.get('[class*="token__remove_"]')
    expect(remove.element.tagName).toBe('SPAN')
    expect(remove.attributes('tabindex')).toBe('-1')
    expect(remove.attributes('aria-hidden')).toBe('true')
    expect(remove.attributes('aria-label')).toBeUndefined()
    expect(wrapper.get('.internal-visually-hidden').text()).toBe('(press backspace or delete to remove)')
  })

  test('多目标形态下文本容器为 as 标签且不设置 type', () => {
    const wrapper = track(mount(Token, { props: { text: 'Alpha', as: 'button' }, attrs: { onRemove: () => {} } }))
    const text = wrapper.get('[class*="token__text_"]')
    expect(text.element.tagName).toBe('BUTTON')
    expect(text.attributes('type')).toBeUndefined()
  })

  test('非多目标形态文本容器为 span，移除按钮渲染 aria-hidden="false"', () => {
    const wrapper = track(mount(Token, { props: { text: 'Alpha' }, attrs: { onRemove: () => {} } }))
    expect(wrapper.get('[class*="token_"]').element.tagName).toBe('SPAN')
    expect(wrapper.get('[class*="token__text_"]').element.tagName).toBe('SPAN')
    expect(wrapper.get('[class*="token__remove_"]').attributes('aria-hidden')).toBe('false')
    expect(wrapper.find('[class*="token__remove_"][tabindex]').exists()).toBe(false)
  })

  test('内联 X 图标按 size 输出原生 12/16px 变体', () => {
    const small = track(mount(Token, { props: { text: 'Alpha', size: 'small' }, attrs: { onRemove: () => {} } }))
    const svg = small.get('[class*="token__remove_"] svg')
    expect(svg.attributes('viewbox')).toBeUndefined()
    expect(svg.attributes('viewBox')).toBe('0 0 12 12')
    expect(svg.attributes('width')).toBe('12')
    expect(svg.attributes('class')).toBe('octicon octicon-x')
    expect(svg.attributes('data-component')).toBe('Octicon')
    expect(svg.attributes('display')).toBe('inline-block')
    expect(svg.attributes('overflow')).toBe('visible')
    expect(svg.attributes('style')).toContain('vertical-align: text-bottom')
    const large = track(mount(Token, { props: { text: 'Alpha', size: 'large' }, attrs: { onRemove: () => {} } }))
    const svg16 = large.get('[class*="token__remove_"] svg')
    expect(svg16.attributes('viewBox')).toBe('0 0 16 16')
    expect(svg16.attributes('width')).toBe('16')
    expect(large.get('[class*="token__remove_"]').attributes('style')).toContain('transform: translate(1px, -1px)')
  })
})

describe('Token 属性泄漏与覆盖', () => {
  test('isSelected 未传时 data-is-selected 属性省略；显式 false/true 渲染字符串', () => {
    const omitted = track(mount(Token, { props: { text: 'Alpha' } }))
    expect(omitted.get('[class*="token_"]').attributes('data-is-selected')).toBeUndefined()
    const falsy = track(mount(Token, { props: { text: 'Alpha', isSelected: false } }))
    expect(falsy.get('[class*="token_"]').attributes('data-is-selected')).toBe('false')
    const truthy = track(mount(Token, { props: { text: 'Alpha', isSelected: true } }))
    expect(truthy.get('[class*="token_"]').attributes('data-is-selected')).toBe('true')
  })

  test('text 经 TokenBase rest 泄漏为 DOM 属性', () => {
    const str = track(mount(Token, { props: { text: 'Alpha' } }))
    expect(str.get('[class*="token_"]').attributes('text')).toBe('Alpha')
    const num = track(mount(Token, { props: { text: 42 } }))
    expect(num.get('[class*="token_"]').attributes('text')).toBe('42')
    const obj = track(mount(Token, { props: { text: { not: 'a node' } as never } }))
    expect(obj.get('[class*="token_"]').attributes('text')).toBe('[object Object]')
  })

  test('消费者同名属性覆盖 data-* 计算值', () => {
    const wrapper = track(mount(Token, {
      props: { text: 'Alpha', size: 'small' },
      attrs: { 'data-size': 'large', 'data-is-remove-btn': 'overridden' }
    }))
    const root = wrapper.get('[class*="token_"]')
    expect(root.attributes('data-size')).toBe('large')
    expect(root.attributes('data-is-remove-btn')).toBe('overridden')
  })

  test('leadingVisual falsy（null/undefined）不渲染容器；large/xlarge 挂自身修饰类', () => {
    const visual = { render: () => null }
    const none = track(mount(Token, { props: { text: 'Alpha', leadingVisual: null } }))
    expect(none.find('[class*="token__leading_"]').exists()).toBe(false)
    const small = track(mount(Token, { props: { text: 'Alpha', size: 'small', leadingVisual: visual } }))
    expect(small.find('[class*="token__leading_"]').exists()).toBe(false)
    const large = track(mount(Token, { props: { text: 'Alpha', size: 'large', leadingVisual: visual } }))
    const leading = large.get('[class*="token__leading_"]')
    expect(leading.classes().some(name => name.includes('token__leading--large_'))).toBe(true)
    const medium = track(mount(Token, { props: { text: 'Alpha', leadingVisual: visual } }))
    expect(medium.get('[class*="token__leading_"]').classes().some(name => name.includes('token__leading--large_'))).toBe(false)
  })
})
