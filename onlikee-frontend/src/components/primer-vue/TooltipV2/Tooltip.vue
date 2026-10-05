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

// Primer React 8c0b708: TooltipV2/Tooltip.tsx 直译（公开组件）。
// Vue 适配：React cloneElement 注入触发器 props → cloneVNode + 手动组合触发元素上已有的
// 事件处理器（保持 React 的调用顺序）；children 为默认插槽（应为单个可交互元素）。
defineOptions({ name: 'Tooltip', inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    direction?: TooltipDirection
    text: string
    type?: TooltipType
    keybindingHint?: string | string[]
    delay?: TooltipDelay
    /** React `_privateDisableTooltip`（Vue prop 名不允许下划线前缀，语义一致） */
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

// React: tooltipId = useId(id)（用户 id 作种子）
const tooltipId = props.id ?? useId()
// React TooltipContext.Provider value={{tooltipId}}（useMemo）
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

// Normalize keybindingHint to an array for uniform rendering（React :304）
const keybindingHints = computed(() =>
  Array.isArray(props.keybindingHint) ? props.keybindingHint : [props.keybindingHint],
)
const hasAriaLabel = computed(() => 'aria-label' in attrs)
function setTooltipEl(element: Element | ComponentPublicInstance | null) {
  tooltipEl.value = element instanceof HTMLElement ? element : null
}
/**
 * 触发器函数 ref：元素 vnode 直接得到 HTMLElement；组件 vnode（如 SelectPanelButton，
 * 对应 React 中 forwardRef 的 ButtonBase）得到组件实例 —— 依次经 defineExpose({ element })
 * 或单根组件的 $el 解析出根元素，保证 runTriggerEffect/openTooltip 拿到真实 DOM。
 */
function setTriggerEl(node: Element | ComponentPublicInstance | null) {
  if (node instanceof HTMLElement) {
    triggerEl.value = node
    return
  }
  const instance = node as { element?: unknown; $el?: unknown } | null
  const resolved = instance?.element instanceof HTMLElement ? instance.element : instance?.$el
  triggerEl.value = resolved instanceof HTMLElement ? resolved : null
}

/** React :308-373：cloneElement 注入 ref/aria/事件到唯一子元素。 */
const RenderTrigger = (): VNode | VNode[] => {
  const nodes = slots.default?.() ?? []
  const candidates = nodes.filter(node => node.type !== Comment)
  const trigger = candidates[0]
  if (candidates.length !== 1 || !trigger || trigger.type === Fragment || trigger.type === TextVNode) {
    // React Children.only 对多子元素抛错、对 Fragment 警告并原样渲染；Vue 适配为开发期警告
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
    // If tooltip is a description type, append our tooltipId（React :316-330）
    const existing = originalProps['aria-describedby'] as string | undefined
    injected['aria-describedby'] = existing ? `${existing} ${tooltipId}` : tooltipId
  }
  if (props.type === 'label') {
    // React :332 直接以 tooltipId 覆盖；Vue 适配为「已有值 + tooltipId」组合 ——
    // SelectPanelButton 的 loading 组合语义（`${uuid}-label tooltipId`）依赖该顺序（审计 L11/M13）
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
  // 事件用覆盖而非 cloneVNode 默认的合并（合并会以「原有→注入」顺序调用，与 React 相反）
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
