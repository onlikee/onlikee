<script setup lang="ts">
import { computed } from 'vue'
import type { PageHeaderChildProps } from './types'
import { getHiddenDataAttributes, hiddenOnRegularAndWide } from './responsive'

defineOptions({ name: 'PageHeaderContextBar' })
const props = withDefaults(defineProps<PageHeaderChildProps>(), {
  hidden: () => hiddenOnRegularAndWide,
})
defineSlots<{ default?: () => unknown }>()
const hiddenAttributes = computed(() => getHiddenDataAttributes(props.hidden))
</script>

<template>
  <div
    :class="[$style.ContextBar, className]"
    data-component="PageHeader.ContextBar"
    v-bind="hiddenAttributes"
  >
    <slot />
  </div>
</template>

<style module src="./PageHeader.module.css" />
