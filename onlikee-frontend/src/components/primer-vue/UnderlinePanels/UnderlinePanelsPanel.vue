<script setup lang="ts">
import { computed } from 'vue'
import { useUnderlinePanels } from './context'
import type { UnderlinePanelsPanelProps } from './types'

const props = defineProps<UnderlinePanelsPanelProps>()
const context = useUnderlinePanels()
const value = computed(() => props.value ?? '')
const selected = computed(() => context.selectedValue.value === value.value)
</script>

<template>
  <div
    :id="`${context.id.value}-panel-${value}`"
    role="tabpanel"
    :aria-labelledby="`${context.id.value}-tab-${value}`"
    :data-selected="selected ? '' : undefined"
    :hidden="!selected"
  >
    <slot />
  </div>
</template>
