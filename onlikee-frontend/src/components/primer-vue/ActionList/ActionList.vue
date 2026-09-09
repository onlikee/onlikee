<template>
  <ul
    ref="listRef"
    class="action-list"
    :data-variant="variant"
    :data-dividers="showDividers || undefined"
    :data-selection-variant="selectionVariant"
    :role="role"
    @keydown="handleKeydown"
  >
    <slot />
  </ul>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  createContext,
  provideContext,
  type ActionListSelectionVariant,
  type ActionListVariant
} from './context'

const props = withDefaults(
  defineProps<{
    variant?: ActionListVariant
    selectionVariant?: ActionListSelectionVariant
    showDividers?: boolean
    role?: string
  }>(),
  {
    variant: 'inset',
    selectionVariant: undefined,
    showDividers: false,
    role: undefined
  }
)

const listRef = ref<HTMLUListElement>()
const selectionVariant = computed(() => props.selectionVariant)
const listRole = computed(() => props.role)

const focusableSelector = [
  '[data-action-list-control]',
  ':not([aria-disabled="true"])',
  ':not(:disabled)'
].join('')

function getFocusableItems() {
  const list = listRef.value
  if (!list) return []

  return Array.from(list.querySelectorAll<HTMLElement>(focusableSelector))
    .filter(item => item.closest('.action-list') === list)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.defaultPrevented) return
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return

  const items = getFocusableItems()
  if (!items.length) return

  const activeIndex = items.indexOf(document.activeElement as HTMLElement)
  if (activeIndex === -1) return

  event.preventDefault()

  if (event.key === 'Home') {
    items[0]?.focus()
    return
  }

  if (event.key === 'End') {
    items[items.length - 1]?.focus()
    return
  }

  const offset = event.key === 'ArrowDown' ? 1 : -1
  const nextIndex = (activeIndex + offset + items.length) % items.length
  items[nextIndex]?.focus()
}

provideContext(createContext({
  selectionVariant,
  listRole
}))
</script>

<style scoped>
.action-list {
  --action-list-inset: 8px;
  --action-list-gap: 8px;
  --action-list-item-radius: var(--borderRadius-medium, 6px);
  --action-list-item-padding-block: 6px;
  --action-list-item-padding-inline: 8px;
  --action-list-row-height: 20px;

  box-sizing: border-box;
  width: 100%;
  padding: 0;
  margin: 0;
  list-style: none;
}

.action-list[data-variant='inset'] {
  padding: var(--action-list-inset);
}

.action-list[data-variant='horizontal-inset'] {
  padding-block-end: var(--action-list-inset);
}

.action-list[data-variant='horizontal-inset'] :deep(.action-list-item) {
  margin-inline: var(--action-list-inset);
}

.action-list :deep(.action-list-list) {
  padding: 0;
  margin: 0;
  list-style: none;
}

.action-list[data-dividers='true'] :deep(.action-list-item:not(:first-child) .action-list-sub-content::before) {
  position: absolute;
  top: -7px;
  display: block;
  width: 100%;
  height: 1px;
  content: '';
  background: var(--borderColor-muted, #d1d9e0b3);
}

.action-list[data-dividers='true'] :deep(.action-list-divider + .action-list-item .action-list-sub-content::before),
.action-list[data-dividers='true'] :deep(.action-list-group + .action-list-item .action-list-sub-content::before) {
  visibility: hidden;
}
</style>
