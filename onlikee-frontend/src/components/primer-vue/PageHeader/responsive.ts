import type { ResponsiveValue } from './types'

export const hiddenOnRegularAndWide = { narrow: false, regular: true, wide: true }
export const hiddenOnNarrow = { narrow: true, regular: false, wide: false }

export function getResponsiveAttributes<T>(property: string, value?: T | ResponsiveValue<T>) {
  if (value === undefined || value === null) return {}
  if (typeof value !== 'object') return { [`data-${property}`]: value }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [`data-${property}-${key}`, entry]),
  )
}

export function getHiddenDataAttributes(
  value: boolean | ResponsiveValue<boolean>,
  prefix = 'hidden',
) {
  if (
    typeof value !== 'object' ||
    !Object.keys(value).some((key) => ['narrow', 'regular', 'wide'].includes(key))
  ) {
    return { [`data-${prefix}-all`]: value || undefined }
  }
  if (
    'narrow' in value &&
    'regular' in value &&
    'wide' in value &&
    Object.values(value).every((entry) => entry === value.narrow)
  ) {
    return { [`data-${prefix}-all`]: value.narrow || undefined }
  }
  const entries =
    'regular' in value && 'wide' in value && value.regular === value.wide
      ? Object.entries(value).filter(([key]) => key !== 'wide')
      : Object.entries(value)
  return Object.fromEntries(
    entries.map(([key, entry]) => [`data-${prefix}-${key}`, entry || undefined]),
  )
}
