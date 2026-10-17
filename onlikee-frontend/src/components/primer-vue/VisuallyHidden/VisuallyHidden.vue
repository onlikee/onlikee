<script setup lang="ts">
import type { VisuallyHiddenProps } from './types'
defineOptions({ name: 'VisuallyHidden' })
withDefaults(defineProps<VisuallyHiddenProps>(), { className: undefined })
</script>
<template>
  <span :class="[className, $style['visually-hidden']]"><slot /></span>
</template>
<style module src="./VisuallyHidden.module.css" />
