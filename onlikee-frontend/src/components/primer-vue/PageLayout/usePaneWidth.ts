import {
  computed,
  onMounted,
  onBeforeUnmount,
  shallowRef,
  watch,
  toValue,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import cssExports from './PageLayout.module.css'
import type { CustomWidthOptions, PaneWidth, PaneWidthValue } from './types'
export type { CustomWidthOptions, PaneWidth, PaneWidthValue } from './types'

export interface UsePaneWidthOptions {
  width: PaneWidthValue
  minWidth: number
  resizable: boolean
  widthStorageKey?: string
  paneRef: Ref<HTMLDivElement | null>
  handleRef: Ref<HTMLDivElement | null>
  contentWrapperRef?: Ref<HTMLElement | null>
  constrainToViewport?: boolean
  onResizeEnd?: (width: number) => void
  currentWidth?: number
  formatValueText?: (valueNow: number) => string
}
export const DEFAULT_MAX_WIDTH_DIFF = Number(cssExports.paneMaxWidthDiffDefault)
export const DEFAULT_SIDEBAR_MAX_WIDTH_DIFF = Number(cssExports.sidebarMaxWidthDiffDefault)
const WIDE_MAX_WIDTH_DIFF = Number(cssExports.paneMaxWidthDiffWide)
const DEFAULT_PANE_MAX_WIDTH_DIFF_BREAKPOINT = Number(cssExports.paneMaxWidthDiffBreakpoint)
export const SSR_DEFAULT_MAX_WIDTH = 600
export const ARROW_KEY_STEP = 3
export const defaultPaneWidth: Record<PaneWidth, number> = { small: 256, medium: 296, large: 320 }
export const isCustomWidthOptions = (width: PaneWidthValue): width is CustomWidthOptions =>
  typeof width === 'object' && 'min' in width && 'default' in width && 'max' in width
export const isPaneWidth = (width: PaneWidthValue): width is PaneWidth =>
  width === 'small' || width === 'medium' || width === 'large'
export function getDefaultPaneWidth(width: PaneWidthValue): number {
  if (isPaneWidth(width)) return defaultPaneWidth[width]
  if (isCustomWidthOptions(width)) return parseInt(width.default, 10)
  return 0
}
export function getMaxWidthDiffFromViewport(): number {
  if (typeof window === 'undefined') return DEFAULT_MAX_WIDTH_DIFF
  return window.innerWidth >= DEFAULT_PANE_MAX_WIDTH_DIFF_BREAKPOINT
    ? WIDE_MAX_WIDTH_DIFF
    : DEFAULT_MAX_WIDTH_DIFF
}
export const defaultFormatValueText = (valueNow: number) => `Pane width ${valueNow} pixels`
export function updateAriaValues(
  handle: HTMLElement | null,
  values: { current?: number; min?: number; max?: number },
  formatValueText = defaultFormatValueText,
) {
  if (!handle) return
  if (values.min !== undefined) handle.setAttribute('aria-valuemin', String(values.min))
  if (values.max !== undefined) handle.setAttribute('aria-valuemax', String(values.max))
  if (values.current !== undefined) {
    handle.setAttribute('aria-valuenow', String(values.current))
    handle.setAttribute('aria-valuetext', formatValueText(values.current))
  }
}
const localStoragePersister = {
  save(key: string, width: number) {
    try {
      localStorage.setItem(key, width.toString())
    } catch {
      /* Storage may be unavailable. */
    }
  },
  get(key: string): number | null {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        const parsed = Number(stored)
        if (!isNaN(parsed) && parsed > 0) return Math.round(parsed)
      }
    } catch {
      /* Storage may be unavailable. */
    }
    return null
  },
}

