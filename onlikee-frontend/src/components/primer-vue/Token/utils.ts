/* Primer React 8c0b708 Token/utils.ts 直译 + React 未知属性序列化胶水。 */

/**
 * 源 isTokenInteractive 的直译（含 tabIndex 默认 -1、disabled 短路、
 * onFocus || onClick || tabIndex > -1 || a/button 的判定顺序）。
 * 调用方负责把 attrs.tabindex（可能为字符串）先经 Number() 归一——
 * 与 React 的比较语义在字符串/NaN 边界上等价（'0' > -1 与 Number('0') > -1 同真；
 * NaN > -1 与 'abc' > -1 同假）。
 */
export const isTokenInteractive = ({
  as = 'span',
  onClick,
  onFocus,
  tabIndex = -1,
  disabled
}: {
  as?: 'button' | 'a' | 'span' | undefined
  onClick?: unknown
  onFocus?: unknown
  tabIndex?: number
  disabled?: boolean
}): boolean => {
  if (disabled) {
    return false
  }
  return Boolean(onFocus || onClick || tabIndex > -1 || ['a', 'button'].includes(as))
}

/**
 * React DOM 对未知属性（如 TokenBase rest 中泄漏的 text）的序列化规则：
 * - string 原样、number → String(n)、其他对象 → String(value)（"[object Object]"）；
 * - boolean/function/symbol/null/undefined → 省略属性。
 * Vue 的 setAttribute 对 false 会渲染 "false"，故此处统一归一为 string | undefined
 * （审计 G1-2：text 属性泄漏怪癖的忠实复刻）。
 */
export function unknownAttrValue(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined
  const type = typeof value
  if (type === 'boolean' || type === 'function' || type === 'symbol') return undefined
  return String(value)
}
