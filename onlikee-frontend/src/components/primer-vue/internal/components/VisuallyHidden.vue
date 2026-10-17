<script setup lang="ts">
import type { Component } from 'vue'
withDefaults(defineProps<{ isVisible?: boolean; as?: string | Component; className?: string }>(), {
  isVisible: false,
  as: 'span',
  className: undefined,
})
</script>
<template>
  <component :is="as || 'span'" :class="[className, { 'internal-visually-hidden': !isVisible }]">
    <slot />
  </component>
</template>
<style module src="./VisuallyHidden.module.css" />
