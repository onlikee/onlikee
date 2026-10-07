// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import IssueLabelToken from './IssueLabelToken.vue'

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

describe('IssueLabelToken 自定义属性与数据属性', () => {
  test('fillColor 默认 #999 → color2k 解析为 r/g/b=153、h=0、s=0、l=60 的 --label-* 内联变量', () => {
    const wrapper = track(mount(IssueLabelToken, { props: { text: 'bug' } }))
    const root = wrapper.get<HTMLElement>('[class*="issue-label_"]')
    expect(root.element.style.getPropertyValue('--label-r')).toBe('153')
    expect(root.element.style.getPropertyValue('--label-g')).toBe('153')
    expect(root.element.style.getPropertyValue('--label-b')).toBe('153')
    expect(root.element.style.getPropertyValue('--label-h')).toBe('0')
    expect(root.element.style.getPropertyValue('--label-s')).toBe('0')
    expect(root.element.style.getPropertyValue('--label-l')).toBe('60')
  })

  test('fillColor=#ff0000 → 红通道解析（h=0、s=100、l=50）', () => {
    const wrapper = track(mount(IssueLabelToken, { props: { text: 'bug', fillColor: '#ff0000' } }))
    const style = wrapper.get<HTMLElement>('[class*="issue-label_"]').element.style
    expect(style.getPropertyValue('--label-r')).toBe('255')
    expect(style.getPropertyValue('--label-g')).toBe('0')
    expect(style.getPropertyValue('--label-b')).toBe('0')
    expect(style.getPropertyValue('--label-h')).toBe('0')
    expect(style.getPropertyValue('--label-s')).toBe('100')
    expect(style.getPropertyValue('--label-l')).toBe('50')
  })

  test('消费者 style 整体覆盖 customProperties', () => {
    const wrapper = track(mount(IssueLabelToken, {
      props: { text: 'bug' },
      attrs: { style: { color: 'rgb(1, 2, 3)' } }
    }))
    const style = wrapper.get<HTMLElement>('[class*="issue-label_"]').element.style
    expect(style.getPropertyValue('--label-r')).toBe('')
    expect(style.color).toBe('rgb(1, 2, 3)')
  })

  test('data-selected：默认省略，显式 true/false 渲染字符串；不输出 data-is-selected', () => {
    const omitted = track(mount(IssueLabelToken, { props: { text: 'bug' } }))
    expect(omitted.get('[class*="issue-label_"]').attributes('data-selected')).toBeUndefined()
    expect(omitted.get('[class*="issue-label_"]').attributes('data-is-selected')).toBeUndefined()
    const selected = track(mount(IssueLabelToken, { props: { text: 'bug', isSelected: true } }))
    expect(selected.get('[class*="issue-label_"]').attributes('data-selected')).toBe('true')
    const unselected = track(mount(IssueLabelToken, { props: { text: 'bug', isSelected: false } }))
    expect(unselected.get('[class*="issue-label_"]').attributes('data-selected')).toBe('false')
  })

  test('data-has-remove-button：无 onRemove 为 "false"，有 onRemove 为 "true"；hideRemoveButton 压回 "false"', () => {
    const without = track(mount(IssueLabelToken, { props: { text: 'bug' } }))
    expect(without.get('[class*="issue-label_"]').attributes('data-has-remove-button')).toBe('false')
    const withRemove = track(mount(IssueLabelToken, { props: { text: 'bug' }, attrs: { onRemove: () => {} } }))
    expect(withRemove.get('[class*="issue-label_"]').attributes('data-has-remove-button')).toBe('true')
    const hidden = track(mount(IssueLabelToken, { props: { text: 'bug', hideRemoveButton: true }, attrs: { onRemove: () => {} } }))
    expect(hidden.get('[class*="issue-label_"]').attributes('data-has-remove-button')).toBe('false')
    expect(hidden.find('[class*="token__remove_"]').exists()).toBe(false)
  })
})

describe('IssueLabelToken 移除按钮与文本容器', () => {
  test('移除按钮挂 issue-label__remove 类、data-has-multiple-action-targets、transform(1px,-1px)', async () => {
    // 非交互根（span、无 tabindex/onClick）→ isParentInteractive=false → button 分支
    const wrapper = track(mount(IssueLabelToken, { props: { text: 'bug' }, attrs: { onRemove: () => {} } }))
    const remove = wrapper.get('[class*="token__remove_"]')
    expect(remove.element.tagName).toBe('BUTTON')
    expect(remove.classes().some(name => name.includes('issue-label__remove_'))).toBe(true)
    expect(remove.attributes('data-has-multiple-action-targets')).toBe('false')
    expect(remove.attributes('aria-hidden')).toBe('false')
    expect(remove.attributes('aria-label')).toBe('Remove token')
    expect(remove.attributes('style')).toContain('transform: translate(1px, -1px)')
    await remove.trigger('click')
    expect(wrapper.emitted('remove')).toHaveLength(1)
  })

  test('可交互根（as=button）→ 根降为 span、按钮 aria-hidden="true"、文本容器承接 as/href', () => {
    const wrapper = track(mount(IssueLabelToken, {
      props: { text: 'bug', as: 'button', href: '/labels/bug' },
      attrs: { onRemove: () => {} }
    }))
    const root = wrapper.get('[class*="issue-label_"]')
    expect(root.element.tagName).toBe('SPAN')
    expect(root.attributes('href')).toBeUndefined()
    const remove = wrapper.get('[class*="token__remove_"]')
    expect(remove.element.tagName).toBe('SPAN')
    expect(remove.attributes('tabindex')).toBe('-1')
    expect(remove.attributes('aria-hidden')).toBe('true')
    expect(remove.attributes('data-has-multiple-action-targets')).toBe('true')
    const text = wrapper.get('[class*="token__text_"]')
    expect(text.element.tagName).toBe('BUTTON')
    expect(text.attributes('href')).toBe('/labels/bug')
  })

  test('不渲染 VisuallyHidden 移除快捷键说明', () => {
    const wrapper = track(mount(IssueLabelToken, { props: { text: 'bug' }, attrs: { onRemove: () => {} } }))
    expect(wrapper.find('.internal-visually-hidden').exists()).toBe(false)
  })

  test('text 泄漏为 DOM 属性（TokenBase rest 怪癖与 Token 共享）', () => {
    const wrapper = track(mount(IssueLabelToken, { props: { text: 'bug' } }))
    expect(wrapper.get('[class*="issue-label_"]').attributes('text')).toBe('bug')
  })

  test('Backspace/Delete 触发 remove（TokenBase 包装器，无 disabled 守卫）', async () => {
    const wrapper = track(mount(IssueLabelToken, { props: { text: 'bug', disabled: true }, attrs: { onRemove: () => {} } }))
    await wrapper.get('[class*="issue-label_"]').trigger('keydown', { key: 'Backspace' })
    await wrapper.get('[class*="issue-label_"]').trigger('keydown', { key: 'Delete' })
    expect(wrapper.emitted('remove')).toHaveLength(2)
    expect(wrapper.get('[class*="issue-label_"]').attributes('disabled')).toBe('')
  })
})
