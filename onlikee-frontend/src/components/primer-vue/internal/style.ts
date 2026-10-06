import type { CSSProperties, StyleValue } from 'vue'

// 无需单位的 CSS 属性及其厂商前缀；其他数字值按像素处理。
const unitlessProperties = [
  'animationIterationCount', 'aspectRatio', 'borderImageOutset', 'borderImageSlice', 'borderImageWidth',
  'boxFlex', 'boxFlexGroup', 'boxOrdinalGroup', 'columnCount', 'columns', 'flex', 'flexGrow',
  'flexPositive', 'flexShrink', 'flexNegative', 'flexOrder', 'gridArea', 'gridRow', 'gridRowEnd',
  'gridRowSpan', 'gridRowStart', 'gridColumn', 'gridColumnEnd', 'gridColumnSpan', 'gridColumnStart',
  'fontWeight', 'lineClamp', 'lineHeight', 'opacity', 'order', 'orphans', 'tabSize', 'widows',
  'zIndex', 'zoom', 'fillOpacity', 'floodOpacity', 'stopOpacity', 'strokeDasharray',
  'strokeDashoffset', 'strokeMiterlimit', 'strokeOpacity', 'strokeWidth',
]
const unitless = new Set(unitlessProperties.flatMap(property => [property, ...['Webkit', 'ms', 'Moz', 'O'].map(prefix => `${prefix}${property[0]?.toUpperCase()}${property.slice(1)}`)]))

function normalizePropertyValue(property: string, value: unknown): unknown {
  if (Array.isArray(value)) return value.map(item => normalizePropertyValue(property, item))
  // 布尔样式值用于清空属性，避免无效字符串使旧值残留。
  if (typeof value === 'boolean') return ''
  const camelProperty = property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()).replace(/^Ms/, 'ms')
  if (typeof value === 'number' && value !== 0 && !property.startsWith('--') && !unitless.has(camelProperty)) return `${value}px`
  return value
}

export function normalizeReactStyle(value: unknown): StyleValue {
  if (typeof value === 'string' || value === false || value === null || value === undefined) return value
  if (Array.isArray(value)) return value.map(normalizeReactStyle)
  if (typeof value !== 'object') return undefined
  return Object.fromEntries(Object.entries(value).map(([property, item]) => [property, normalizePropertyValue(property, item)])) as CSSProperties
}
