<script setup lang="ts">
import {
  computed,
  h,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  toValue,
  useAttrs,
  useId,
  watch,
  watchEffect,
  type SetupContext,
} from 'vue'
import { focusTrap } from '@primer/behaviors'
import { iterateFocusableElements } from '@primer/behaviors/utils'
import { useAnchoredPosition } from '../../composables/useAnchoredPosition'
import { useFeatureFlag } from '../../FeatureFlags'
import { registerEscapeHandler, registerOutsideClickHandler } from '../documentRegistries'
import type { OverlayProps, OverlayCloseGesture } from './overlayTypes'
import { normalizeReactStyle } from '../style'
import { getPortalRoot, registerPortalRoot } from '../../Portal'

defineOptions({ name: 'Overlay', inheritAttrs: false })
const props = withDefaults(defineProps<OverlayProps>(), {
  as: 'div',
  open: true,
  anchor: null,
  side: 'outside-bottom',
  align: 'start',
  width: 'auto',
  height: 'auto',
  preventFocusOnOpen: false,
  trapFocus: false,
  initialFocusRef: null,
  returnFocusRef: null,
  allowOutOfBounds: false,
  displayInViewport: false,
  pinPosition: false,
  preventOverflow: true,
  role: 'none',
})
const emit = defineEmits<{
  close: [event: KeyboardEvent | MouseEvent, gesture: OverlayCloseGesture]
}>()
const mounted = shallowRef(false)
const portalRoot = shallowRef<Element>()
const cssAnchorName = `--primer-overlay-${useId().replace(/[^a-zA-Z0-9_-]/g, '-')}`
const attrs = useAttrs()
const dataComponent = computed(() => attrs['data-component'])
const element = shallowRef<HTMLElement | null>(null)
function setElement(value: unknown) {
  const instance = value as { element?: HTMLElement; $el?: HTMLElement } | null
  element.value =
    value instanceof HTMLElement ? value : (instance?.element ?? instance?.$el ?? null)
}
const anchor = computed(() => props.anchor)
const cssAnchorEnabled = useFeatureFlag('primer_react_css_anchor_positioning')
const disablePortal = computed(() => Boolean(props._PrivateDisablePortal && cssAnchorEnabled.value))
const PortalHost = (_props: unknown, { slots }: SetupContext) =>
  disablePortal.value
    ? slots.default?.()
    : h(
        'div',
        { 'data-component': 'Portal', style: { position: 'relative', zIndex: 1 } },
        slots.default?.(),
      )
const supportsCssAnchorPositioning =
  typeof document !== 'undefined' &&
  'anchorName' in document.documentElement.style &&
  'positionTryFallbacks' in document.documentElement.style &&
  'positionVisibility' in document.documentElement.style
const cssAnchor = computed(
  () =>
    cssAnchorEnabled.value &&
    supportsCssAnchorPositioning &&
    !props.portalContainerName &&
    !props.cssAnchorPositioningSettings?.disable,
)
const { position } = useAnchoredPosition(() => ({
  floatingElementRef: element,
  anchorElementRef: anchor,
  side: props.side,
  align: props.align,
  anchorOffset: props.anchorOffset,
  alignmentOffset: props.alignmentOffset,
  allowOutOfBounds: props.allowOutOfBounds,
  displayInViewport: props.displayInViewport,
  pinPosition: props.pinPosition,
  onPositionChange: props.onPositionChange,
  enabled: props.open && !cssAnchor.value,
}))
const overlayVisibility = computed(
  () =>
    props.visibility ??
    (props.anchor ? (cssAnchor.value || position.value ? 'visible' : 'hidden') : 'visible'),
)
const px = (value: number | string | undefined) =>
  typeof value === 'number' ? `${value}px` : value
const effectiveTop = computed(
  () => props.top ?? (cssAnchor.value || !props.anchor ? undefined : position.value?.top || 0),
)
const effectiveLeft = computed(() => {
  const left =
    props.left ?? (cssAnchor.value || !props.anchor ? undefined : position.value?.left || 0)
  return left === undefined && props.right === undefined ? 0 : left
})
const overlayStyle = computed(() =>
  normalizeReactStyle([
    {
      '--top': px(effectiveTop.value),
      '--left': px(effectiveLeft.value),
      '--right': px(props.right),
      '--bottom': px(props.bottom),
      position: props.position,
    },
    props.style,
  ]),
)

let previousFocus: HTMLElement | null = null

watch(
  [element, () => props.height],
  ([overlay, height]) => {
    if (overlay && height === 'initial' && overlay.clientHeight)
      overlay.style.height = `${overlay.clientHeight}px`
  },
  { flush: 'post' },
)

