<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'div'">
import {
  computed,
  h,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  shallowRef,
  toValue,
  watch,
} from 'vue'
import type { Component, NativeElements, SetupContext } from 'vue'
import { iterateFocusableElements } from '@primer/behaviors/utils'
import BaseOverlay from './BaseOverlay.vue'
import type { OverlayComponentProps, OverlayOptions } from './types'
import { Portal } from '../Portal'
import { useFeatureFlag } from '../FeatureFlags'
import { registerEscapeHandler, registerOutsideClickHandler } from '../internal/documentRegistries'

defineOptions({ name: 'Overlay', inheritAttrs: false })
const {
  height = 'auto',
  width = 'auto',
  role = 'none',
  visibility = 'visible',
  preventOverflow = true,
  ...props
} = defineProps<OverlayComponentProps<As>>()
defineSlots<{ default?: () => unknown }>()
const base = shallowRef<{ element: HTMLElement | null } | null>(null)
const element = computed(() => base.value?.element ?? null)
const cssAnchorPositioning = useFeatureFlag('primer_react_css_anchor_positioning')
const disablePortal = computed(() => props._PrivateDisablePortal && cssAnchorPositioning.value)
const PortalHost = (_props: unknown, { slots }: SetupContext) =>
  disablePortal.value
    ? slots.default?.()
    : h(Portal, { containerName: props.portalContainerName }, slots)
const leftPosition = computed(() =>
  props.left === undefined && props.right === undefined ? 0 : props.left,
)
const surfaceProps = computed(() => {
  const {
    anchorSide: _anchorSide,
    _PrivateDisablePortal: _disablePortal,
    ignoreClickRefs: _ignoreClickRefs,
    initialFocusRef: _initialFocusRef,
    returnFocusRef: _returnFocusRef,
    onEscape: _onEscape,
    onClickOutside: _onClickOutside,
    portalContainerName: _portalContainerName,
    preventFocusOnOpen: _preventFocusOnOpen,
    responsiveVariant: _responsiveVariant,
    ...rest
  } = props
  return { ...rest, height, width, role, visibility, left: leftPosition.value }
})

watch(
  [
    element,
    () => props.initialFocusRef,
    () => props.returnFocusRef,
    () => props.preventFocusOnOpen,
  ],
  async ([overlay], _previous, onCleanup) => {
    if (!overlay) return
    const returnTo = toValue(props.returnFocusRef)
    let cancelled = false
    onCleanup(() => {
      cancelled = true
      // Nested teleports finish removing their focus traps in the same Vue commit.
      nextTick(() => returnTo?.focus())
    })
    await nextTick()
    if (cancelled || props.preventFocusOnOpen || visibility === 'hidden') return
    const initialFocus = toValue(props.initialFocusRef)
    if (initialFocus) initialFocus.focus()
    else iterateFocusableElements(overlay).next().value?.focus()
  },
  { flush: 'sync' },
)

let unregisterEscape: (() => void) | undefined
let unregisterOutside: (() => void) | undefined
// Register parents before their synchronously mounted portaled descendants.
onBeforeMount(() => {
  unregisterEscape = registerEscapeHandler((event) => {
    props.onEscape(event)
    event.preventDefault()
  })
  unregisterOutside = registerOutsideClickHandler((event) => {
    if (event.button > 0 || element.value?.contains(event.target as Node)) return true
    if (props.ignoreClickRefs?.some((ref) => ref.value?.contains(event.target as Node))) return true
    props.onClickOutside(event)
    return undefined
  })
})
onBeforeUnmount(() => {
  unregisterEscape?.()
  unregisterOutside?.()
})

watch(
  [element, () => height],
  ([overlay, height]) => {
    if (height === 'initial' && overlay?.clientHeight)
      overlay.style.height = `${overlay.clientHeight}px`
  },
  { flush: 'post' },
)

function getSlideAnimationStartingVector(side?: OverlayOptions['anchorSide']) {
  if (side?.endsWith('bottom')) return { x: 0, y: -1 }
  if (side?.endsWith('top')) return { x: 0, y: 1 }
  if (side?.endsWith('right')) return { x: -1, y: 0 }
  if (side?.endsWith('left')) return { x: 1, y: 0 }
  return { x: 0, y: 0 }
}

watch(
  () => [element.value, props.anchorSide, visibility] as const,
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
defineExpose({ element })
</script>

<template>
  <PortalHost>
    <BaseOverlay
      v-bind="{ ...surfaceProps, ...$attrs }"
      ref="base"
      :data-reflow-container="!preventOverflow ? true : undefined"
      :data-responsive="responsiveVariant"
    >
      <slot />
    </BaseOverlay>
  </PortalHost>
</template>
