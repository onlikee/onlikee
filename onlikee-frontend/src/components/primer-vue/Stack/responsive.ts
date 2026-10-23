import type { StackResponsive } from './types'

export function getResponsiveAttributes<T extends string | boolean>(
  property: string,
  value?: StackResponsive<T>,
): Record<string, T> {
  if (value === undefined || value === null) return {}
  if (typeof value !== 'object') return { [`data-${property}`]: value }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [`data-${property}-${key}`, entry]),
  )
}
