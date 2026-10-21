<script setup lang="ts">
import { computed } from 'vue'
import type { PageHeaderChildProps } from './types'
import { getHiddenDataAttributes } from './responsive'

defineOptions({ name: 'PageHeaderTrailingVisual' })
const props = withDefaults(defineProps<PageHeaderChildProps>(), { hidden: false })
defineSlots<{ default?: () => unknown }>()
const hiddenAttributes = computed(() => getHiddenDataAttributes(props.hidden))
</script>

<template>
  <div
    :class="[$style.TrailingVisual, className]"
    data-component="PH_TrailingVisual"
    v-bind="hiddenAttributes"
  >
    <slot />
  </div>
</template>

<style module src="./PageHeader.module.css" />
