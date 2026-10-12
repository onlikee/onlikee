<script setup lang="ts">
import { useAttrs } from 'vue'
import type { BlankslateElementComponentProps } from './types'

defineOptions({ name: 'BlankslateDescription', inheritAttrs: false })
defineProps<BlankslateElementComponentProps>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
</script>

<template>
  <p
    v-bind="attrs"
    :class="['Blankslate-Description', $style.Description, className]"
    data-component="Blankslate.Description"
  >
    <slot />
  </p>
</template>

<style module src="./Blankslate.module.css" />
