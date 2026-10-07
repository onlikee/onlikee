<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
import { useUnderlinePanels } from './context'
import type { UnderlinePanelsTabProps } from './types'

defineOptions({ inheritAttrs: false })

const props = defineProps<UnderlinePanelsTabProps>()

const emit = defineEmits<{
  select: [event: MouseEvent | KeyboardEvent]
}>()

const attrs = useAttrs()
const slots = useSlots()
const context = useUnderlinePanels()
const value = computed(() => props.value ?? '')
const selected = computed(() => context.selectedValue.value === value.value)
const tabStop = computed(() => context.activationMode.value === 'manual' && context.focusedValue.value !== undefined
  ? context.focusedValue.value === value.value
  : selected.value)
const textContent = computed(() => (slots.default?.() ?? [])
  .filter(node => typeof node.children === 'string' || typeof node.children === 'number')
  .map(node => String(node.children))
  .join(''))

function handleFocus() {
  if (props.disabled) return
  if (context.activationMode.value === 'manual') context.focusTab(value.value)
  else context.selectTab(value.value)
}

function handleMousedown(event: MouseEvent) {
  if (props.disabled || event.button !== 0 || event.ctrlKey) {
    event.preventDefault()
    return
  }
  context.selectTab(value.value)
}

function handleClick(event: MouseEvent) {
  if (props.disabled || event.defaultPrevented) return
  context.selectTab(value.value)
  emit('select', event)
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled || event.defaultPrevented) return
  if (event.key === 'Enter' || event.key === ' ') {
    context.selectTab(value.value)
    emit('select', event)
  }
}
</script>

<template>
  <button
    v-bind="attrs"
    :id="`${context.id.value}-tab-${value}`"
    :class="[$style['underline-panels__tab']]"
    type="button"
    role="tab"
    :aria-controls="`${context.id.value}-panel-${value}`"
    :aria-selected="selected"
    :aria-disabled="disabled || undefined"
    :tabindex="tabStop ? 0 : -1"
    @focus="handleFocus"
    @mousedown="handleMousedown"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <span
      v-if="leadingVisual"
      data-component="icon"
    ><component :is="leadingVisual" /></span>
    <span
      data-component="text"
      :data-content="textContent || undefined"
    ><slot /></span>
    <span
      v-if="counter !== undefined"
      data-component="counter"
    >
      <span
        v-if="context.loadingCounters.value"
        :class="[$style['underline-panels__loading-counter']]"
      />
      <span
        v-else
        :class="[$style['underline-panels__counter']]"
      >{{ counter }}</span>
    </span>
  </button>
</template>

<style module src="./UnderlinePanelsTab.module.css"></style>
