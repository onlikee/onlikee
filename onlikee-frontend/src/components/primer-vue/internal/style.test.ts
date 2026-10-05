import { describe, expect, it } from 'vitest'
import { normalizeReactStyle } from './style'

describe('React-compatible Vue styles', () => {
  it('adds pixel units to numeric lengths while preserving unitless CSS and custom variables', () => {
    // react-dom 18.3.1 的 isUnitlessNumber 不含 'scale'（React 19 才加入），故 dangerousStyleValue
    // (react-dom.development.js:2637) 对数字 scale 追加 'px'。此处 pin 18.3.1 源行为：scale:2 → '2px'。
    expect(normalizeReactStyle({ width: 200, marginTop: -8, fontSize: 16, minHeight: 0, lineHeight: 1.5, fontWeight: 600, flex: 1, opacity: 0.5, zIndex: 10, scale: 2, '--spacing': 8, '--zero': 0, widthText: '75%' })).toEqual({ width: '200px', marginTop: '-8px', fontSize: '16px', minHeight: 0, lineHeight: 1.5, fontWeight: 600, flex: 1, opacity: 0.5, zIndex: 10, scale: '2px', '--spacing': 8, '--zero': 0, widthText: '75%' })
  })
  it('renders boolean style values as empty string per react-dom dangerousStyleValue', () => {
    // react-dom.development.js:2631-2634 isEmpty（boolean）→ ''；Vue 若直接 setProperty(String(true))
    // 会留下非法的 "true"/"false" 字符串使旧值残留（composables 审计偏差 7 子项）。
    expect(normalizeReactStyle({ color: true, background: false })).toEqual({ color: '', background: '' })
  })
  it('preserves vendor-prefixed and hyphenated unitless properties', () => {
    expect(normalizeReactStyle({ WebkitLineClamp: 2, msFlex: 1, MozBoxFlex: 1, OAnimationIterationCount: 2, '-webkit-line-clamp': 3, '-ms-flex': 2, 'line-height': 1.2, 'font-size': 12, WebkitMarginBefore: 8 })).toEqual({ WebkitLineClamp: 2, msFlex: 1, MozBoxFlex: 1, OAnimationIterationCount: 2, '-webkit-line-clamp': 3, '-ms-flex': 2, 'line-height': 1.2, 'font-size': '12px', WebkitMarginBefore: '8px' })
  })
  it('retains nested Vue style arrays and strings without mutating caller objects', () => {
    const first = { height: 40, opacity: 0.8 }
    const value = [first, null, false, 'color:red;', [{ height: 80 }]]
    expect(normalizeReactStyle(value)).toEqual([{ height: '40px', opacity: 0.8 }, null, false, 'color:red;', [{ height: '80px' }]])
    expect(first).toEqual({ height: 40, opacity: 0.8 })
    expect(normalizeReactStyle(undefined)).toBeUndefined()
    expect(normalizeReactStyle(null)).toBeNull()
  })
})
