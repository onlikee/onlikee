<script setup lang="ts">
import { computed, getCurrentInstance, h, shallowRef, useId, watch, type ComponentPublicInstance, type HTMLAttributes, type Ref } from 'vue'
import type { AnchorPosition, AnchorSide } from '@primer/behaviors'
import Overlay from './Overlay.vue'
import Button from '../../SelectPanel/SelectPanelButton.vue'
import XIcon from '../../../octicons-vue3/icons/x.vue'
import { assignElementRef } from '../assignElementRef'
import { useFocusZone } from '../../composables/useFocusZone'
import type { AnchorRenderProps, AnchoredOverlayProps, OverlayCloseGesture } from './overlayTypes'

defineOptions({ name: 'AnchoredOverlay', inheritAttrs: false })
const props = withDefaults(defineProps<AnchoredOverlayProps>(), {
  renderAnchor: undefined, anchorRef: undefined, align: 'start', width: undefined, height: undefined,
  variant: () => ({ regular: 'anchored', narrow: 'anchored' }),
  displayCloseButton: true,
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

const variantNarrow = computed(() => typeof props.variant === 'object' && props.variant !== null ? props.variant.narrow : undefined)
const hasOnClose = computed(() => Boolean(instance?.vnode.props?.onClose))
const showXIcon = computed(() => hasOnClose.value && variantNarrow.value === 'fullscreen' && props.displayCloseButton)
const closeButtonSpread = computed(() => {
  const { onClick: _consumerOnClick, ...rest } = (props.closeButtonProps ?? {}) as HTMLAttributes
  return rest
})
const closeButtonLabelledBy = computed(() => (props.closeButtonProps?.['aria-labelledby'] as string | undefined) ?? undefined)
const closeButtonLabel = computed(() => closeButtonLabelledBy.value !== undefined
  ? undefined
  : (props.closeButtonProps?.['aria-label'] as string | undefined) ?? 'Close')
const responsiveVariant = computed(() => variantNarrow.value === 'fullscreen' ? 'fullscreen' as const : undefined)

const side = computed(() => props.side ?? ((props.overlayProps?.anchorSide as AnchorSide | undefined) || 'outside-bottom'))
const positionChange = (position: AnchorPosition | undefined) => {
  if (props.onPositionChange && position) props.onPositionChange({ position })
}
const returnFocusRef = computed(() => props.anchorRef?.value ?? anchor.value)
const effectiveIgnoreClickRefs = computed(() => {
  if (props.overlayProps && 'ignoreClickRefs' in props.overlayProps) return (props.overlayProps as Record<string, unknown>).ignoreClickRefs as Ref<HTMLElement | null>[] | undefined
  return [anchor]
})
const effectiveAnchorSide = computed(() => {
  if (props.overlayProps && 'anchorSide' in props.overlayProps) return props.overlayProps.anchorSide
  return overlay.value?.cssAnchor ? undefined : overlay.value?.position?.anchorSide
})
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

const overlayElement = computed(() => overlay.value?.element ?? null)
useFocusZone(() => ({
  containerRef: overlayElement,
  disabled: !props.open || (!overlay.value?.position && !overlay.value?.cssAnchor),
  ...props.focusZoneSettings
}))

function close(event: Event, gesture: OverlayCloseGesture | 'close') {
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
      :class="[$style['anchored-overlay__close-container']]"
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
<style module src="./AnchoredOverlay.module.css"></style>
