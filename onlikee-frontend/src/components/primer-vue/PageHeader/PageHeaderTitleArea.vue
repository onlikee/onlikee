<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { getHiddenDataAttributes, getResponsiveAttributes } from './responsive'
import type { TitleAreaProps } from './types'

defineOptions({ name: 'PageHeaderTitleArea' })
const props = withDefaults(defineProps<TitleAreaProps>(), { hidden: false, variant: 'medium' })
defineSlots<{ default?: () => unknown }>()
const element = shallowRef<HTMLDivElement | null>(null)
const responsiveAttributes = computed(() => ({
  ...getResponsiveAttributes('size-variant', props.variant),
  ...getHiddenDataAttributes(props.hidden),
}))
defineExpose({ element })
</script>

<template>
  <div
    ref="element"
    :class="[$style.TitleArea, className]"
    data-component="TitleArea"
    v-bind="responsiveAttributes"
  >
    <slot />
  </div>
</template>

<style module src="./PageHeader.module.css" />