const trapArmed = computed(
  () =>
    props.open &&
    props.trapFocus &&
    props.focusTrapSettings?.disabled !== true &&
    overlayVisibility.value !== 'hidden',
)
watch(
  [element, trapArmed],
  ([overlay, armed], _previous, onCleanup) => {
    if (!overlay || !armed) return
    const initialFocus = toValue(props.focusTrapSettings?.initialFocusRef)
    const controller = focusTrap(overlay, initialFocus ?? undefined)
    onCleanup(() => controller?.abort())
  },
  { flush: 'post' },
)

watch(
  [element, () => props.preventFocusOnOpen],
  ([overlay], _previous, onCleanup) => {
    if (!overlay || !props.open) return
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const menuReturnFocus =
      dataComponent.value === 'ActionMenu.Overlay' ? toValue(props.returnFocusRef) : undefined
    if (!props.preventFocusOnOpen) {
      const initialFocus = toValue(props.initialFocusRef)
      if (initialFocus) {
        initialFocus.focus()
      } else {
        const firstItem = iterateFocusableElements(overlay).next().value
        firstItem?.focus()
      }
    }
    onCleanup(() => {
      const returnTo =
        dataComponent.value === 'ActionMenu.Overlay'
          ? menuReturnFocus
          : (toValue(props.returnFocusRef) ?? previousFocus)
      if (returnTo?.isConnected) returnTo.focus()
    })
  },
  { flush: 'post' },
)

watch(
  [element, () => props.open],
  ([overlay, open], _previous, onCleanup) => {
    if (!overlay || !open) return
    const unregisterEscape = registerEscapeHandler((event) => {
      if (event.key !== 'Escape') return
      props.onEscape?.(event)
      emit('close', event, 'escape')
      event.preventDefault()
    })
    const unregisterOutside = registerOutsideClickHandler((event) => {
      // don't call click handler if the mouse event was triggered by an auxiliary button (right click/wheel button/etc)
      if (event.button > 0) return true
      const target = event.target as Node
      // don't call handler if the click happened inside of the container
      if (overlay.contains(target)) return true
      if (props.ignoreClickRefs?.some((ref) => toValue(ref)?.contains(target))) return true
      props.onClickOutside?.(event)
      emit('close', event, 'click-outside')
      return undefined
    })
    onCleanup(() => {
      unregisterEscape()
      unregisterOutside()
    })
  },
  { flush: 'post' },
)

