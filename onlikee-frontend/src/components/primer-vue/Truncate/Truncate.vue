<script setup lang="ts">
import { computed, type Component } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    as?: string | Component
    inline?: boolean
    expandable?: boolean
    maxWidth?: number | string
  }>(),
  {
    as: 'div',
    inline: false,
    expandable: false,
    maxWidth: 125,
  },
)

const truncateStyle = computed(() => ({
  '--truncate-max-width':
    typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
}))
</script>

<template>
  <component
    :is="as"
    :class="[$style['truncate']]"
    :data-expandable="expandable ? '' : undefined"
    :data-inline="inline ? '' : undefined"
    :title="title"
    :style="truncateStyle"
  >
    <slot />
  </component>
</template>

<style module src="./Truncate.module.css"></style>
