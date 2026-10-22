<script setup lang="ts">
import { provide } from 'vue'
import { segmentedControlActionContext } from './context'

const props = defineProps<{ variant: 'inline' | 'menu' }>()
provide(segmentedControlActionContext, props.variant)
</script>

<template><slot /></template>
