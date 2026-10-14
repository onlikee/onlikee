<script setup lang="ts">
import { computed, provide } from 'vue'
import { portalContextKey, type PortalContextValue } from './context'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ value: PortalContextValue }>()
defineSlots<{ default?: () => unknown }>()
provide(
  portalContextKey,
  computed(() => props.value),
)
</script>

<template><slot /></template>
