import type { ResponsiveValue } from './types'

export function isResponsiveValue<T>(value: T | ResponsiveValue<T>): value is ResponsiveValue<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.keys(value).some((key) => ['narrow', 'regular', 'wide'].includes(key))
  )
}
export function getResponsiveAttributes<T>(property: string, value?: T | ResponsiveValue<T>) {
  if (value === undefined || value === null) return {}
  if (typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [`data-${property}-${key}`, entry]),
    )
  return { [`data-${property}`]: value }
}
