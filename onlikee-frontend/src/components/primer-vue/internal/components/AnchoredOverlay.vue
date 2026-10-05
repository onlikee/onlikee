<script setup lang="ts">
import { computed, getCurrentInstance, h, shallowRef, useId, watch, type ComponentPublicInstance, type HTMLAttributes, type Ref } from 'vue'
import type { AnchorPosition, AnchorSide } from '@primer/behaviors'
import Overlay from './Overlay.vue'
import Button from '../../SelectPanel/SelectPanelButton.vue'
import XIcon from '../../../octicons-vue3/icons/x.vue'
import { assignElementRef } from '../assignElementRef'
import { useFocusZone } from '../../composables/useFocusZone'
import type { AnchorRenderProps, AnchoredOverlayProps, OverlayCloseGesture } from './overlayTypes'

// 移植自 React AnchoredOverlay/AnchoredOverlay.tsx（8c0b708fc43a）。
// Vue 架构说明：React 在本组件内自持 useAnchoredPosition/useFocusTrap/useFocusZone；本端口将定位与
// trap 下沉到 Overlay.vue（统一浮层原语），本组件通过 Overlay 暴露的 position/visibility/cssAnchor
// 还原 React 的门控语义；focus zone 保留在本层（与 React :285-289 一致）。
defineOptions({ name: 'AnchoredOverlay', inheritAttrs: false })
const props = withDefaults(defineProps<AnchoredOverlayProps>(), {
  renderAnchor: undefined, anchorRef: undefined, align: 'start', width: undefined, height: undefined,
  // React :146-149 defaultVariant —— 对象形式；字符串 variant 属 legacy API（.narrow 不存在 → 永不全屏，审计 M4）
  variant: () => ({ regular: 'anchored', narrow: 'anchored' }),
  displayCloseButton: true, // React :180 默认 true（审计 M5）
  displayInViewport: false, pinPosition: false, preventOverflow: true
})
const emit = defineEmits<{
  'update:open': [open: boolean]
  open: [gesture: 'anchor-click' | 'anchor-key-press', event: MouseEvent | KeyboardEvent]
  close: [gesture: OverlayCloseGesture | 'close' | 'anchor-click', event: Event]
}>()
const instance = getCurrentInstance()
const generatedId = useId()
const anchor = shallowRef<HTMLElement | null>(null)
interface OverlayExposed { element: HTMLElement | null; position?: AnchorPosition; visibility?: string; cssAnchor?: boolean }
const overlay = shallowRef<ComponentPublicInstance<OverlayExposed> | null>(null)
function setAnchor(value: unknown) {
  const exposed = value as { element?: HTMLElement; $el?: HTMLElement } | null
  anchor.value = value instanceof HTMLElement ? value : exposed?.element ?? exposed?.$el ?? null
  assignElementRef(props.anchorRef, anchor.value)
}
watch(() => props.anchorRef, (next, previous) => {
  if (props.renderAnchor === null) return
  assignElementRef(previous, null)
  assignElementRef(next, anchor.value)
}, { flush: 'post' })
function requestOpen(event: MouseEvent | KeyboardEvent, gesture: 'anchor-click' | 'anchor-key-press') {
  if (event.defaultPrevented || (event instanceof MouseEvent && event.button !== 0)) return
  if (props.open) { emit('close', 'anchor-click', event); emit('update:open', false) }
  else { emit('open', gesture, event); emit('update:open', true) }
}
const anchorProps = computed<AnchorRenderProps>(() => ({
  ref: setAnchor, id: props.anchorId ?? `${generatedId}-anchor`, 'aria-haspopup': 'true', 'aria-expanded': props.open,
  tabindex: 0,
  onClick: (event: MouseEvent) => requestOpen(event, 'anchor-click'),
  onKeydown: (event: KeyboardEvent) => {
    if (!props.open && !event.defaultPrevented && ['ArrowDown', 'ArrowUp', ' ', 'Enter'].includes(event.key)) {
      emit('open', 'anchor-key-press', event); emit('update:open', true); event.preventDefault()
    }
  }
}))
const RenderAnchor = () => props.renderAnchor?.(anchorProps.value) ?? (props.renderAnchor === null ? null : h('button', { type: 'button', ...anchorProps.value }, 'Open'))

