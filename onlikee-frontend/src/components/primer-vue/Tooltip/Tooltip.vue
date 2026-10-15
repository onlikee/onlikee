<script setup lang="ts">
import {
  Comment,
  Fragment,
  Text as TextVNode,
  cloneVNode,
  computed,
  h,
  inject,
  isRef,
  provide,
  reactive,
  shallowRef,
  useAttrs,
  useId,
  useSlots,
  watch,
  type ComponentPublicInstance,
  type VNode,
} from 'vue'
import { useTooltipController } from './useTooltip'
import TooltipElement from './TooltipElement.vue'
import { TOOLTIP_CONTEXT_KEY, type TooltipContextValue } from './TooltipContext'
import type { TooltipOptions } from './types'
import { useFeatureFlag } from '../FeatureFlags/context'

// 向唯一的交互子节点注入提示属性和引用，并组合其原有事件处理器。
defineOptions({ name: 'Tooltip', inheritAttrs: false, __SLOT__: Symbol('Tooltip') })
const props = withDefaults(defineProps<TooltipOptions>(), {
  direction: 's',
  type: 'description',
  keybindingHint: () => [],
  delay: 'short',
  _privateDisableTooltip: false,
  id: undefined,
  className: undefined,
})
const attrs = useAttrs()
const slots = useSlots()
const mergedRefEnabled = useFeatureFlag('primer_react_merged_forwarded_refs')

const generatedTooltipId = useId()
const tooltipId = computed(() => props.id || generatedTooltipId)
const parentTooltipContext = inject(TOOLTIP_CONTEXT_KEY, undefined)
const tooltipContextValue = reactive<TooltipContextValue>({})
provide(TOOLTIP_CONTEXT_KEY, tooltipContextValue)

const triggerTarget = shallowRef<Element | ComponentPublicInstance | null>(null)
let childRef: VNode['ref'] = null
const mergeTriggerRefs = computed(() => mergedRefEnabled.value || !props.forwardedRef)
// Vue does not clear removed callback refs when a merged ref array becomes a single ref.
watch(
  mergeTriggerRefs,
  (merge, previous) => {
    if (merge || !previous) return
    for (const ref of Array.isArray(childRef) ? childRef : childRef ? [childRef] : []) {
      const target =
        typeof ref.r === 'string' ? ref.i.refs[ref.r] : isRef(ref.r) ? ref.r.value : null
      if (typeof ref.r === 'function') ref.r(null, ref.i.refs)
      else if (ref.f && Array.isArray(target)) {
        const index = target.indexOf(triggerTarget.value)
        if (index !== -1) target.splice(index, 1)
      } else if (isRef(ref.r)) ref.r.value = null
      else if (typeof ref.r === 'string') {
        const key = ref.r
        ref.i.refs[key] = null
        const proxy = ref.i.proxy as Record<string, unknown> | null
        if (
          proxy &&
          Object.prototype.hasOwnProperty.call(proxy, key) &&
          !Object.getOwnPropertyDescriptor(ref.i.refs, key)?.get
        )
          proxy[key] = null
      }
    }
  },
  { flush: 'sync' },
)
const triggerEl = computed<HTMLElement | null>(() => {
  const node = triggerTarget.value
  if (typeof HTMLElement === 'undefined') return null
  if (node instanceof HTMLElement) return node
  const instance = node as { element?: unknown; $el?: unknown } | null
  const resolved = instance && 'element' in instance ? instance.element : instance?.$el
  return resolved instanceof HTMLElement ? resolved : null
})
defineExpose({ element: triggerEl })
watch(
  [triggerEl, () => props.forwardedRef],
  ([element, forwardedRef], _previous, onCleanup) => {
    if (typeof forwardedRef === 'function') {
      const cleanup = forwardedRef(element)
      onCleanup(() => {
        if (cleanup) cleanup()
        else forwardedRef(null)
      })
    } else if (forwardedRef) {
      forwardedRef.current = element
      onCleanup(() => {
        forwardedRef.current = null
      })
    }
  },
  { flush: 'sync' },
)
const tooltipEl = shallowRef<HTMLElement | null>(null)
const { calculatedDirection, openTooltip, closeTooltip, makeTriggerHandlers } =
  useTooltipController({
    direction: () => props.direction,
    delay: () => props.delay,
    type: () => props.type,
    enabled: () => true,
    triggerTarget,
    _privateDisableTooltip: () => props._privateDisableTooltip,
    triggerRef: triggerEl,
    tooltipRef: tooltipEl,
  })

