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
    class="underline-panels__tab"
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
        class="underline-panels__loading-counter"
      />
      <span
        v-else
        class="underline-panels__counter"
      >{{ counter }}</span>
    </span>
  </button>
</template>

<style scoped>
.underline-panels__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  height: 32px;
  padding: 6px 8px;
  margin-bottom: 8px;
  font: inherit;
  font-size: var(--text-body-size-medium, 14px);
  line-height: var(--text-body-lineHeight-medium, 1.4285);
  color: var(--fgColor-default, #1f2328);
  text-align: center;
  cursor: pointer;
  appearance: none;
  background: transparent;
  border: 0;
  border-radius: var(--borderRadius-medium, 6px);
}

@media (hover: hover) {
  .underline-panels__tab:hover {
    background: var(--bgColor-neutral-muted, #818b981f);
    transition: background-color 0.12s ease-out;
  }
}

.underline-panels__tab:focus-visible {
  outline: 2px solid transparent;
  box-shadow: inset 0 0 0 2px var(--fgColor-accent, #0969da);
}

.underline-panels__tab [data-content]::before {
  display: block;
  height: 0;
  font-weight: var(--base-text-weight-semibold, 600);
  white-space: nowrap;
  visibility: hidden;
  content: attr(data-content);
}

.underline-panels__tab [data-component='icon'] {
  display: inline-flex;
  align-items: center;
  margin-inline-end: 8px;
  color: var(--fgColor-muted, #59636e);
}

.underline-panels__tab [data-component='text'] {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.underline-panels__tab [data-component='counter'] {
  display: flex;
  align-items: center;
  margin-inline-start: 8px;
}

.underline-panels__counter {
  min-width: 20px;
  padding: 0 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: var(--fgColor-muted, #59636e);
  background: var(--bgColor-neutral-muted, #818b981f);
  border-radius: 999px;
}

.underline-panels__loading-counter {
  display: inline-block;
  width: 24px;
  height: 16px;
  background: var(--bgColor-neutral-muted, #818b981f);
  border-radius: 20px;
  animation: loading-counter 1.2s ease-in-out infinite alternate;
}

@keyframes loading-counter {
  to { opacity: 0.2; }
}

.underline-panels__tab::after {
  position: absolute;
  inset: auto 0 0;
  height: 2px;
  margin-bottom: -8px;
  pointer-events: none;
  content: '';
  background: transparent;
}

.underline-panels__tab[aria-selected='true'] [data-component='text'] {
  font-weight: var(--base-text-weight-semibold, 600);
}

.underline-panels__tab[aria-selected='true']::after {
  background: var(--underlineNav-borderColor-active, #fd8c73);
}

@media (forced-colors: active) {
  .underline-panels__tab[aria-selected='true']::after { background: LinkText; }
}
</style>
