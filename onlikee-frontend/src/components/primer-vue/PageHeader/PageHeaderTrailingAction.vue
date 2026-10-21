<script setup lang="ts">
import { computed } from 'vue'
import type { PageHeaderChildProps } from './types'
import { getHiddenDataAttributes, hiddenOnNarrow } from './responsive'

defineOptions({ name: 'PageHeaderTrailingAction' })
const props = withDefaults(defineProps<PageHeaderChildProps>(), { hidden: () => hiddenOnNarrow })
defineSlots<{ default?: () => unknown }>()
const hiddenAttributes = computed(() => getHiddenDataAttributes(props.hidden))
</script>

<template>
  <div
    :class="[$style.TrailingAction, className]"
    data-component="PH_TrailingAction"
    v-bind="hiddenAttributes"
  >
    <slot />
  </div>
</template>

<style module src="./PageHeader.module.css" />
