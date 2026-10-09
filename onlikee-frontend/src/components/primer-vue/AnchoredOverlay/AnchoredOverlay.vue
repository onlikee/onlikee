<script setup lang="ts">
import { computed, shallowRef, useAttrs, useId, watch, useCssModule, toRaw, type VNode } from 'vue'
import type { AnchorPosition } from '@primer/behaviors'
import Overlay from '../internal/components/Overlay.vue'
import Button from '../SelectPanel/SelectPanelButton.vue'
import XIcon from '../../octicons-vue3/icons/x.vue'
import { assignElementRef } from '../internal/assignElementRef'
import { useAnchoredPosition } from '../composables/useAnchoredPosition'
import { useFocusTrap } from '../composables/useFocusTrap'
import { useFocusZone, type FocusZoneHookSettings } from '../composables/useFocusZone'
import { useFeatureFlag } from '../FeatureFlags'
import type {
  AnchorRenderProps,
  AnchoredOverlayComponentProps,
  AnchoredOverlayCloseGesture,
  AnchoredOverlayOpenGesture,
} from './types'

defineOptions({ name: 'AnchoredOverlay', inheritAttrs: false })
const {
  displayCloseButton = true,
  preventOverflow = true,
  ...props
} = defineProps<AnchoredOverlayComponentProps>()
const emit = defineEmits<{
  open: [gesture: AnchoredOverlayOpenGesture, event?: KeyboardEvent]
  close: [gesture: AnchoredOverlayCloseGesture]
}>()
defineSlots<{
  default?: () => VNode[]
}>()
const attrs = useAttrs()
const styles = useCssModule()
const generatedId = useId()
const popoverId = `${useId()}-overlay`
const anchor = shallowRef<HTMLElement | null>(null)
const overlay = shallowRef<{
  element: HTMLElement | null
  position?: AnchorPosition
  cssAnchor?: boolean
} | null>(null)
const cssAnchorFlag = useFeatureFlag('primer_react_css_anchor_positioning')
const supportsCssAnchorPositioning =
  typeof document !== 'undefined' &&
  'anchorName' in document.documentElement.style &&
  'positionTryFallbacks' in document.documentElement.style &&
  'positionVisibility' in document.documentElement.style
const cssAnchor = computed(
  () =>
    cssAnchorFlag.value &&
    supportsCssAnchorPositioning &&
    !props.overlayProps?.portalContainerName &&
    !props.cssAnchorPositioningSettings?.disable,
)
const usePopover = computed(() => cssAnchor.value && props.renderAs === 'popover')
const anchorElement = computed(() => props.anchorRef?.value ?? anchor.value)
const anchorName = `--anchored-overlay-anchor-${popoverId.replace(/[^a-zA-Z0-9_-]/g, '_')}`
watch(
  [anchorElement, cssAnchor],
  ([element, enabled], _previous, onCleanup) => {
    if (!element || !enabled || element.style.getPropertyValue('anchor-name')) return
    element.style.setProperty('anchor-name', anchorName)
    onCleanup(() => {
      if (element.style.getPropertyValue('anchor-name') === anchorName)
        element.style.removeProperty('anchor-name')
    })
  },
  { flush: 'post', immediate: true },
)

