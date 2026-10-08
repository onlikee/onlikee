<script setup lang="ts">
import classes from './ActionBar.module.css'
import { computed, onBeforeUnmount, onMounted, provide, shallowRef, useAttrs, watch } from 'vue'
import { KebabHorizontalIcon } from '@/components/octicons-vue3'
import Button from '../SelectPanel/SelectPanelButton.vue'
import { FocusKeys, useFocusZone } from '../composables/useFocusZone'
import MenuOverlay from './ActionBarMenuOverlay.vue'
import { actionBarKey, type RegisteredItem } from './context'
import type { ActionBarProps } from './types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<ActionBarProps>(), {
  size: 'medium',
  flush: false,
  gap: 'condensed',
})
// Vue normalizes declared kebab-case prop keys at runtime; keep the public native ARIA names.
const a11y = props as typeof props & { ariaLabel?: string; ariaLabelledby?: string }
const attrs = useAttrs()
const toolbar = shallowRef<HTMLElement | null>(null)
const moreButton = shallowRef<{ element: HTMLElement | null } | null>(null)
const more = computed(() => moreButton.value?.element ?? null)
const open = shallowRef(false)
const last = shallowRef(false)
const focusAnchor = shallowRef(false)
const registry = shallowRef<RegisteredItem[]>([])
const subscribers = new Map<HTMLElement, (overflowing: boolean) => void>()
let observer: IntersectionObserver | undefined
let orderObserver: MutationObserver | undefined

provide(actionBarKey, {
  size: computed(() => props.size),
  register(item) {
    registry.value = [...registry.value, item]
    return () => {
      registry.value = registry.value.filter((candidate) => candidate !== item)
    }
  },
  observe(element, callback) {
    subscribers.set(element, callback)
    observer?.observe(element)
    return () => {
      subscribers.delete(element)
      observer?.unobserve(element)
    }
  },
})
// Registration order can differ from DOM order for nested and conditionally rendered children.
function sortRegistry() {
  const sorted = [...registry.value].sort((a, b) => {
    const position =
      a.element.value && b.element.value
        ? a.element.value.compareDocumentPosition(b.element.value)
        : 0
    return position & Node.DOCUMENT_POSITION_FOLLOWING
      ? -1
      : position & Node.DOCUMENT_POSITION_PRECEDING
        ? 1
        : 0
  })
  if (sorted.some((item, index) => item !== registry.value[index])) registry.value = sorted
}
const overflowItems = computed(() => registry.value.filter((item) => item.overflowing.value))
if (typeof document !== 'undefined')
  useFocusZone(() => {
    void overflowItems.value
    return {
      containerRef: toolbar,
      bindKeys: FocusKeys.ArrowHorizontal | FocusKeys.HomeAndEnd,
      focusOutBehavior: 'wrap',
      focusableElementFilter: (element) =>
        element.matches(
          ':is(button, a, input, [tabindex]):not(:disabled):not([data-more-button-inactive])',
        ) && !element.closest('[data-overflowing]'),
    }
  })
function openMore(event: KeyboardEvent) {
  if (event.key === 'Tab' && open.value) {
    open.value = false
    return
  }
  if (event.defaultPrevented || !['ArrowDown', 'ArrowUp'].includes(event.key)) return
  last.value = event.key === 'ArrowUp'
  focusAnchor.value = false
  open.value = true
  event.preventDefault()
}
watch(overflowItems, (items) => {
  if (!items.length) open.value = false
})
onMounted(() => {
  if (typeof IntersectionObserver !== 'undefined' && toolbar.value) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          subscribers.get(entry.target as HTMLElement)?.(
            !entry.isIntersecting || entry.intersectionRatio < 0.95,
          )
      },
      { root: toolbar.value, threshold: [0, 0.95] },
    )
    subscribers.forEach((_callback, element) => observer?.observe(element))
  }
  sortRegistry()
  orderObserver = new MutationObserver(sortRegistry)
  orderObserver.observe(
    toolbar.value!.querySelector(`.${classes['action-bar-overflow-container']}`)!,
    { childList: true, subtree: true },
  )
})
onBeforeUnmount(() => {
  observer?.disconnect()
  orderObserver?.disconnect()
  subscribers.clear()
})
</script>

<template>
  <div
    v-bind="attrs"
    :class="[classes['action-bar'], className]"
    data-component="ActionBar"
    :data-flush="flush"
  >
    <div
      ref="toolbar"
      role="toolbar"
      :class="[classes['action-bar-list']]"
      :aria-label="a11y.ariaLabel"
      :aria-labelledby="a11y.ariaLabelledby"
      :data-gap="gap"
      :data-size="size"
      :data-has-overflow="overflowItems.length > 0"
    >
      <div :class="[classes['action-bar-overflow-container']]">
        <div :class="[classes['action-bar-overflow-spacer']]" />
        <slot />
      </div>
      <Button
        ref="moreButton"
        :class="[classes['action-bar-more']]"
        variant="invisible"
        aria-label="More items"
        :icon="KebabHorizontalIcon"
        :size="size"
        aria-haspopup="true"
        :aria-expanded="open"
        :data-more-button-inactive="overflowItems.length ? undefined : true"
        @click="((last = false), (focusAnchor = $event.detail > 0), (open = !open))"
        @keydown="openMore"
      />
    </div>
    <MenuOverlay
      :open="open"
      :anchor="more"
      :overflow-items="overflowItems"
      :last="last"
      :focus-anchor="focusAnchor"
      @close="open = false"
    />
  </div>
</template>
