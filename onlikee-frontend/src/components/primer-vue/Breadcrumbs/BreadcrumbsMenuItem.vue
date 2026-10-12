<script setup lang="ts">
import { computed, h, onBeforeUnmount, onMounted, shallowRef, watch, type VNode } from 'vue'
import { KebabHorizontalIcon } from '@onlikee/octicons-vue'
import { Details, type DetailsInstance } from '../Details'
import { IconButton } from '../Button'
import type { ButtonInstance } from '../Button/types'
import { ActionList } from '../ActionList'
import { registerEscapeHandler, registerOutsideClickHandler } from '../internal/documentRegistries'
import { slotChildren } from '../composables/useSlots'
import classes from './Breadcrumbs.module.css'

defineOptions({ name: 'BreadcrumbsMenuItem', inheritAttrs: false })
const props = defineProps<{ items: VNode[]; ariaLabel?: string }>()
const emit = defineEmits<{ element: [element: HTMLDetailsElement | null] }>()
const details = shallowRef<DetailsInstance | null>(null)
const menuButton = shallowRef<ButtonInstance | null>(null)
const menuContainer = shallowRef<HTMLDivElement | null>(null)
const isOpen = shallowRef(false)
const element = computed(() => details.value?.element ?? null)
let cleanups: Array<() => void> = []

watch(element, (value) => emit('element', value), { flush: 'post' })
function handleSummaryClick(event: MouseEvent) {
  event.preventDefault()
  if (element.value) {
    const nextOpen = !element.value.open
    element.value.open = nextOpen
    isOpen.value = nextOpen
  }
}
function closeOverlay() {
  if (element.value) {
    element.value.open = false
    isOpen.value = false
  }
}
onMounted(() => {
  cleanups = [
    registerEscapeHandler((event) => {
      if (isOpen.value) {
        event.preventDefault()
        closeOverlay()
        menuButton.value?.element?.focus()
      }
    }),
    registerOutsideClickHandler((event) => {
      if (event.button > 0) return true
      if (menuContainer.value?.contains(event.target as Node)) return true
      if (menuButton.value?.element?.contains(event.target as Node)) return true
      closeOverlay()
    }),
  ]
})
onBeforeUnmount(() => {
  cleanups.forEach((cleanup) => cleanup())
  emit('element', null)
})
const RenderItems = () =>
  props.items.map((item, index) => {
    const { selected, as, key: _key, ref: _ref, ...itemProps } = item.props ?? {}
    return h(
      ActionList.LinkItem,
      {
        key: index,
        ...(as !== undefined ? { as } : {}),
        ...itemProps,
        'aria-current': selected === true || selected === '' ? 'page' : undefined,
      },
      { default: () => slotChildren(item) },
    )
  })
</script>

<template>
  <Details ref="details" :class="classes.MenuDetails" data-component="Breadcrumbs.MenuItem">
    <IconButton
      ref="menuButton"
      as="summary"
      role="button"
      :aria-label="props.ariaLabel || `${items.length} more breadcrumb items`"
      :aria-expanded="isOpen ? 'true' : 'false'"
      variant="invisible"
      size="small"
      :icon="KebabHorizontalIcon"
      tooltip-direction="e"
      @click="handleSummaryClick"
    />
    <div ref="menuContainer" :class="classes.MenuOverlay">
      <ActionList>
        <RenderItems />
      </ActionList>
    </div>
  </Details>
</template>
