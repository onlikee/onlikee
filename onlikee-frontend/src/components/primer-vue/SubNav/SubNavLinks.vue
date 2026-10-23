<script setup lang="ts">
import { shallowRef } from 'vue'
import { normalizeReactStyle } from '../internal/style'
import type { SubNavLinksOptions } from './types'

defineOptions({ name: 'SubNavLinks', inheritAttrs: false })
defineProps<SubNavLinksOptions>()
const element = shallowRef<HTMLDivElement | null>(null)
defineExpose({ element })
</script>

<template>
  <div
    ref="element"
    :class="[className, $style.Links]"
    v-bind="$attrs"
    :style="normalizeReactStyle($attrs.style)"
    data-component="SubNav.Links"
  >
    <slot />
  </div>
</template>

<style module src="./SubNav.module.css" />
