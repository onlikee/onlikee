<script setup lang="ts">
import {
  Comment,
  Fragment,
  Text as TextVNode,
  cloneVNode,
  computed,
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

const tooltipId = props.id ?? useId()
const tooltipContextValue = reactive<TooltipContextValue>({ tooltipId })
provide(TOOLTIP_CONTEXT_KEY, tooltipContextValue)

const triggerEl = shallowRef<HTMLElement | null>(null)
const tooltipEl = shallowRef<HTMLElement | null>(null)
const { calculatedDirection, openTooltip, closeTooltip, makeTriggerHandlers } = useTooltipController({
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
const hasAriaLabel = computed(() => 'aria-label' in attrs)
function setTooltipEl(element: Element | ComponentPublicInstance | null) {
  tooltipEl.value = element instanceof HTMLElement ? element : null
}
function setTriggerEl(node: Element | ComponentPublicInstance | null) {
  if (node instanceof HTMLElement) {
    triggerEl.value = node
    return
  }
  const instance = node as { element?: unknown; $el?: unknown } | null
  const resolved = instance?.element instanceof HTMLElement ? instance.element : instance?.$el
  triggerEl.value = resolved instanceof HTMLElement ? resolved : null
}

const RenderTrigger = (): VNode | VNode[] => {
  const nodes = slots.default?.() ?? []
  const candidates = nodes.filter(node => node.type !== Comment)
  const trigger = candidates[0]
  if (candidates.length !== 1 || !trigger || trigger.type === Fragment || trigger.type === TextVNode) {
    if (import.meta.env.DEV) {
      console.warn(
        'The `Tooltip` component expects a single interactive element as its trigger. Pass a single element instead of a fragment or multiple nodes.',
      )
    }
    return nodes
  }
  const originalProps = (trigger.props ?? {}) as Record<string, unknown>
  const handler = <T>(key: string) => originalProps[key] as unknown as ((event: T) => void) | undefined
  const injected: Record<string, unknown> = { ref: setTriggerEl }
  if (props.type === 'description') {
    const existing = originalProps['aria-describedby'] as string | undefined
    injected['aria-describedby'] = existing ? `${existing} ${tooltipId}` : tooltipId
  }
  if (props.type === 'label') {
    const existing = originalProps['aria-labelledby'] as string | undefined
    injected['aria-labelledby'] = existing ? `${existing} ${tooltipId}` : tooltipId
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
  return cloned
}
</script>
<template>
  <RenderTrigger />
  <TooltipElement
    v-bind="attrs"
    :tooltip-id="tooltipId"
    :text="text"
    :type="type"
    :keybinding-hints="keybindingHints"
    :has-aria-label="hasAriaLabel"
    :calculated-direction="calculatedDirection"
    :class-name="className"
    :set-element="setTooltipEl"
    @mouseenter="openTooltip"
    @mouseleave="closeTooltip"
  />
</template>
