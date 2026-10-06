<script setup lang="ts">
defineOptions({ name: 'VisuallyHidden' })
withDefaults(defineProps<{ className?: string }>(), { className: undefined })
</script>
<template>
  <span :class="['visually-hidden', className]"><slot /></span>
</template>
<style src="./VisuallyHidden.css" />
