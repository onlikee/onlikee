export const isTokenInteractive = ({
  as = 'span',
  onClick,
  onFocus,
  tabIndex = -1,
  disabled,
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

export function unknownAttrValue(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined
  const type = typeof value
  if (type === 'boolean' || type === 'function' || type === 'symbol') return undefined
  return String(value)
}
