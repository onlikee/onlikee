<script setup lang="ts">
import { useAttrs } from 'vue'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'BannerDescription', inheritAttrs: false })
defineProps<{ className?: string }>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
</script>

<template>
  <div
    v-bind="attrs"
    :class="['BannerDescription', className, attrs.class]"
    :style="normalizeReactStyle(attrs.style)"
    data-component="Banner.Description"
  >
    <slot />
  </div>
</template>
