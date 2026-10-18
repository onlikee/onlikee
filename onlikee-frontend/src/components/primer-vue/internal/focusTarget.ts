import type { ComponentPublicInstance } from 'vue'

/** Native focus targets and Vue components that expose their actual DOM element. */
export type FocusTarget =
  HTMLElement | { readonly element: Element | null | undefined } | ComponentPublicInstance

export function resolveFocusTarget(target: unknown): HTMLElement | null {
  if (typeof HTMLElement === 'undefined') return null
  if (target instanceof HTMLElement) return target
  const element = (target as { element?: unknown } | null | undefined)?.element
  // Do not fall back to $el: a component's root may be a Fragment placeholder or
  // a wrapper around the intended button/input/link.
  return element instanceof HTMLElement ? element : null
}
