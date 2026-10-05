import { onBeforeUnmount, onMounted, shallowRef, watch, type Ref } from 'vue'
import { getAnchoredPosition, type AnchorAlignment, type AnchorSide } from '@primer/behaviors'
import { apply, isSupported } from '@oddbird/popover-polyfill/fn'
import { registerEscapeHandler } from '../internal/documentRegistries'
import type { TooltipDelay, TooltipDirection, TooltipType } from './types'

// Primer React 8c0b708: TooltipV2/Tooltip.tsx 行为层直译（状态机、定位、popover 生命周期、
// Escape 拦截），供公开 Tooltip.vue（cloneVNode 触发器）与 SelectPanelButton.vue
// （触发器即自身按钮元素）复用。
//
// Vue 适配：
// - useOnEscapePress → internal/documentRegistries.registerEscapeHandler（同一注册表语义：
//   单 document keydown 监听、逆序派发、defaultPrevented 即中断 —— tooltip 打开时
//   stopImmediatePropagation + preventDefault 拦截，外层 Overlay 不再收到 Escape，审计 M12）
// - useSafeTimeout → 本地 timeout 集合，卸载时统一清理

// map tooltip direction to anchoredPosition props（React :61-70）
export const directionToPosition: Record<TooltipDirection, { side: AnchorSide; align: AnchorAlignment }> = {
  nw: { side: 'outside-top', align: 'end' },
  n: { side: 'outside-top', align: 'center' },
  ne: { side: 'outside-top', align: 'start' },
  e: { side: 'outside-right', align: 'center' },
  se: { side: 'outside-bottom', align: 'start' },
  s: { side: 'outside-bottom', align: 'center' },
  sw: { side: 'outside-bottom', align: 'end' },
  w: { side: 'outside-left', align: 'center' },
}

// map anchoredPosition props to tooltip direction（React :73-82）
export const positionToDirection: Record<string, TooltipDirection> = {
  'outside-top-end': 'nw',
  'outside-top-center': 'n',
  'outside-top-start': 'ne',
  'outside-right-center': 'e',
  'outside-bottom-start': 'se',
  'outside-bottom-center': 's',
  'outside-bottom-end': 'sw',
  'outside-left-center': 'w',
}

// The list is from GitHub's custom-axe-rules（React :85-92）
const interactiveElements = ['a[href]', 'button:not([disabled])', 'summary', 'select', 'input:not([type=hidden])', 'textarea']

// Map delay prop to actual time in ms（React :96-100）
export const delayTimeMap: Record<TooltipDelay, number> = { short: 50, medium: 400, long: 1200 }

const isInteractive = (element: HTMLElement) =>
  interactiveElements.some(selector => element.matches(selector)) ||
  (element.hasAttribute('role') && element.getAttribute('role') === 'button')

export interface TooltipControllerSettings {
  direction: () => TooltipDirection
  delay: () => TooltipDelay
  type: () => TooltipType
  /** IconButton withoutTooltip 分支为 false（React 此时根本不渲染 Tooltip 子树） */
  enabled: () => boolean
  privateDisableTooltip: () => boolean
  triggerRef: Ref<HTMLElement | null>
  tooltipRef: Ref<HTMLElement | null>
}

export interface TooltipTriggerOriginalHandlers {
  onBlur?: (event: FocusEvent) => void
  onFocus?: (event: FocusEvent) => void
  onTouchend?: (event: TouchEvent) => void
  onMouseenter?: (event: MouseEvent) => void
  onMouseleave?: (event: MouseEvent) => void
}

/** 旧浏览器不支持 :popover-open 选择器时的静默失败（React :184-198/:217-231 同款 catch）。 */
function isPopoverSelectorError(error: unknown) {
  return (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string' &&
    (error as { message: string }).message.includes('not a valid selector')
  )
}

