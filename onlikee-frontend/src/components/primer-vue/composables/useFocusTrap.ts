import { nextTick, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { focusTrap } from '@primer/behaviors'
import type { FocusTrapSettings } from '../internal/components/overlayTypes'
import { registerOutsideClickHandler } from '../internal/documentRegistries'

export function useFocusTrap(settings: MaybeRefOrGetter<FocusTrapSettings> = {}) {
  const first = toValue(settings)
  const containerRef = first.containerRef ?? shallowRef<HTMLElement | null>(null)
  const initialFocusRef = first.initialFocusRef ?? shallowRef<HTMLElement | null>(null)
  let controller: AbortController | undefined
  let previousFocusedElement: Element | null = null
  let outsideClicked = false
  const container = () => (toValue(settings).containerRef ?? containerRef).value
  function disableTrap() {
    controller?.abort()
    const current = toValue(settings)
    if (current.allowOutsideClick && outsideClicked) return
    const returnTo = current.returnFocusRef?.value
    if (returnTo instanceof HTMLElement) returnTo.focus()
    else if (current.restoreFocusOnCleanUp && previousFocusedElement instanceof HTMLElement) {
      previousFocusedElement.focus()
      previousFocusedElement = null
    }
  }
  watch(
    [
      container,
      () => toValue(settings).disabled,
      () => toValue(settings).initialFocusRef,
      () => toValue(settings).containerRef,
    ],
    async ([element, disabled], _previous, onCleanup) => {
      if (!(element instanceof HTMLElement)) return
      if (disabled) {
        disableTrap()
        return
      }
      if (!previousFocusedElement) previousFocusedElement = document.activeElement
      let cancelled = false
      onCleanup(() => {
        cancelled = true
        disableTrap()
      })
      // Overlay establishes initial focus after the positioning commit.
      // Activate the independent trap only after that focus effect has run.
      await nextTick()
      await nextTick()
      if (cancelled) return
      controller = focusTrap(
        element,
        (toValue(settings).initialFocusRef ?? initialFocusRef).value ?? undefined,
      )
    },
    { flush: 'sync', immediate: true },
  )
  watch(
    container,
    async (element, _previous, onCleanup) => {
      if (!element) return
      let cancelled = false
      onCleanup(() => {
        cancelled = true
      })
      await nextTick()
      if (cancelled) return
      const unregister = registerOutsideClickHandler((event) => {
        if (event.button > 0 || element.contains(event.target as Node)) return true
        outsideClicked = true
        if (toValue(settings).allowOutsideClick) controller?.abort()
        return undefined
      })
      onCleanup(() => {
        cancelled = true
        unregister()
      })
    },
    { flush: 'post', immediate: true },
  )
  return { containerRef, initialFocusRef }
}
