<script setup lang="ts">
import { computed } from 'vue'
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden.vue'

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
  <span
    aria-hidden="true"
    :data-variant="inferredVariant"
    v-bind="$attrs"
    :data-component="dataComponent ?? 'CounterLabel'"
    :class="[$style['counter-label'], className]"
    ><slot
  /></span>
  <VisuallyHidden>&nbsp;(<slot />)</VisuallyHidden>
</template>
<style module src="./CounterLabel.module.css" />
