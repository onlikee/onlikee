<script setup lang="ts">
import classes from './ActionMenu.module.css'
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  useAttrs,
  watch,
} from 'vue'
import { iterateFocusableElements } from '@primer/behaviors/utils'
import { AnchoredOverlay } from '../AnchoredOverlay'
import { ActionListContainerContext } from '../ActionList'
import { dialogContextKey } from '../Dialog/context'
import { useMenuContext } from './context'
import type { ActionMenuOverlayProps, MenuCloseGesture } from './types'

defineOptions({
  name: 'ActionMenuOverlay',
  __SLOT__: Symbol('ActionMenu.Overlay'),
  inheritAttrs: false,
})
const props = withDefaults(defineProps<ActionMenuOverlayProps>(), {
  variant: () => ({ regular: 'anchored', narrow: 'anchored' }),
  displayInViewport: undefined,
  allowOutOfBounds: undefined,
  pinPosition: undefined,
  preventOverflow: undefined,
  preventFocusOnOpen: undefined,
  trapFocus: undefined,
})
const attrs = useAttrs()
const isInsideDialog = inject(dialogContextKey, undefined) !== undefined
const menu = useMenuContext()
const mounted = shallowRef(false)
const container = shallowRef<HTMLElement | null>(null)
const overlay = shallowRef<{ element: HTMLElement | null; position?: unknown } | null>(null)
const narrow = shallowRef(false)
const wide = shallowRef(false)
const media =
  typeof window === 'undefined'
    ? undefined
    : window.matchMedia?.('(max-width: calc(768px - 0.02px))')
const wideMedia =
  typeof window === 'undefined' ? undefined : window.matchMedia?.('(min-width: 1400px)')
const updateMedia = () => {
  narrow.value = media?.matches ?? false
  wide.value = wideMedia?.matches ?? false
}
const fullscreen = computed(() => narrow.value && props.variant.narrow === 'fullscreen')
watch(
  fullscreen,
  (value) => {
    menu.fullscreen.value = value
  },
  { immediate: true },
)
const variant = computed(() => {
  if (narrow.value && 'narrow' in props.variant) return props.variant.narrow
  if (wide.value && 'wide' in props.variant) return props.variant.wide
  if (!narrow.value && 'regular' in props.variant) return props.variant.regular
  return { regular: 'anchored', narrow: 'anchored' }
})
const focusZoneSettings = computed(() =>
  fullscreen.value ? { disabled: true } : { focusOutBehavior: 'wrap' as const },
)
const anchorRef = computed(() => menu.anchor.value)
const anchorBindings = { anchorRef }
const anchorAriaLabelledBy = shallowRef<string | null>(null)
watch(
  menu.anchorRefIdentity,
  async () => {
    await nextTick()
    const value = menu.anchor.value?.getAttribute('aria-labelledby')
    if (value) anchorAriaLabelledBy.value = value
  },
  { immediate: true, flush: 'post' },
)
const label = computed(
  () =>
    (attrs['aria-labelledby'] as string | undefined) ||
    anchorAriaLabelledBy.value ||
    menu.anchorId.value,
)
const displayInViewport = computed(() => props.displayInViewport ?? isInsideDialog)
const overlayProps = computed(() => {
  const { variant: _variant, onPositionChange: _positionChange, ...rest } = props
  // Absent Vue props still exist as undefined; don't override Overlay's ref defaults.
  const supplied = Object.fromEntries(
    Object.entries(rest).filter(([, value]) => value !== undefined),
  )
  const { 'aria-labelledby': _label, ...overlayAttrs } = attrs
  return { ...supplied, ...overlayAttrs, 'data-component': 'ActionMenu.Overlay' }
})
function close(gesture: MenuCloseGesture) {
  if (fullscreen.value && gesture === 'tab') return
  menu.onClose(gesture)
}
provide(ActionListContainerContext, {
  container: 'ActionMenu',
  listRole: 'menu',
  selectionAttribute: 'aria-checked',
  get listLabelledBy() {
    return label.value
  },
  get enableFocusZone() {
    return fullscreen.value
  },
  afterSelect: () => close('item-select'),
})
function items() {
  return container.value ? [...iterateFocusableElements(container.value)] : []
}
function focusItem(last: boolean) {
  const elements = items()
  ;(last ? elements[elements.length - 1] : elements[0])?.focus()
}
menu.setFocusItem(focusItem)
let focusedElement: HTMLElement | null = null
watch(
  () => [menu.open.value, overlay.value?.element, Boolean(overlay.value?.position)] as const,
  async ([open, element]) => {
    if (!open) focusedElement = null
    if (!open || !element) return
    await nextTick()
    if (!menu.open.value || focusedElement === element) return
    focusedElement = element
    for (const item of items()) {
      if (!item.getAttribute('aria-keyshortcuts')) {
        const key = item.textContent?.toLowerCase()[0]
        if (key) item.setAttribute('aria-keyshortcuts', key)
      }
    }
    if (menu.openingGesture.value === 'mouse') menu.anchor.value?.focus()
    else focusItem(menu.openingGesture.value === 'last')
  },
  { flush: 'post' },
)
function keydown(event: KeyboardEvent) {
  if (event.defaultPrevented) return
  if (event.key === 'Tab') {
    close('tab')
    return
  }
  if (menu.isSubmenu && event.key === 'ArrowLeft') {
    close('arrow-left')
    return
  }
  if (
    event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    event.key.length !== 1 ||
    !/[a-z\d]/i.test(event.key)
  )
    return
  const active = document.activeElement as HTMLElement
  if (active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA') return
  event.stopPropagation()
  const matches = items().filter((item) =>
    item
      .getAttribute('aria-keyshortcuts')
      ?.toLowerCase()
      .split(' ')
      .includes(event.key.toLowerCase()),
  )
  const index = matches.indexOf(active)
  matches[(index + 1) % matches.length]?.focus()
}
onMounted(() => {
  mounted.value = true
  updateMedia()
  media?.addEventListener('change', updateMedia)
  wideMedia?.addEventListener('change', updateMedia)
})
onBeforeUnmount(() => {
  media?.removeEventListener('change', updateMedia)
  wideMedia?.removeEventListener('change', updateMedia)
  menu.setFocusItem(() => {})
})
defineExpose({ element: computed(() => overlay.value?.element ?? null) })
</script>

<template>
  <AnchoredOverlay
    v-if="mounted"
    ref="overlay"
    :open="menu.open.value"
    :render-anchor="null"
    v-bind="anchorBindings"
    :anchor-id="menu.anchorId.value"
    :overlay-props="overlayProps"
    :side="side ?? (menu.isSubmenu ? 'outside-right' : 'outside-bottom')"
    :align="align ?? 'start'"
    :variant="props.variant"
    :display-in-viewport="displayInViewport"
    :on-position-change="onPositionChange"
    :focus-zone-settings="focusZoneSettings"
    @close="close"
  >
    <div
      ref="container"
      :class="[classes['action-menu-container']]"
      :data-variant="variant"
      :[`data-overflow-${overflow}`]="overflow ? '' : undefined"
      :[`data-max-height-${maxHeight}`]="maxHeight ? '' : undefined"
      @keydown="keydown"
    >
      <slot />
    </div>
  </AnchoredOverlay>
</template>
