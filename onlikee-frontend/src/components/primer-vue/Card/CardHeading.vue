<script setup lang="ts">
import { inject, shallowRef, useAttrs } from 'vue'
import { cardContextKey } from './context'
import type { CardHeadingComponentProps } from './types'
import classes from './Card.module.css'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'CardHeading', inheritAttrs: false })
withDefaults(defineProps<CardHeadingComponentProps>(), { as: 'h3' })
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const context = inject(cardContextKey, undefined)
const element = shallowRef<HTMLHeadingElement | null>(null)
defineExpose({ element })
</script>

<template>
  <component
    :is="as"
    :id="id ?? context?.titleId.value"
    ref="element"
    v-bind="attrs"
    :class="[classes.CardHeading, className]"
    :style="normalizeReactStyle(attrs.style)"
    data-component="Card.Heading"
  >
    <slot />
  </component>
</template>