export function useTooltipController(settings: TooltipControllerSettings) {
  // React useState(direction)：初始值只读取一次，direction prop 后续变化不重置
  const calculatedDirection = shallowRef<TooltipDirection>(settings.direction())
  const isPopoverOpen = shallowRef(false)
  let openTimeout: ReturnType<typeof setTimeout> | null = null
  const timeouts = new Set<ReturnType<typeof setTimeout>>()

  function safeSetTimeout(fn: () => void, ms: number) {
    const id = setTimeout(() => {
      timeouts.delete(id)
      fn()
    }, ms)
    timeouts.add(id)
    return id
  }
  function safeClearTimeout(id: ReturnType<typeof setTimeout>) {
    clearTimeout(id)
    timeouts.delete(id)
  }

  function openTooltip() {
    try {
      const tooltip = settings.tooltipRef.value
      const trigger = settings.triggerRef.value
      if (
        tooltip &&
        trigger instanceof HTMLElement &&
        tooltip.hasAttribute('popover') &&
        !tooltip.matches(':popover-open') &&
        !settings.privateDisableTooltip()
      ) {
        tooltip.showPopover()
        isPopoverOpen.value = true
        /*
         * TOOLTIP POSITIONING
         */
        const positionSettings = {
          side: directionToPosition[settings.direction()].side,
          align: directionToPosition[settings.direction()].align,
        }
        const { top, left, anchorAlign, anchorSide } = getAnchoredPosition(tooltip, trigger, positionSettings)
        // This is required to make sure the popover is positioned correctly i.e. when there is
        // not enough space on the specified direction, we set a new direction to position the ::after
        calculatedDirection.value = positionToDirection[`${anchorSide}-${anchorAlign}`]
        tooltip.style.top = `${top}px`
        tooltip.style.left = `${left}px`
      }
    } catch (error) {
      // older browsers don't support the :popover-open selector and will throw, even though we use a polyfill
      if (!isPopoverSelectorError(error)) throw error
    }
  }

  function closeTooltip() {
    if (openTimeout) {
      safeClearTimeout(openTimeout)
      openTimeout = null
    }
    try {
      const tooltip = settings.tooltipRef.value
      if (tooltip && settings.triggerRef.value && tooltip.hasAttribute('popover') && tooltip.matches(':popover-open')) {
        tooltip.hidePopover()
        isPopoverOpen.value = false
      } else {
        isPopoverOpen.value = false
      }
    } catch (error) {
      // older browsers don't support the :popover-open selector and will throw, even though we use a polyfill
      if (!isPopoverSelectorError(error)) throw error
    }
  }

  /**
   * 组合触发器事件处理器（React Tooltip.tsx:333-372 cloneElement 注入的同款顺序：
   * originals 为触发元素上已有的处理器，按 React 的先后次序调用）。
   */
  function makeTriggerHandlers(originals: TooltipTriggerOriginalHandlers = {}) {
    return {
      onBlur: (event: FocusEvent) => {
        closeTooltip()
        originals.onBlur?.(event)
      },
      onTouchend: (event: TouchEvent) => {
        originals.onTouchend?.(event)
        // Hide tooltips on tap to essentially disable them on touch devices;
        // this still allows viewing the tooltip on tap-and-hold
        safeSetTimeout(() => closeTooltip(), 10)
      },
      onFocus: (event: FocusEvent) => {
        // only show tooltip on :focus-visible, not on :focus
        try {
          if (!(event.target instanceof Element) || !event.target.matches(':focus-visible')) return
        } catch {
          // jsdom does not support `:focus-visible` yet and would throw an error
          // https://github.com/jsdom/jsdom/issues/3426
        }
        openTooltip()
        originals.onFocus?.(event)
      },
      onMouseoverCapture: (event: MouseEvent) => {
        const delayTime = delayTimeMap[settings.delay()] || 50
        // We use a `capture` event to ensure this is called first before
        // events that might cancel the opening timeout (like `onTouchEnd`)
        // show tooltip after mouse has been hovering for the specified delay time
        openTimeout = safeSetTimeout(() => {
          // if the mouse is already moved out, do not show the tooltip
          if (!openTimeout) return
          openTooltip()
          originals.onMouseenter?.(event)
        }, delayTime)
      },
      onMouseleave: (event: MouseEvent) => {
        closeTooltip()
        originals.onMouseleave?.(event)
      },
    }
  }

  /** React Tooltip.tsx:237-287 的挂载期 effect（deps: direction/type）。 */
  function runTriggerEffect() {
    if (!settings.tooltipRef.value || !settings.triggerRef.value) return
    const trigger = settings.triggerRef.value
    const isInvalidTrigger = !(trigger instanceof HTMLElement)
    if (isInvalidTrigger) {
      if (import.meta.env.DEV) {
        console.warn(
          'The `Tooltip` component expects its trigger ref to resolve to an HTML element. Ensure the trigger forwards its ref to a single interactive element instead of a React Fragment.',
        )
      }
      return
    }
    /*
     * ACCESSIBILITY CHECKS
     */
    // Has trigger element or any of its children interactive elements?
    const isTriggerInteractive = isInteractive(trigger)
    const triggerChildren = trigger.childNodes
    // two levels deep
    const hasInteractiveDescendant = Array.from(triggerChildren).some(child => {
      return (
        (child instanceof HTMLElement && isInteractive(child)) ||
        Array.from(child.childNodes).some(grandChild => grandChild instanceof HTMLElement && isInteractive(grandChild))
      )
    })
    if (!(isTriggerInteractive || hasInteractiveDescendant)) {
      throw new Error(
        'The `Tooltip` component expects a single React element that contains interactive content. Consider using a `<button>` or equivalent interactive element instead.',
      )
    }
    // If the tooltip is used for labelling the interactive element, the trigger element or any
    // of its children should not have aria-label
    if (settings.type() === 'label') {
      const hasAriaLabel = trigger.hasAttribute('aria-label')
      const hasAriaLabelInChildren = Array.from(trigger.childNodes).some(
        child => child instanceof HTMLElement && child.hasAttribute('aria-label'),
      )
      if (import.meta.env.DEV && (hasAriaLabel || hasAriaLabelInChildren)) {
        console.warn(
          'The label type `Tooltip` is going to be used here to label the trigger element. Please remove the aria-label from the trigger element.',
        )
      }
    }

    // SSR safe polyfill apply
    if (typeof window !== 'undefined') {
      if (!isSupported()) {
        apply()
      }
    }

    settings.tooltipRef.value.setAttribute('popover', 'auto')
  }

  onMounted(() => {
    if (settings.enabled()) runTriggerEffect()
  })
  // React deps [direction, type]；Vue 另含 enabled —— React 中 withoutTooltip 翻转会
  // 挂载/卸载整个 Tooltip 子树（effect 随挂载重跑），Vue 以 enabled 变化等价触发
  watch(() => [settings.direction(), settings.type(), settings.enabled()] as const, () => {
    if (settings.enabled()) runTriggerEffect()
  }, { flush: 'post' })

  // React useOnEscapePress(:289-298)：tooltip 打开时独占 Escape（审计 M12）
  let unregisterEscape: (() => void) | undefined
  onMounted(() => {
    unregisterEscape = registerEscapeHandler(event => {
      if (settings.enabled() && isPopoverOpen.value) {
        event.stopImmediatePropagation()
        event.preventDefault()
        closeTooltip()
      }
    })
  })

  onBeforeUnmount(() => {
    unregisterEscape?.()
    for (const id of timeouts) clearTimeout(id)
    timeouts.clear()
  })

  return { calculatedDirection, isPopoverOpen, openTooltip, closeTooltip, makeTriggerHandlers, safeSetTimeout }
}
