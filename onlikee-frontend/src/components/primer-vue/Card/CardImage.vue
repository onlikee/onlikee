<script setup lang="ts">
import { useAttrs } from 'vue'
import type { CardImageComponentProps } from './types'
import classes from './Card.module.css'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'CardImage', inheritAttrs: false })
withDefaults(defineProps<CardImageComponentProps>(), { alt: '' })
const attrs = useAttrs()
</script>

<template>
  <img
    v-bind="attrs"
    :src="src"
    :alt="alt"
    :class="[classes.CardImage, className]"
    :style="normalizeReactStyle(attrs.style)"
    data-component="Card.Image"
  />
</template>
