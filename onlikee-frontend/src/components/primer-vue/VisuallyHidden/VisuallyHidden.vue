<script setup lang="ts">
defineOptions({ name: 'VisuallyHidden' })
withDefaults(defineProps<{ className?: string }>(), { className: undefined })
</script>
<template>
  <span :class="[$style['visually-hidden'], className]"><slot /></span>
</template>
<style module src="./VisuallyHidden.module.css" />
