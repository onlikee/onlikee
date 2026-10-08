import type { StackResponsive } from './types'

export function getResponsiveAttributes<T extends string | boolean>(
  property: string,
  value?: StackResponsive<T>,
): Record<string, T> {
  if (value === undefined) return {}
  if (typeof value !== 'object') return { [`data-${property}`]: value }
  const attributes: Record<string, T> = {}
  for (const breakpoint of ['narrow', 'regular', 'wide'] as const) {
    const entry = value[breakpoint]
    if (entry !== undefined) attributes[`data-${property}-${breakpoint}`] = entry
  }
  return attributes
}
