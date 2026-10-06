<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { ChevronRightIcon } from '@/components/octicons-vue3'
import { ActionList } from '../ActionList'
import type { SelectEvent } from '../ActionList/types'
import MenuOverlay from './ActionBarMenuOverlay.vue'
import type { MenuEntry } from './context'

const props = defineProps<{ item: MenuEntry }>()
const anchor = shallowRef<HTMLElement | null>(null)
const open = shallowRef(false)
const focusAnchor = shallowRef(false)
const action = computed(() => props.item.type === 'divider' ? null : props.item)
const hasSubmenu = computed(() => Boolean(action.value?.items?.length))
function setAnchor(value: unknown) { anchor.value = (value as { element: HTMLElement } | null)?.element ?? null }
const RenderLabel = () => typeof action.value?.label === 'function' ? action.value.label() : action.value?.label
function select(event: SelectEvent) {
  if (hasSubmenu.value) {
    focusAnchor.value = event instanceof MouseEvent && event.detail > 0
    open.value = !open.value
    event.preventDefault()
  } else action.value?.onClick?.(event)
}
function keydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowRight' || !hasSubmenu.value || action.value?.disabled) return
  event.preventDefault()
  focusAnchor.value = false
  open.value = true
}
</script>

<template>
  <ActionList.Divider v-if="item.type === 'divider'" />
  <template v-else-if="action">
    <ActionList.Item
      :ref="setAnchor"
      :disabled="action.disabled"
      :variant="action.variant"
      :aria-haspopup="hasSubmenu ? 'true' : undefined"
      :aria-expanded="hasSubmenu ? open : undefined"
      @select="select"
      @keydown="keydown"
    >
      <ActionList.LeadingVisual v-if="action.leadingVisual">
        <component :is="action.leadingVisual" />
      </ActionList.LeadingVisual>
      <RenderLabel />
      <ActionList.TrailingVisual v-if="action.trailingVisual || hasSubmenu">
        <span v-if="typeof action.trailingVisual === 'string'">{{ action.trailingVisual }}</span>
        <component
          :is="action.trailingVisual || ChevronRightIcon"
          v-else
        />
      </ActionList.TrailingVisual>
    </ActionList.Item>
    <MenuOverlay
      v-if="hasSubmenu"
      :open="open"
      :anchor="anchor"
      :items="action.items!"
      :return-focus-ref="action.returnFocusRef"
      :focus-anchor="focusAnchor"
      submenu
      @close="open = false"
    />
  </template>
</template>
