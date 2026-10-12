<script setup lang="ts">
import { useAttrs } from 'vue'
import type { BlankslateHeadingComponentProps } from './types'

defineOptions({ name: 'BlankslateHeading', inheritAttrs: false })
withDefaults(defineProps<BlankslateHeadingComponentProps>(), { as: 'h2' })
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
</script>

<template>
  <component
    :is="as"
    v-bind="attrs"
    :class="['Blankslate-Heading', $style.Heading, className]"
    data-component="Blankslate.Heading"
  >
    <slot />
  </component>
</template>

<style module src="./Blankslate.module.css" />