const keybindingHints = computed(() =>
  Array.isArray(props.keybindingHint) ? props.keybindingHint : [props.keybindingHint],
)
function setTooltipEl(element: Element | ComponentPublicInstance | null) {
  tooltipEl.value = element instanceof HTMLElement ? element : null
}
function setTriggerEl(node: Element | ComponentPublicInstance | null) {
  triggerTarget.value = node
}

const Render = (): VNode | VNode[] => {
  const hasAriaLabel = 'aria-label' in attrs
  const nodes = slots.default?.() ?? []
  if (nodes.length !== 1) {
    tooltipContextValue.tooltipId = parentTooltipContext?.tooltipId
    throw new Error('React.Children.only expected to receive a single React element child.')
  }
  const trigger = nodes[0]!
  if (trigger.type === Fragment) {
    tooltipContextValue.tooltipId = parentTooltipContext?.tooltipId
    if (import.meta.env.DEV) {
      console.warn(
        'The `Tooltip` component does not support a React Fragment as its trigger. Pass a single interactive element instead.',
      )
    }
    return trigger
  }
  if (trigger.type === Comment || trigger.type === TextVNode) {
    tooltipContextValue.tooltipId = parentTooltipContext?.tooltipId
    throw new Error('React.Children.only expected to receive a single React element child.')
  }
  tooltipContextValue.tooltipId = tooltipId.value
  childRef = trigger.ref
  const originalProps = (trigger.props ?? {}) as Record<string, unknown>
  const handler = <T,>(key: string) => {
    const original = originalProps[key] as ((event: T) => void) | ((event: T) => void)[] | undefined
    if (!original) return undefined
    return (event: T) => {
      if (Array.isArray(original)) original.forEach((callback) => callback(event))
      else original(event)
    }
  }
  const injected: Record<string, unknown> = { ref: setTriggerEl }
  if (props.type === 'description') {
    const existing = originalProps['aria-describedby'] as string | undefined
    injected['aria-describedby'] = existing ? `${existing} ${tooltipId.value}` : tooltipId.value
  }
  if (props.type === 'label') {
    injected['aria-labelledby'] = tooltipId.value
  }
  const handlers = makeTriggerHandlers({
    onBlur: handler<FocusEvent>('onBlur'),
    onFocus: handler<FocusEvent>('onFocus'),
    onTouchend: handler<TouchEvent>('onTouchend'),
    onMouseenter: handler<MouseEvent>('onMouseenter'),
    onMouseleave: handler<MouseEvent>('onMouseleave'),
  })
  const cloned = cloneVNode(trigger, injected, mergeTriggerRefs.value)
  // 向唯一的交互子节点注入提示属性和引用，并组合其原有事件处理器。
  cloned.props = { ...cloned.props, ...handlers }
  return [
    cloned,
    h(TooltipElement, {
      ...attrs,
      // React overwrites these two listeners rather than composing them.
      tooltipId: tooltipId.value,
      text: props.text,
      type: props.type,
      keybindingHints: keybindingHints.value,
      hasAriaLabel,
      calculatedDirection: calculatedDirection.value,
      className: props.className,
      setElement: setTooltipEl,
      onMouseenter: openTooltip,
      onMouseleave: closeTooltip,
    }),
  ]
}
</script>
<template><Render /></template>
