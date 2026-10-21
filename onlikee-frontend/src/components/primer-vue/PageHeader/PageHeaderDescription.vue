<script setup lang="ts">
import { computed } from 'vue'
import type { PageHeaderChildProps } from './types'
import { getHiddenDataAttributes } from './responsive'

defineOptions({ name: 'PageHeaderDescription' })
const props = withDefaults(defineProps<PageHeaderChildProps>(), { hidden: false })
defineSlots<{ default?: () => unknown }>()
const hiddenAttributes = computed(() => getHiddenDataAttributes(props.hidden))
</script>

<template>
  <div
    :class="[$style.Description, className]"
    data-component="PageHeader.Description"
    v-bind="hiddenAttributes"
  >
    <slot />
  </div>
</template>

<style module src="./PageHeader.module.css" />
