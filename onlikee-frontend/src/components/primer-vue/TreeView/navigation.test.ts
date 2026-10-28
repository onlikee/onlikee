// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getElementState,
  getFirstChildElement,
  getParentElement,
  getVisibleElement,
  getNextFocusableElement,
  getLastElement,
} from './navigation'

function fixture() {
  document.body.innerHTML = `<ul role="tree"><li id="root" role="treeitem" aria-expanded="true"><div></div><ul role="group"><li id="child" role="treeitem"></li><li id="closed" role="treeitem" aria-expanded="false"><ul role="group"><li id="hidden" role="treeitem"></li></ul></li></ul></li><li id="end" role="treeitem"></li></ul>`
  return (id: string) => document.getElementById(id)!
}
afterEach(() => {
  document.body.innerHTML = ''
})
describe('TreeView DOM navigation', () => {
  it('distinguishes open, closed and end nodes and rejects non-treeitems', () => {
    const el = fixture()
    expect(getElementState(el('root'))).toBe('open')
    expect(getElementState(el('closed'))).toBe('closed')
    expect(getElementState(el('end'))).toBe('end')
    expect(() => getElementState(document.body)).toThrow('Element is not a treeitem')
  })
  it('skips descendants of collapsed nodes in both directions and at tree boundaries', () => {
    const el = fixture()
    expect(getVisibleElement(el('closed'), 'next')).toBe(el('end'))
    expect(getVisibleElement(el('end'), 'previous')).toBe(el('closed'))
    expect(getVisibleElement(el('end'), 'next')).toBeUndefined()
    expect(getVisibleElement(el('root'), 'previous')).toBeUndefined()
    expect(getParentElement(el('child'))).toBe(el('root'))
    expect(getFirstChildElement(el('root'))).toBe(el('child'))
    expect(getParentElement(el('root'))).toBeUndefined()
    el('end').remove()
    expect(getLastElement(el('root'))).toBe(el('closed'))
  })
  it.each([
    ['root', 'ArrowRight', 'child'],
    ['root', 'ArrowLeft', undefined],
    ['closed', 'ArrowRight', undefined],
    ['closed', 'ArrowLeft', 'root'],
    ['child', 'ArrowRight', undefined],
    ['child', 'ArrowLeft', 'root'],
    ['child', 'ArrowUp', 'root'],
    ['child', 'ArrowDown', 'closed'],
    ['child', 'Backspace', 'root'],
    ['child', 'Home', 'root'],
    ['root', 'End', 'end'],
  ] as const)('%s + %s returns %s', (id, key, next) => {
    const el = fixture()
    expect(getNextFocusableElement(el(id), new KeyboardEvent('keydown', { key }))).toBe(
      next ? el(next) : undefined,
    )
  })
  it('uses the scroll-container viewport and row height for PageUp and PageDown', () => {
    document.body.innerHTML = `<div id="scroll" style="overflow-y: auto"><ul role="tree">${Array.from({ length: 30 }, (_, i) => `<li role="treeitem" id="item-${i}"><div></div></li>`).join('')}</ul></div>`
    const scroll = document.getElementById('scroll')!
    vi.spyOn(scroll, 'scrollHeight', 'get').mockReturnValue(960)
    vi.spyOn(scroll, 'clientHeight', 'get').mockReturnValue(160)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 0, 100, 32),
    )
    const el = (i: number) => document.getElementById(`item-${i}`)!
    expect(getNextFocusableElement(el(2), new KeyboardEvent('keydown', { key: 'PageDown' }))).toBe(
      el(7),
    )
    expect(getNextFocusableElement(el(7), new KeyboardEvent('keydown', { key: 'PageUp' }))).toBe(
      el(2),
    )
    expect(getNextFocusableElement(el(29), new KeyboardEvent('keydown', { key: 'PageDown' }))).toBe(
      el(29),
    )
  })
})
