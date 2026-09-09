<template>
  <slot />
</template>

<script setup lang="ts">
defineOptions({ name: 'DropdownContent' })

defineProps<{
  width?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'auto'
}>()
</script>