// React :400 showXIcon = onClose && variant.narrow === 'fullscreen' && displayCloseButton。
// 响应式全屏完全交给 CSS 媒体查询（data-responsive 标记），不再有 JS matchMedia（审计 M4）；
// onClose 存在性 = 消费者是否绑定 @close（审计 M5 三重条件）。
const variantNarrow = computed(() => typeof props.variant === 'object' && props.variant !== null ? props.variant.narrow : undefined)
const hasOnClose = computed(() => Boolean(instance?.vnode.props?.onClose))
const showXIcon = computed(() => hasOnClose.value && variantNarrow.value === 'fullscreen' && props.displayCloseButton)
// React :401-402,458-466 —— closeButtonProps 先展开、固定属性后覆盖（固定属性赢，审计 M5）；
// aria-labelledby 优先，否则 aria-label 回退 'Close'（审计 L17）
const closeButtonSpread = computed(() => {
  // React 中固定 onClick 在 spread 之后覆盖消费者传入的同名处理器；Vue 的 v-bind+@click 会合并调用，
  // 故剔除 onClick 保持"固定处理器赢"语义
  const { onClick: _consumerOnClick, ...rest } = (props.closeButtonProps ?? {}) as HTMLAttributes
  return rest
})
const closeButtonLabelledBy = computed(() => (props.closeButtonProps?.['aria-labelledby'] as string | undefined) ?? undefined)
const closeButtonLabel = computed(() => closeButtonLabelledBy.value !== undefined
  ? undefined
  : (props.closeButtonProps?.['aria-label'] as string | undefined) ?? 'Close')
const responsiveVariant = computed(() => variantNarrow.value === 'fullscreen' ? 'fullscreen' as const : undefined)

// React :170 side 默认 = overlayProps.anchorSide || 'outside-bottom'
const side = computed(() => props.side ?? ((props.overlayProps?.anchorSide as AnchorSide | undefined) || 'outside-bottom'))
// React :248-252 —— 仅 position 真值时以 {position} 包装回调
const positionChange = (position: AnchorPosition | undefined) => {
  if (props.onPositionChange && position) props.onPositionChange({ position })
}
// React :422 returnFocusRef={anchorRef}（Ref 对象；Overlay 清理时 toValue 取最新）
const returnFocusRef = computed(() => props.anchorRef?.value ?? anchor.value)
// React :424 ignoreClickRefs={[anchorRef]}（内部 ref）位于 {...restOverlayProps} 之前 ——
// overlayProps.ignoreClickRefs 存在时整体替换（消费者可取消锚点豁免，源怪癖，审计 G5-8）
const effectiveIgnoreClickRefs = computed(() => {
  if (props.overlayProps && 'ignoreClickRefs' in props.overlayProps) return (props.overlayProps as Record<string, unknown>).ignoreClickRefs as Ref<HTMLElement | null>[] | undefined
  return [anchor]
})
// React :433 anchorSide={cssAnchor ? undefined : position?.anchorSide}，随后 {...restOverlayProps} 可整体覆盖
// （SelectPanel modal 显式 anchorSide:undefined → 无滑入动画，审计 M8 关联）
const effectiveAnchorSide = computed(() => {
  if (props.overlayProps && 'anchorSide' in props.overlayProps) return props.overlayProps.anchorSide
  return overlay.value?.cssAnchor ? undefined : overlay.value?.position?.anchorSide
})
// React :422,432,435,439 —— returnFocusRef/preventOverflow/responsiveVariant/data-component 均在
// {...restOverlayProps} 之前，overlayProps 同名键可覆盖（in 判断镜像 spread 覆盖语义，审计 G5-7/6）
const effectiveReturnFocusRef = computed((): HTMLElement | Ref<HTMLElement | null> | null | undefined => {
  if (props.overlayProps && 'returnFocusRef' in props.overlayProps) return (props.overlayProps as Record<string, unknown>).returnFocusRef as HTMLElement | Ref<HTMLElement | null> | null | undefined
  return returnFocusRef.value
})
const effectivePreventOverflow = computed(() => {
  if (props.overlayProps && 'preventOverflow' in props.overlayProps) return (props.overlayProps as Record<string, unknown>).preventOverflow as boolean | undefined
  return props.preventOverflow
})
const effectiveResponsiveVariant = computed(() => {
  if (props.overlayProps && 'responsiveVariant' in props.overlayProps) return (props.overlayProps as Record<string, unknown>).responsiveVariant as 'fullscreen' | undefined
  return responsiveVariant.value
})
const effectiveDataComponent = computed(() => {
  if (props.overlayProps && 'data-component' in props.overlayProps) return (props.overlayProps as Record<string, unknown>)['data-component'] as string | undefined
  return 'AnchoredOverlay'
})

