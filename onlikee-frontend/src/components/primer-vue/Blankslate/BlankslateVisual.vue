<script setup lang="ts">
import { useAttrs } from 'vue'
import type { BlankslateElementComponentProps } from './types'

defineOptions({ name: 'BlankslateVisual', inheritAttrs: false })
defineProps<BlankslateElementComponentProps>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
</script>

<template>
  <span
    v-bind="attrs"
    :class="['Blankslate-Visual', $style.Visual, className]"
    data-component="Blankslate.Visual"
  >
    <slot />
  </span>
</template>

<style module src="./Blankslate.module.css" />
