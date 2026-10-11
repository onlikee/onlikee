<script setup lang="ts">
defineOptions({ name: 'VisuallyHidden' })
withDefaults(defineProps<{ className?: string }>(), { className: undefined })
</script>
<template>
  <span :class="[className, $style['visually-hidden']]"><slot /></span>
</template>
<style module src="./VisuallyHidden.module.css" />
