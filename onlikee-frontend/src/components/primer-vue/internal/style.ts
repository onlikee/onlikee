import type { CSSProperties, StyleValue } from 'vue'

// React DOM 18.3.1's unitless properties (isUnitlessNumber), including their supported
// vendor prefixes. 注意：不含 scale——React 19 才加入，18.3.1 对 {scale: 2} 输出 '2px'
// （非法值被丢弃；composables 审计偏差 7）。
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
  // react-dom dangerousStyleValue：boolean → ''（清空该属性）；Vue 直接 setProperty(String(v))
  // 会留下非法的 "true"/"false" 字符串使旧值残留（composables 审计偏差 7 子项）。
  if (typeof value === 'boolean') return ''
  const camelProperty = property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()).replace(/^Ms/, 'ms')
  if (typeof value === 'number' && value !== 0 && !property.startsWith('--') && !unitless.has(camelProperty)) return `${value}px`
  return value
}

/** Preserve Vue style strings/arrays while matching React's numeric CSS units. */
export function normalizeReactStyle(value: unknown): StyleValue {
  if (typeof value === 'string' || value === false || value === null || value === undefined) return value
  if (Array.isArray(value)) return value.map(normalizeReactStyle)
  if (typeof value !== 'object') return undefined
  return Object.fromEntries(Object.entries(value).map(([property, item]) => [property, normalizePropertyValue(property, item)])) as CSSProperties
}
