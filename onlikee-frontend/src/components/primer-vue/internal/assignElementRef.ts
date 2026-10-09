import type { Ref } from 'vue'
/** DOM-ref output is deliberately writable; component configuration remains immutable. */
export function assignElementRef<T extends Element>(
  target: Ref<T | null> | ((element: T | null) => void) | undefined,
  element: T | null,
) {
  if (typeof target === 'function') target(element)
  else if (target) target.value = element
}