/** Read options inside reactive effects so subsequent prop changes follow the source hook. */
export function usePaneWidth(optionsInput: MaybeRefOrGetter<UsePaneWidthOptions>) {
  const getOptions = () => toValue(optionsInput)
  const options = getOptions()
  const defaultWidth = computed(() => getDefaultPaneWidth(getOptions().width))
  const minPaneWidth = computed(() => {
    const { width, minWidth } = getOptions()
    return isCustomWidthOptions(width) ? parseInt(width.min, 10) : minWidth
  })
  const customMaxWidth = computed(() => {
    const { width } = getOptions()
    return isCustomWidthOptions(width) ? parseInt(width.max, 10) : null
  })
  const initialWidth =
    typeof options.currentWidth === 'number'
      ? options.currentWidth
      : options.onResizeEnd === undefined &&
          options.resizable &&
          options.widthStorageKey !== undefined
        ? (localStoragePersister.get(options.widthStorageKey) ?? defaultWidth.value)
        : defaultWidth.value
  const currentWidthState = shallowRef(initialWidth)
  const currentWidth = computed(() => getOptions().currentWidth ?? currentWidthState.value)
  const currentWidthRef = shallowRef(currentWidth.value)
  const maxPaneWidth = shallowRef(customMaxWidth.value ?? SSR_DEFAULT_MAX_WIDTH)
  let maxWidthDiff = options.constrainToViewport
    ? DEFAULT_SIDEBAR_MAX_WIDTH_DIFF
    : DEFAULT_MAX_WIDTH_DIFF

  watch(
    [() => getOptions().currentWidth, defaultWidth],
    ([controlled, nextDefault], [previous]) => {
      if (controlled !== previous) {
        if (typeof controlled === 'number') currentWidthState.value = controlled
        else if (previous !== undefined) currentWidthState.value = nextDefault
      } else if (controlled === undefined) currentWidthState.value = nextDefault
    },
    { flush: 'sync' },
  )
  watch(
    currentWidth,
    (value) => {
      currentWidthRef.value = value
    },
    { flush: 'sync' },
  )

  function getMaxPaneWidth() {
    const viewportWidth = window.innerWidth
    const viewportMax =
      viewportWidth > 0
        ? Math.max(minPaneWidth.value, viewportWidth - maxWidthDiff)
        : minPaneWidth.value
    if (customMaxWidth.value !== null)
      return getOptions().constrainToViewport
        ? Math.min(customMaxWidth.value, viewportMax)
        : customMaxWidth.value
    return viewportMax
  }
  function saveWidth(value: number) {
    const rounded = Math.round(value)
    currentWidthRef.value = rounded
    currentWidthState.value = rounded
    const { onResizeEnd, resizable, widthStorageKey } = getOptions()
    if (onResizeEnd) {
      try {
        onResizeEnd(rounded)
      } catch {
        /* Match the source callback error boundary. */
      }
      return
    }
    if (resizable && widthStorageKey) localStoragePersister.save(widthStorageKey, rounded)
  }
  const mounted = shallowRef(false)
  onMounted(() => {
    mounted.value = true
  })
  const stop = watch(
    [
      mounted,
      () => getOptions().resizable,
      customMaxWidth,
      minPaneWidth,
      () => getOptions().constrainToViewport,
    ],
    (_next, _previous, onCleanup) => {
      const { resizable, paneRef, handleRef, contentWrapperRef, constrainToViewport } = getOptions()
      const customMax = customMaxWidth.value
      const minimum = minPaneWidth.value
      if (!mounted.value || !resizable) return
      let lastViewportWidth = window.innerWidth
      function syncAll() {
        const viewportWidth = window.innerWidth
        if (
          lastViewportWidth < DEFAULT_PANE_MAX_WIDTH_DIFF_BREAKPOINT !==
          viewportWidth < DEFAULT_PANE_MAX_WIDTH_DIFF_BREAKPOINT
        )
          maxWidthDiff = getMaxWidthDiffFromViewport()
        lastViewportWidth = viewportWidth
        const actualMax = getMaxPaneWidth()
        paneRef.value?.style.setProperty('--pane-max-width', `${actualMax}px`)
        const wasClamped = currentWidthRef.value > actualMax
        if (wasClamped) {
          currentWidthRef.value = actualMax
          paneRef.value?.style.setProperty('--pane-width', `${actualMax}px`)
        }
        updateAriaValues(
          handleRef.value,
          { max: actualMax, current: currentWidthRef.value },
          getOptions().formatValueText,
        )
        if (actualMax !== maxPaneWidth.value || wasClamped) {
          maxPaneWidth.value = actualMax
          if (wasClamped) currentWidthState.value = actualMax
        }
      }
      maxWidthDiff = getMaxWidthDiffFromViewport()
      const initialMax = getMaxPaneWidth()
      paneRef.value?.style.setProperty('--pane-max-width', `${initialMax}px`)
      updateAriaValues(
        handleRef.value,
        { min: minimum, max: initialMax, current: currentWidthRef.value },
        getOptions().formatValueText,
      )
      maxPaneWidth.value = initialMax
      if (customMax !== null && !constrainToViewport) return
      let lastUpdateTime = 0
      let pendingUpdate = false
      let rafId: number | null = null
      let debounceId: ReturnType<typeof setTimeout> | null = null
      let isResizing = false
      function endResizeOptimizations() {
        if (!isResizing) return
        isResizing = false
        paneRef.value?.removeAttribute('data-dragging')
        contentWrapperRef?.value?.removeAttribute('data-dragging')
      }
      function handleResize() {
        if (!isResizing) {
          isResizing = true
          paneRef.value?.setAttribute('data-dragging', 'true')
          contentWrapperRef?.value?.setAttribute('data-dragging', 'true')
        }
        const now = Date.now()
        if (now - lastUpdateTime >= 16) {
          lastUpdateTime = now
          syncAll()
        } else if (!pendingUpdate) {
          pendingUpdate = true
          rafId = requestAnimationFrame(() => {
            pendingUpdate = false
            rafId = null
            lastUpdateTime = Date.now()
            syncAll()
          })
        }
        if (debounceId !== null) clearTimeout(debounceId)
        debounceId = setTimeout(() => {
          debounceId = null
          endResizeOptimizations()
        }, 150)
      }
      window.addEventListener('resize', handleResize)
      onCleanup(() => {
        if (rafId !== null) cancelAnimationFrame(rafId)
        if (debounceId !== null) clearTimeout(debounceId)
        endResizeOptimizations()
        window.removeEventListener('resize', handleResize)
      })
    },
    { flush: 'sync', immediate: true },
  )
  onBeforeUnmount(stop)
  return {
    currentWidth,
    currentWidthRef,
    minPaneWidth,
    maxPaneWidth,
    getMaxPaneWidth,
    saveWidth,
    getDefaultWidth: () => getDefaultPaneWidth(getOptions().width),
  }
}
