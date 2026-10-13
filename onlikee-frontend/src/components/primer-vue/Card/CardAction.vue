<script setup lang="ts">
defineOptions({ name: 'CardAction', inheritAttrs: false })
defineSlots<{ default?: () => unknown }>()
</script>

<template>
  <div data-component="Card.Action"><slot /></div>
</template>
