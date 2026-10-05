<script setup lang="ts">
import { computed } from 'vue'
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden.vue'

// Primer React 8c0b708: CounterLabel/CounterLabel.tsx 直译。
// 可视计数徽章（aria-hidden）+ 屏幕阅读器文本 " (n)"。
defineOptions({ name: 'CounterLabel', inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    /** @deprecated use variant instead */
    scheme?: 'primary' | 'secondary'
    variant?: 'primary' | 'secondary'
    className?: string
    dataComponent?: string
  }>(),
  { scheme: undefined, variant: undefined, className: undefined, dataComponent: undefined },
)
const inferredVariant = computed(() => props.variant || props.scheme || 'secondary')
</script>
<template>
  <!-- React counterProps 顺序：aria-hidden/data-variant 在前、rest 可覆盖；data-component/className 固定在后 -->
  <span
    aria-hidden="true"
    :data-variant="inferredVariant"
    v-bind="$attrs"
    :data-component="dataComponent ?? 'CounterLabel'"
    :class="['counter-label', className]"
  ><slot /></span>
  <VisuallyHidden>&nbsp;(<slot />)</VisuallyHidden>
</template>
<style src="./CounterLabel.css" />
