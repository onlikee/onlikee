<script setup lang="ts">
import { shallowRef, useAttrs } from 'vue'
import type { CardElementComponentProps } from './types'
import classes from './Card.module.css'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'CardMetadata', inheritAttrs: false })
defineProps<CardElementComponentProps>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const element = shallowRef<HTMLDivElement | null>(null)
defineExpose({ element })
</script>

<template>
  <div
    ref="element"
    v-bind="attrs"
    :class="[classes.CardMetadataItem, className]"
    :style="normalizeReactStyle(attrs.style)"
    data-component="Card.Metadata"
  >
    <slot />
  </div>
</template>
