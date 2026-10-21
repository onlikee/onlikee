<script setup lang="ts">
import { useAttrs } from 'vue'
import type { PageheadOptions } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'Pagehead', inheritAttrs: false })
const props = defineProps<PageheadOptions>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
</script>

<template>
  <component
    :is="props.as === undefined ? 'div' : props.as"
    :class="[$style.Pagehead, props.className]"
    data-component="Pagehead"
    v-bind="attrs"
    :style="
      typeof props.as === 'string' || props.as === undefined
        ? normalizeReactStyle(attrs.style)
        : attrs.style
    "
  >
    <slot />
  </component>
</template>

<style module src="./Pagehead.module.css" />