function setAnchor(value: unknown) {
  const exposed = value as { element?: HTMLElement; $el?: HTMLElement } | null
  anchor.value = value instanceof HTMLElement ? value : (exposed?.element ?? exposed?.$el ?? null)
  assignElementRef(props.anchorRef, anchor.value)
}
watch(
  () => props.anchorRef,
  (next, previous) => {
    if (props.renderAnchor === null) return
    assignElementRef(previous, null)
    assignElementRef(next, anchor.value)
  },
  { flush: 'post' },
)
function requestOpen(event: MouseEvent | KeyboardEvent, gesture: AnchoredOverlayOpenGesture) {
  if (event.defaultPrevented || (event instanceof MouseEvent && event.button !== 0)) return
  if (cssAnchor.value && event instanceof MouseEvent) event.preventDefault()
  if (props.open) {
    emit('close', 'anchor-click')
  } else {
    emit('open', gesture)
  }
}
const anchorProps = computed<AnchorRenderProps>(() => ({
  ref: setAnchor,
  id: props.anchorId ?? `${generatedId}-anchor`,
  'aria-haspopup': 'true',
  'aria-expanded': props.open,
  tabindex: 0,
  popovertarget: usePopover.value ? popoverId : undefined,
  onClick: (event: MouseEvent) => requestOpen(event, 'anchor-click'),
  onKeydown: (event: KeyboardEvent) => {
    if (
      !props.open &&
      !event.defaultPrevented &&
      ['ArrowDown', 'ArrowUp', ' ', 'Enter'].includes(event.key)
    ) {
      emit('open', 'anchor-key-press', event)
      event.preventDefault()
    }
  },
}))
const RenderAnchor = () => props.renderAnchor?.(anchorProps.value) ?? null
const narrowVariant = computed(() =>
  typeof props.variant === 'object' ? props.variant.narrow : undefined,
)
const showCloseButton = computed(
  () => Boolean(props.onClose) && narrowVariant.value === 'fullscreen' && displayCloseButton,
)
const closeButtonBindings = computed(() => {
  const { onClick: _onClick, className, ...rest } = props.closeButtonProps ?? {}
  const labelledBy = rest['aria-labelledby']
  return {
    ...rest,
    className,
    'aria-labelledby': labelledBy || undefined,
    'aria-label': labelledBy ? undefined : (rest['aria-label'] ?? 'Close'),
  }
})
const side = computed(() => props.side ?? (props.overlayProps?.anchorSide || 'outside-bottom'))
const overlayElement = computed(() => overlay.value?.element ?? null)
watch(
  [overlayElement, () => props.overlayProps?.ref],
  ([element, forwardedRef], _previous, onCleanup) => {
    assignElementRef(forwardedRef ?? undefined, element)
    onCleanup(() => assignElementRef(forwardedRef ?? undefined, null))
  },
  { flush: 'post' },
)
function positionChange(position: AnchorPosition | undefined) {
  if (position) props.onPositionChange?.({ position })
}
const { position } = useAnchoredPosition(() => ({
  anchorElementRef: anchorElement,
  floatingElementRef: overlayElement,
  pinPosition: props.pinPosition,
  side: side.value,
  align: props.align ?? 'start',
  alignmentOffset: props.alignmentOffset,
  anchorOffset: props.anchorOffset,
  displayInViewport: props.displayInViewport,
  onPositionChange: positionChange,
  enabled: props.open && !cssAnchor.value,
}))
watch(
  [
    cssAnchor,
    usePopover,
    () => props.open,
    anchorElement,
    overlayElement,
    () => props.width,
    side,
    () => props.cssAnchorPositioningSettings?.fallbackStrategy,
  ],
  (_values, _previous, onCleanup) => {
    const currentAnchor = anchorElement.value
    const currentOverlay = overlayElement.value
    if (!cssAnchor.value || !currentAnchor) return
    let frame: number | undefined
    if (props.open && currentOverlay) {
      currentOverlay.style.setProperty(
        'position-anchor',
        currentAnchor.style.getPropertyValue('anchor-name') || anchorName,
      )
      const strategy = props.cssAnchorPositioningSettings?.fallbackStrategy ?? 'default'
      const fallback =
        strategy === 'none'
          ? 'none'
          : strategy === 'opposite-side'
            ? side.value.endsWith('top') || side.value.endsWith('bottom')
              ? 'flip-block'
              : side.value.endsWith('left') || side.value.endsWith('right')
                ? 'flip-inline'
                : undefined
            : undefined
      if (fallback) currentOverlay.style.setProperty('position-try-fallbacks', fallback)
      else currentOverlay.style.removeProperty('position-try-fallbacks')
      frame = requestAnimationFrame(() => {
        const anchorRect = currentAnchor.getBoundingClientRect()
        const overlayRect = currentOverlay.getBoundingClientRect()
        const widths = {
          auto: 'auto',
          small: '256px',
          medium: '320px',
          large: '480px',
          xlarge: '640px',
          xxlarge: '960px',
        }
        const fallbackWidth = parseInt(widths[props.width ?? 'small'])
        const width = overlayRect.width || fallbackWidth
        const spaceLeft = anchorRect.left
        const spaceRight = window.innerWidth - anchorRect.right
        const horizontal = spaceLeft > spaceRight ? 'left' : 'right'
        currentOverlay.setAttribute('data-align', horizontal)
        if (
          (overlayRect.right > window.innerWidth || overlayRect.left < 0) &&
          (overlayRect.bottom > window.innerHeight || overlayRect.top < 0)
        ) {
          currentOverlay.setAttribute(
            'data-side',
            spaceLeft >= width + 8
              ? 'outside-left'
              : spaceRight >= width + 8
                ? 'outside-right'
                : 'outside-bottom',
          )
        }
        const constrained = spaceLeft < width + 8 && spaceRight < width + 8
        const offset = constrained
          ? Math.max(
              0,
              horizontal === 'left'
                ? width - anchorRect.right + 8
                : anchorRect.left + width - window.innerWidth + 8,
            )
          : 0
        currentOverlay.style.setProperty(
          `--anchored-overlay-anchor-offset-${horizontal}`,
          `${offset || 0}px`,
        )
        const settled = currentOverlay.getBoundingClientRect()
        const overflowBottom = settled.bottom - window.innerHeight
        if (overflowBottom > 0)
          currentOverlay.style.setProperty(
            '--anchored-overlay-top-override',
            `${Math.max(0, settled.top - overflowBottom - 8)}px`,
          )
        else currentOverlay.style.removeProperty('--anchored-overlay-top-override')
      })
      if (usePopover.value) {
        try {
          if (!currentOverlay.matches(':popover-open')) currentOverlay.showPopover()
        } catch {
          // Match the reference when the popover is already showing or unsupported.
        }
      }
    }
    onCleanup(() => {
      if (frame !== undefined) cancelAnimationFrame(frame)
      currentOverlay?.style.removeProperty('position-anchor')
      currentOverlay?.style.removeProperty('position-try-fallbacks')
    })
  },
  { flush: 'post' },
)
const overlayBindings = computed(() => {
  const { ref: _ref, className, class: overlayClass, ...rest } = props.overlayProps ?? {}
  return {
    open: props.open,
    width: props.width,
    height: props.height,
    preventOverflow,
    responsiveVariant: narrowVariant.value === 'fullscreen' ? ('fullscreen' as const) : undefined,
    returnFocusRef: props.anchorRef ?? anchor,
    ignoreClickRefs: [props.anchorRef ?? anchor],
    role: 'none',
    visibility: cssAnchor.value || position.value ? ('visible' as const) : ('hidden' as const),
    top: cssAnchor.value ? undefined : position.value?.top || 0,
    left: cssAnchor.value ? undefined : position.value?.left || 0,
    anchorSide: cssAnchor.value ? undefined : position.value?.anchorSide,
    'data-component': 'AnchoredOverlay',
    ...(usePopover.value ? { popover: 'manual' } : {}),
    ...rest,
    class: [
      props.className,
      className,
      attrs.class,
      overlayClass,
      cssAnchor.value ? styles.anchoredOverlay : undefined,
    ],
    ...(usePopover.value ? { id: popoverId } : {}),
    'data-anchor-position': cssAnchor.value ? 'true' : 'false',
    'data-side': cssAnchor.value ? side.value : position.value?.anchorSide,
  }
})
const focusZoneOptions = shallowRef<FocusZoneHookSettings>({ containerRef: overlayElement })
const focusZoneDisabled = computed(
  () => props.focusZoneSettings?.disabled ?? (!props.open || (!position.value && !cssAnchor.value)),
)
watch(
  [overlayElement, focusZoneDisabled],
  () => {
    focusZoneOptions.value = {
      containerRef: overlayElement,
      disabled: focusZoneDisabled.value,
      ...toRaw(props.focusZoneSettings ?? {}),
    }
  },
  { flush: 'post', immediate: true },
)
useFocusZone(focusZoneOptions)
useFocusTrap(() => ({
  containerRef: overlayElement,
  disabled: !props.open || (!position.value && !cssAnchor.value),
  ...toRaw(props.focusTrapSettings ?? {}),
}))
function close(_event: Event, gesture: AnchoredOverlayCloseGesture) {
  if (
    (gesture === 'escape' && props.overlayProps?.onEscape) ||
    (gesture === 'click-outside' && props.overlayProps?.onClickOutside)
  )
    return
  emit('close', gesture)
}
defineExpose({ anchor, element: overlayElement, position })
</script>

<template>
  <RenderAnchor v-if="renderAnchor" />
  <Overlay v-if="open" v-bind="overlayBindings" ref="overlay" @close="close">
    <div v-if="showCloseButton" :class="$style.closeButtonContainer">
      <Button
        v-bind="closeButtonBindings"
        data-component="AnchoredOverlay.CloseButton"
        type="button"
        variant="invisible"
        :icon="XIcon"
        :class="$style.closeButton"
        @click="close($event, 'close')"
      />
    </div>
    <slot />
  </Overlay>
</template>

<style module src="./AnchoredOverlay.module.css"></style>
