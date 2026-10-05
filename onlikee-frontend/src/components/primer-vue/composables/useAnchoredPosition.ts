import { onMounted, shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { getAnchoredPosition, type AnchorPosition, type PositionSettings } from '@primer/behaviors'

// 移植自 React hooks/useAnchoredPosition.ts（8c0b708fc43a），逐项对齐：
// - updatePosition：refs 缺失 → position=undefined 且 onPositionChange(undefined)；
// - pinPosition：topPositionChanged && elementStillFitsOnTop && updateElementHeight() → 保留旧 position，
//   高度恢复放在 requestAnimationFrame 中（React :71-84,107-111，审计 L3）；
// - onPositionChange 怪癖：仅当 prev && prev.anchorSide === next.anchorSide 时回调（React :103，审计 L2）；
// - prevHeight 在每次 updatePosition 末尾无条件更新（React :112）；
// - 监听器集合与 React 相同：RO(documentElement) + RO(floating)，滚动 = getScrollableAncestors(anchor)+window，
//   非 passive，rAF 节流（React :122-198，审计 L4：不再有 visualViewport / anchor RO / window resize）。
// 已知有意偏离：React useCallback 依赖不含 settings（side/align 运行中变更会用旧闭包），Vue 每次调用取
// 最新 settings——仅在"挂载后动态改 side/align"的场景与源不同（源为缺陷行为），SelectPanel 不受影响。

export interface AnchoredPositionHookSettings extends Partial<PositionSettings> {
  floatingElementRef?: Ref<HTMLElement | null>
  anchorElementRef?: Ref<HTMLElement | null>
  pinPosition?: boolean
  onPositionChange?: (position: AnchorPosition | undefined) => void
  enabled?: boolean
}

/**
 * Returns all scrollable ancestor elements of the given element, plus the window.
 * An element is scrollable if its computed overflow-x or overflow-y is
 * 'auto', 'scroll', or 'overlay'.
 *（React useAnchoredPosition.ts:13-27 verbatim 语义）
 */
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

  function resolve() {
    const current = toValue(settings)
    const floating = current.floatingElementRef?.value ?? floatingElementRef.value
    const anchorEl = current.anchorElementRef?.value ?? anchorElementRef.value
    return { current, floating, anchorEl }
  }

  // React :62-69
  function topPositionChanged(prevPosition: AnchorPosition | undefined, newPosition: AnchorPosition): boolean {
    return !!prevPosition &&
      ['outside-top', 'inside-top'].includes(prevPosition.anchorSide) &&
      // either the anchor changed or the element is trying to shrink in height
      (prevPosition.anchorSide !== newPosition.anchorSide || prevPosition.top < newPosition.top)
  }

  // React :71-84 —— 元素试图变矮时，先在 rAF 中恢复旧高度防止跳动
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

  // React :86-115
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
      // React :91-107 的 setState updater：pin 命中先 return prev——其后的
      // onPositionChange 怪癖回调被跳过（审计偏差 4；旧注释把 React 行为描述反了）。
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

  // React :135-140 的一次性 passive effect：在挂载 commit 后运行——refs 通常已就绪
  // （:128-133 layout effect 已跑 attached 更新并置 hasMountedRef）→ 短路跳过；
  // 仅 refs 未就绪时走 detached 分支（position=undefined + onPositionChange(undefined)，
  // 审计偏差 5：不再在 setup 期提前消耗这次更新）。
  onMounted(() => {
    const { floating, anchorEl } = resolve()
    if (!(floating instanceof Element && anchorEl instanceof Element)) updatePosition()
  })

  watch(() => {
    const { current, floating, anchorEl } = resolve()
    return { enabled: current.enabled !== false, floating, anchorEl }
  }, ({ enabled, floating, anchorEl }, _previous, onCleanup) => {
    if (!enabled || typeof window === 'undefined') return
    // React :143-149 layout effect：refs 就绪立即（绘制前）算一次
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

    // React :122-124：RO(window→documentElement) + RO(floating)，回调直接 updatePosition
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
      // React useResizeObserver.ts:44-63 无 RO 降级：root(documentElement) 与 floating
      // 各挂一个 window resize 监听，宽高比较变化才同步回调（缓存初始 null → 首次必触发）。
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

    // React :169-198：anchor 的可滚动祖先 + window，scroll 事件 rAF 节流
    const scrollables = anchorEl instanceof Element ? getScrollableAncestors(anchorEl) : []
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
  }, { flush: 'post', immediate: true })

  return { floatingElementRef, anchorElementRef, position, updatePosition }
}