// React :285-289 useFocusZone({containerRef, disabled: !open || (!position && !cssAnchor), ...focusZoneSettings})
const overlayElement = computed(() => overlay.value?.element ?? null)
useFocusZone(() => ({
  containerRef: overlayElement,
  disabled: !props.open || (!overlay.value?.position && !overlay.value?.cssAnchor),
  ...props.focusZoneSettings
}))

function close(event: Event, gesture: OverlayCloseGesture | 'close') {
  // React :423-425 + :439 —— overlayProps.onEscape/onClickOutside 在 spread 中覆盖 AnchoredOverlay 的
  // 内部处理器，此时 onClose 链不再触发（React 源怪癖的等价实现）
  if (gesture === 'escape' && props.overlayProps?.onEscape || gesture === 'click-outside' && props.overlayProps?.onClickOutside) return
  emit('close', gesture, event); emit('update:open', false)
}
defineExpose({ anchor, element: computed(() => overlay.value?.element ?? null), position: computed(() => overlay.value?.position ?? undefined) })
</script>
<template>
  <RenderAnchor v-if="renderAnchor !== undefined" />
  <slot
    v-else
    name="anchor"
    :anchor-props="anchorProps"
  >
    <RenderAnchor />
  </slot>
  <Overlay
    v-bind="overlayProps"
    ref="overlay"
    :open="open"
    :anchor="anchorRef ? anchorRef.value : anchor"
    :align="align"
    :side="side"
    :anchor-offset="anchorOffset"
    :alignment-offset="alignmentOffset"
    :width="overlayProps?.width ?? width"
    :height="overlayProps?.height ?? height"
    :anchor-side="effectiveAnchorSide"
    :display-in-viewport="displayInViewport"
    :pin-position="pinPosition"
    :prevent-overflow="effectivePreventOverflow"
    :responsive-variant="effectiveResponsiveVariant"
    :return-focus-ref="effectiveReturnFocusRef"
    :ignore-click-refs="effectiveIgnoreClickRefs"
    :trap-focus="true"
    :focus-trap-settings="focusTrapSettings"
    :on-position-change="positionChange"
    :class="className"
    :css-anchor-positioning-settings="cssAnchorPositioningSettings"
    :data-component="effectiveDataComponent"
    @close="close"
  >
    <div
      v-if="showXIcon"
      class="anchored-overlay__close-container"
    >
      <Button
        v-bind="closeButtonSpread"
        data-component="AnchoredOverlay.CloseButton"
        type="button"
        variant="invisible"
        :icon="XIcon"
        :aria-label="closeButtonLabel"
        :aria-labelledby="closeButtonLabelledBy"
        class="anchored-overlay__close"
        @click="close($event, 'close')"
      />
    </div>
    <slot />
  </Overlay>
</template>
<style scoped>
/* React AnchoredOverlay.module.css:1-14（ResponsiveCloseButtonContainer/ResponsiveCloseButton） */
.anchored-overlay__close-container { position: relative; }
.anchored-overlay__close-container :deep(.anchored-overlay__close) { position: absolute; top: var(--base-size-8, 8px); right: var(--base-size-8, 8px); display: none; }
@media screen and (max-width: calc(768px - 0.02px)) { .anchored-overlay__close-container :deep(.anchored-overlay__close) { display: inline-grid; } }
</style>