watch(
  () => [element.value, props.anchorSide, overlayVisibility.value] as const,
  ([overlay, side, visibility]) => {
    if (!overlay?.animate || visibility === 'hidden') return
    const { x, y } = getSlideAnimationStartingVector(side)
    if (!x && !y) return
    overlay.animate(
      { transform: [`translate(${8 * x}px, ${8 * y}px)`, 'translate(0, 0)'] },
      { duration: 200, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' },
    )
  },
  { flush: 'post' },
)

function getSlideAnimationStartingVector(anchorSide?: string): { x: number; y: number } {
  if (anchorSide?.endsWith('bottom')) return { x: 0, y: -1 }
  else if (anchorSide?.endsWith('top')) return { x: 0, y: 1 }
  else if (anchorSide?.endsWith('right')) return { x: -1, y: 0 }
  else if (anchorSide?.endsWith('left')) return { x: 1, y: 0 }
  return { x: 0, y: 0 }
}

watchEffect(
  (onCleanup) => {
    if (!cssAnchor.value || !props.anchor || !element.value) return
    const anchorElement = props.anchor
    const overlay = element.value
    const old = anchorElement.style.getPropertyValue('anchor-name')
    const isMenu = dataComponent.value === 'ActionMenu.Overlay'
    const name = isMenu && old ? old : cssAnchorName
    anchorElement.style.setProperty('anchor-name', name)
    overlay.style.setProperty('position-anchor', name)
    const fallback = props.cssAnchorPositioningSettings?.fallbackStrategy ?? 'default'
    const horizontalSide = props.side.endsWith('left') || props.side.endsWith('right')
    overlay.style.setProperty(
      'position-try-fallbacks',
      fallback === 'none'
        ? 'none'
        : fallback === 'opposite-side'
          ? horizontalSide
            ? 'flip-inline'
            : 'flip-block'
          : horizontalSide
            ? `flip-inline, flip-block, flip-start, --outside-${props.side.endsWith('left') ? 'left' : 'right'}-to-bottom`
            : 'flip-block, flip-inline, flip-block flip-inline, --inline-end-center, --inline-start-center, --fit-block-bottom, --fit-block-top',
    )
    overlay.style.setProperty('--primer-overlay-anchor-offset', `${props.anchorOffset ?? 4}px`)
    const updateAlignment = () => {
      const rect = anchorElement.getBoundingClientRect()
      const overlayRect = overlay.getBoundingClientRect()
      const width = overlayRect.width
      const leftRoom = rect.left
      const rightRoom = window.innerWidth - rect.right
      overlay.dataset.cssAlign = leftRoom > rightRoom ? 'left' : 'right'
      overlay.style.setProperty(
        '--primer-overlay-inline-offset',
        `${Math.max(0, rect.left + width - window.innerWidth + 8)}px`,
      )
      if (isMenu) {
        if (
          (overlayRect.right > window.innerWidth || overlayRect.left < 0) &&
          (overlayRect.bottom > window.innerHeight || overlayRect.top < 0)
        ) {
          overlay.dataset.side =
            leftRoom >= width + 8
              ? 'outside-left'
              : rightRoom >= width + 8
                ? 'outside-right'
                : 'outside-bottom'
        }
        const constrained = leftRoom < width + 8 && rightRoom < width + 8
        overlay.style.setProperty(
          '--anchored-overlay-anchor-offset-left',
          `${constrained ? Math.max(0, width - rect.right + 8) : 0}px`,
        )
        overlay.style.setProperty(
          '--anchored-overlay-anchor-offset-right',
          `${constrained ? Math.max(0, rect.left + width - window.innerWidth + 8) : 0}px`,
        )
        const settled = overlay.getBoundingClientRect()
        const overflowBottom = settled.bottom - window.innerHeight
        if (overflowBottom > 0)
          overlay.style.setProperty(
            '--anchored-overlay-top-override',
            `${Math.max(0, settled.top - overflowBottom - 8)}px`,
          )
        else overlay.style.removeProperty('--anchored-overlay-top-override')
      }
    }
    const frame = requestAnimationFrame(updateAlignment)
    if (!isMenu) window.addEventListener('resize', updateAlignment)
    onCleanup(() => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateAlignment)
      anchorElement.style.setProperty('anchor-name', old)
    })
  },
  { flush: 'post' },
)

function resolvePortalRoot() {
  if (props.portalContainerName) {
    const container = getPortalRoot(props.portalContainerName)
    if (!container)
      throw new Error(`Portal container '${props.portalContainerName}' is not yet registered.`)
    portalRoot.value = container
    return
  }
  const registered = getPortalRoot('__default__')
  if (registered && document.body.contains(registered)) {
    portalRoot.value = registered
    return
  }
  let container = document.getElementById('__primerVuePortalRoot__')
  if (!container) {
    container = document.createElement('div')
    container.id = '__primerVuePortalRoot__'
    Object.assign(container.style, { position: 'absolute', top: '0', left: '0', width: '100%' })
    ;(document.querySelector('[data-portal-root]') ?? document.body).appendChild(container)
  }
  portalRoot.value = container
  registerPortalRoot(container)
}
onMounted(() => {
  if (props.open || !props.portalContainerName) resolvePortalRoot()
  mounted.value = true
})
watch([() => props.open, () => props.portalContainerName], ([open]) => {
  if (mounted.value && open) resolvePortalRoot()
})
onBeforeUnmount(() => {
  mounted.value = false
})
defineExpose({
  element,
  position,
  visibility: overlayVisibility,
  cssAnchor,
  focus: () => element.value?.focus(),
})
</script>
<template>
  <Teleport v-if="mounted && open && portalRoot" :to="portalRoot!" :disabled="disablePortal">
    <PortalHost>
      <component
        :is="as"
        :ref="setElement"
        v-bind="$attrs"
        :class="[$style['primer-overlay'], 'primer-overlay', className]"
        :style="overlayStyle"
        :data-width="width"
        :data-height="height"
        :data-max-height="maxHeight"
        :data-max-width="maxWidth"
        :overflow="overflow"
        :[`data-overflow-${overflow}`]="overflow ? '' : undefined"
        :data-css-anchor="cssAnchor || undefined"
        :data-side="cssAnchor ? side : position?.anchorSide"
        :data-anchor-position="anchor ? (cssAnchor ? 'true' : 'false') : undefined"
        :data-responsive="responsiveVariant"
        :data-visibility="overlayVisibility"
        :data-reflow-container="preventOverflow === false ? 'true' : undefined"
        :role="role"
        :data-component="dataComponent"
      >
        <slot />
      </component>
    </PortalHost>
  </Teleport>
</template>
<style module src="./Overlay.module.css"></style>
