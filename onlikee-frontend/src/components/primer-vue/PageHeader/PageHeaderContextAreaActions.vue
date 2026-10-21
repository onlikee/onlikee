<script setup lang="ts">
import { computed } from 'vue'
import type { PageHeaderChildProps } from './types'
import { getHiddenDataAttributes, hiddenOnRegularAndWide } from './responsive'

defineOptions({ name: 'PageHeaderContextAreaActions' })
const props = withDefaults(defineProps<PageHeaderChildProps>(), {
  hidden: () => hiddenOnRegularAndWide,
})
defineSlots<{ default?: () => unknown }>()
const hiddenAttributes = computed(() => getHiddenDataAttributes(props.hidden))
</script>

<template>
  <div
    :class="[$style.ContextAreaActions, className]"
    data-component="PageHeader.ContextAreaActions"
    v-bind="hiddenAttributes"
  >
    <slot />
  </div>
</template>

<style module src="./PageHeader.module.css" />
