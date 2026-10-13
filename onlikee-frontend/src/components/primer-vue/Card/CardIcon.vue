<script setup lang="ts">
import { useAttrs } from 'vue'
import type { CardIconProps } from './types'
import classes from './Card.module.css'

defineOptions({ name: 'CardIcon', inheritAttrs: false })
const props = defineProps<CardIconProps>()
const normalizedProps = props as typeof props & { ariaLabel?: string }
const attrs = useAttrs()
</script>

<template>
  <span
    :class="[classes.CardIcon, className, attrs.class]"
    data-component="Card.Icon"
    :role="normalizedProps.ariaLabel ? 'img' : undefined"
    :aria-label="normalizedProps.ariaLabel"
    :aria-hidden="!normalizedProps.ariaLabel"
  >
    <component :is="icon" />
  </span>
</template>
