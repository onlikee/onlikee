import { onMounted, shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { getAnchoredPosition, type AnchorPosition, type PositionSettings } from '@primer/behaviors'

export interface AnchoredPositionHookSettings extends Partial<PositionSettings> {
  floatingElementRef?: Ref<HTMLElement | null>
  anchorElementRef?: Ref<HTMLElement | null>
  pinPosition?: boolean
  onPositionChange?: (position: AnchorPosition | undefined) => void
  enabled?: boolean
}

function getScrollableAncestors(element: Element): Array<Element | Window> {
  const scrollables: Array<Element | Window> = []
  let current = element.parentElement
  while (current) {
    const style = getComputedStyle(current)
    const overflowY = style.overflowY
    const overflowX = style.overflowX
    if (/auto|scroll|overlay/.test(overflowY) || /auto|scroll|overlay/.test(overflowX)) {
      scrollables.push(current)
    }
    current = current.parentElement
  }
  scrollables.push(window)
  return scrollables
}

export function useAnchoredPosition(settings: MaybeRefOrGetter<AnchoredPositionHookSettings> = {}) {
  const first = toValue(settings)
  const floatingElementRef = first.floatingElementRef ?? shallowRef<HTMLElement | null>(null)
  const anchorElementRef = first.anchorElementRef ?? shallowRef<HTMLElement | null>(null)
  const position = shallowRef<AnchorPosition>()
  let prevHeight: number | undefined
  let scrollAncestorsCache: { anchor: Element | null; scrollables: Array<Element | Window> } = {
    anchor: null,
    scrollables: [],
  }

  function resolve() {
    const current = toValue(settings)
    const floating = current.floatingElementRef?.value ?? floatingElementRef.value
    const anchorEl = current.anchorElementRef?.value ?? anchorElementRef.value
    return { current, floating, anchorEl }
  }

  function topPositionChanged(
    prevPosition: AnchorPosition | undefined,
    newPosition: AnchorPosition,
  ): boolean {
    return (
      !!prevPosition &&
      ['outside-top', 'inside-top'].includes(prevPosition.anchorSide) &&
      // either the anchor changed or the element is trying to shrink in height
      (prevPosition.anchorSide !== newPosition.anchorSide || prevPosition.top < newPosition.top)
    )
  }

  function updateElementHeight(floating: HTMLElement): boolean {
    if (prevHeight && prevHeight > (floating.clientHeight ?? 0)) {
      const restoreHeight = prevHeight
      requestAnimationFrame(() => {
        floating.style.height = `${restoreHeight}px`
      })
      return true
    }
    return false
  }

  function updatePosition() {
    const { current, floating, anchorEl } = resolve()
    if (current.enabled === false) return
    if (floating instanceof Element && anchorEl instanceof Element) {
      const newPosition = getAnchoredPosition(floating, anchorEl, current)
      let keepPrevious = false
      if (current.pinPosition && topPositionChanged(position.value, newPosition)) {
        const anchorTop = anchorEl.getBoundingClientRect().top
        const elementStillFitsOnTop = anchorTop > floating.clientHeight
        if (elementStillFitsOnTop && updateElementHeight(floating)) keepPrevious = true
      }
      if (!keepPrevious) {
        if (position.value && position.value.anchorSide === newPosition.anchorSide) {
          current.onPositionChange?.(newPosition)
        }
        position.value = newPosition
      }
    } else {
      position.value = undefined
      current.onPositionChange?.(undefined)
    }
    prevHeight = floating instanceof Element ? floating.clientHeight : undefined
  }

  onMounted(() => {
    const { floating, anchorEl } = resolve()
    if (!(floating instanceof Element && anchorEl instanceof Element)) updatePosition()
  })

  watch(
    () => {
      const { current, floating, anchorEl } = resolve()
      return { enabled: current.enabled !== false, floating, anchorEl }
    },
    ({ enabled, floating, anchorEl }, _previous, onCleanup) => {
      if (!enabled || typeof window === 'undefined') return
      if (floating instanceof Element && anchorEl instanceof Element) updatePosition()

      let frame = 0
      const schedule = () => {
        if (frame === 0) {
          frame = requestAnimationFrame(() => {
            frame = 0
            updatePosition()
          })
        }
      }

      const observers: ResizeObserver[] = []
      const fallbackListeners: Array<() => void> = []
      if (typeof ResizeObserver === 'function') {
        const rootObserver = new ResizeObserver(() => updatePosition())
        rootObserver.observe(document.documentElement)
        observers.push(rootObserver)
        if (floating instanceof Element) {
          const floatingObserver = new ResizeObserver(() => updatePosition())
          floatingObserver.observe(floating)
          observers.push(floatingObserver)
        }
      } else {
        const addFallback = (targetEl: Element) => {
          let cached: DOMRect | null = null
          const listener = () => {
            const rect = targetEl.getBoundingClientRect()
            if (rect.width !== cached?.width || rect.height !== cached?.height) updatePosition()
            cached = rect
          }
          window.addEventListener('resize', listener)
          fallbackListeners.push(listener)
        }
        addFallback(document.documentElement)
        if (floating instanceof Element) addFallback(floating)
      }

      // Match the source cache: a mounted anchor keeps a stable parent chain.
      if (anchorEl !== scrollAncestorsCache.anchor) {
        scrollAncestorsCache = {
          anchor: anchorEl,
          scrollables: anchorEl instanceof Element ? getScrollableAncestors(anchorEl) : [],
        }
      }
      const scrollables = scrollAncestorsCache.scrollables
      for (const scrollable of scrollables) {
        scrollable.addEventListener('scroll', schedule)
      }

      onCleanup(() => {
        for (const scrollable of scrollables) {
          scrollable.removeEventListener('scroll', schedule)
        }
        for (const observer of observers) observer.disconnect()
        for (const listener of fallbackListeners) window.removeEventListener('resize', listener)
        if (frame !== 0) {
          cancelAnimationFrame(frame)
          frame = 0
        }
      })
    },
    { flush: 'post', immediate: true },
  )

  return { floatingElementRef, anchorElementRef, position, updatePosition }
}
