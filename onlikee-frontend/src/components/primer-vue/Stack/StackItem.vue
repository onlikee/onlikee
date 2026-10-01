<script setup lang="ts">
import { computed } from 'vue'
import { getResponsiveAttributes } from './responsive'
import type { StackItemProps } from './types'

const props = withDefaults(defineProps<StackItemProps>(), {
  as: 'div', grow: false, shrink: true
})
const responsiveAttributes = computed(() => ({
  ...getResponsiveAttributes('grow', props.grow),
  ...getResponsiveAttributes('shrink', props.shrink)
}))
</script>

<template>
  <component
    :is="as"
    class="stack-item"
    data-component="StackItem"
    v-bind="responsiveAttributes"
  >
    <slot />
  </component>
</template>

<style scoped>
.stack-item {
  flex: 0 1 auto;
  min-inline-size: 0;
}

.stack-item[data-grow='true'],
.stack-item[data-grow-narrow='true'] { flex-grow: 1; }

.stack-item[data-grow='false'],
.stack-item[data-grow-narrow='false'] { flex-grow: 0; }

.stack-item[data-shrink='true'],
.stack-item[data-shrink-narrow='true'] { flex-shrink: 1; }

.stack-item[data-shrink='false'],
.stack-item[data-shrink-narrow='false'] { flex-shrink: 0; }

@media (min-width: 768px) {
  .stack-item[data-grow-regular='true'] { flex-grow: 1; }

  .stack-item[data-grow-regular='false'] { flex-grow: 0; }

  .stack-item[data-shrink-regular='true'] { flex-shrink: 1; }

  .stack-item[data-shrink-regular='false'] { flex-shrink: 0; }
}

@media (min-width: 1400px) {
  .stack-item[data-grow-wide='true'] { flex-grow: 1; }

  .stack-item[data-grow-wide='false'] { flex-grow: 0; }

  .stack-item[data-shrink-wide='true'] { flex-shrink: 1; }

  .stack-item[data-shrink-wide='false'] { flex-shrink: 0; }
}
</style>
