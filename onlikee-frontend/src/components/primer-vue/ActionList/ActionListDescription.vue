<template>
  <slot />
</template>

<script setup lang="ts">
import type { ActionListDescriptionVariant } from './context'

defineOptions({ name: 'ActionListDescription' })

withDefaults(
  defineProps<{
    variant?: ActionListDescriptionVariant
    truncate?: boolean
  }>(),
  {
    variant: 'inline',
    truncate: false
  }
)
</script>
