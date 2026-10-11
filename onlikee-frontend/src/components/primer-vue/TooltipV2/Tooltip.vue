<script setup lang="ts">
import {
  Comment,
  Fragment,
  Text as TextVNode,
  cloneVNode,
  computed,
  h,
  inject,
  provide,
  reactive,
  shallowRef,
  useAttrs,
  useId,
  useSlots,
  type ComponentPublicInstance,
  type VNode,
} from 'vue'
import { useTooltipController } from './useTooltip'
import TooltipElement from './TooltipElement.vue'
import { TOOLTIP_CONTEXT_KEY, type TooltipContextValue } from './TooltipContext'
import type { TooltipDelay, TooltipDirection, TooltipType } from './types'

// 向唯一的交互子节点注入提示属性和引用，并组合其原有事件处理器。
defineOptions({ name: 'Tooltip', inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    direction?: TooltipDirection
    text: string
    type?: TooltipType
    keybindingHint?: string | string[]
    delay?: TooltipDelay
    privateDisableTooltip?: boolean
    id?: string
    className?: string
  }>(),
  {
    direction: 's',
    type: 'description',
    keybindingHint: () => [],
    delay: 'short',
    privateDisableTooltip: false,
    id: undefined,
    className: undefined,
  },
)
const attrs = useAttrs()
const slots = useSlots()

const generatedTooltipId = useId()
const tooltipId = computed(() => props.id || generatedTooltipId)
const parentTooltipContext = inject(TOOLTIP_CONTEXT_KEY, undefined)
const tooltipContextValue = reactive<TooltipContextValue>({})
provide(TOOLTIP_CONTEXT_KEY, tooltipContextValue)

const triggerTarget = shallowRef<Element | ComponentPublicInstance | null>(null)
const triggerEl = computed<HTMLElement | null>(() => {
  const node = triggerTarget.value
  if (node instanceof HTMLElement) return node
  const instance = node as { element?: unknown; $el?: unknown } | null
  const resolved = instance?.element instanceof HTMLElement ? instance.element : instance?.$el
  return resolved instanceof HTMLElement ? resolved : null
})
const tooltipEl = shallowRef<HTMLElement | null>(null)
const { calculatedDirection, openTooltip, closeTooltip, makeTriggerHandlers } =
  useTooltipController({
    direction: () => props.direction,
    delay: () => props.delay,
    type: () => props.type,
    enabled: () => true,
    privateDisableTooltip: () => props.privateDisableTooltip,
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
  const originalProps = (trigger.props ?? {}) as Record<string, unknown>
  const handler = <T,>(key: string) =>
    originalProps[key] as unknown as ((event: T) => void) | undefined
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
  const cloned = cloneVNode(trigger, injected, true)
  // 向唯一的交互子节点注入提示属性和引用，并组合其原有事件处理器。
  cloned.props = { ...cloned.props, ...handlers }
  return [
    cloned,
    h(TooltipElement, {
      ...attrs,
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
