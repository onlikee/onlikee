<script setup lang="ts">
import { shallowRef, useAttrs } from 'vue'
import type { CardElementComponentProps } from './types'
import classes from './Card.module.css'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'CardDescription', inheritAttrs: false })
defineProps<CardElementComponentProps>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const element = shallowRef<HTMLParagraphElement | null>(null)
defineExpose({ element })
</script>

<template>
  <p
    ref="element"
    v-bind="attrs"
    :class="[classes.CardDescription, className]"
    :style="normalizeReactStyle(attrs.style)"
    data-component="Card.Description"
  >
    <slot />
  </p>
</template>
