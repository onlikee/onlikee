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

<style scoped src="./StackItem.css"></style>
